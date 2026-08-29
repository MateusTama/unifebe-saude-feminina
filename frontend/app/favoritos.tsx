import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import ArticleCard, { Artigo } from './components/ArticleCard';
import { useFavoritos } from './context/FavoritosContext';
import { api } from './services/api';
import { cores, tipografia, espacamento } from './styles/theme';

export default function TelaFavoritos() {
  const router = useRouter();
  const { alternarFavorito, eFavorito, sincronizarFavoritos } = useFavoritos();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [carregandoArtigos, setCarregandoArtigos] = useState(true);

  const carregarFavoritos = useCallback(async () => {
    setCarregandoArtigos(true);
    try {
      const resposta = await api('/artigos/favoritos');
      if (resposta?.artigos && Array.isArray(resposta.artigos)) {
        const formatados: Artigo[] = resposta.artigos.map((item: any) => ({
          id: String(item.id),
          titulo: item.titulo || '',
          descricao: item.conteudo || '',
          icone: item.icone || '',
          palavrasChave: Array.isArray(item.palavras_chave)
            ? item.palavras_chave.map((pc: any) => (typeof pc === 'string' ? pc : pc.nome || ''))
            : [],
          tema:
            typeof item.tema === 'object' && item.tema !== null
              ? item.tema.nome || ''
              : item.tema || '',
        }));

        setArtigos(formatados);

        if (formatados.length > 0 && sincronizarFavoritos) {
          sincronizarFavoritos(formatados);
        }
      } else {
        setArtigos([]);
      }
    } catch (erro) {
      console.log('Erro ao carregar artigos favoritos:', erro);
      setArtigos([]);
    } finally {
      setCarregandoArtigos(false);
    }
  }, [sincronizarFavoritos]);

  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [carregarFavoritos])
  );

  const aoAlternarCurtida = (artigo: Artigo) => {
    alternarFavorito(artigo);
    setArtigos((atuais) => atuais.filter((a) => String(a.id) !== String(artigo.id)));
  };

  const semFavoritos = artigos.length === 0;

  return (
    <View style={estilos.container}>
      <Header nome="Favoritos" editando={false} aoClicarIcone={() => {}} ocultarIcone />

      {carregandoArtigos ? (
        <View style={estilos.containerCarregando}>
          <ActivityIndicator size="small" color={cores.primaria} />
          <Text style={estilos.textoCarregando}>Carregando artigos favoritos...</Text>
        </View>
      ) : semFavoritos ? (
        <View style={estilos.estadoVazio}>
          <MaterialIcons name="favorite" size={64} color={cores.primaria} />
          <Text style={estilos.tituloVazio}>Nenhum favorito ainda</Text>
          <Text style={estilos.subtituloVazio}>
            Toque no coração dos artigos para salvá-los aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={artigos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <ArticleCard
              artigo={item}
              curtido={eFavorito(item.id)}
              aoAlternarCurtida={() => aoAlternarCurtida(item)}
              aoPressionar={() =>
                router.push({
                  pathname: '/artigo',
                  params: { id: item.id },
                })
              }
            />
          )}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
        />
      )}

      <BottomNavBar />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  containerCarregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.pq,
  },
  textoCarregando: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    marginTop: espacamento.pq,
  },
  estadoVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.xg,
    gap: espacamento.pq,
  },
  tituloVazio: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginTop: espacamento.pq,
  },
  subtituloVazio: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    textAlign: 'center',
    lineHeight: tipografia.tamanhoMd * 1.5,
  },
  lista: {
    padding: espacamento.md,
    paddingBottom: espacamento.xg,
  },
  separador: {
    height: espacamento.md,
  },
});
