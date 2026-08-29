import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import Chip from './components/Chip';
import Alert from './components/Alert';
import { Artigo } from './components/ArticleCard';
import { useFavoritos } from './context/FavoritosContext';
import { api } from './services/api';
import { borda, cores, espacamento, tipografia } from './styles/theme';

export default function TelaArtigo() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { eFavorito, alternarFavorito, sincronizarFavoritos } = useFavoritos();

  const [artigo, setArtigo] = useState<Artigo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const larguraConteudo = Math.max(width - espacamento.md * 2, 280);

  const carregarArtigo = useCallback(async () => {
    if (!params.id) {
      setErro('Artigo não especificado.');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const resposta = await api(`/artigos/${params.id}`);
      if (resposta?.artigo) {
        const item = resposta.artigo;
        const formatado: Artigo = {
          id: String(item.id),
          titulo: item.titulo || '',
          descricao: item.conteudo || '',
          icone: item.icone || '',
          palavrasChave: Array.isArray(item.palavras_chave)
            ? item.palavras_chave.map((pc: any) =>
                typeof pc === 'string' ? pc : pc.nome || ''
              )
            : [],
          tema:
            typeof item.tema === 'object' && item.tema !== null
              ? item.tema.nome || ''
              : item.tema || '',
        };

        setArtigo(formatado);

        if (item.curtido && sincronizarFavoritos) {
          sincronizarFavoritos([formatado]);
        }
      } else {
        setErro('Artigo não encontrado.');
      }
    } catch (err: any) {
      console.log('Erro ao carregar artigo:', err);
      setErro(err?.message || 'Erro ao carregar artigo.');
    } finally {
      setCarregando(false);
    }
  }, [params.id, sincronizarFavoritos]);

  useEffect(() => {
    carregarArtigo();
  }, [carregarArtigo]);

  const renderersProps = {
    a: {
      onPress: (_event: any, href: string) => {
        if (href) {
          Linking.openURL(href).catch((err) =>
            console.log('Não foi possível abrir o link:', err)
          );
        }
      },
    },
  };

  const tagsStyles = {
    body: {
      color: cores.textoPrincipal,
      fontFamily: tipografia.inter.regular,
      fontSize: 16,
      lineHeight: 24,
    },
    p: {
      margin: 0,
      marginBottom: 12,
      color: cores.textoPrincipal,
      fontFamily: tipografia.inter.regular,
      fontSize: 16,
      lineHeight: 24,
    },
    h1: {
      color: cores.textoPrincipal,
      fontFamily: tipografia.outfit.negrito,
      fontSize: 22,
      lineHeight: 28,
      marginTop: 16,
      marginBottom: 8,
    },
    h2: {
      color: cores.textoPrincipal,
      fontFamily: tipografia.outfit.semibold,
      fontSize: 18,
      lineHeight: 24,
      marginTop: 14,
      marginBottom: 6,
    },
    h3: {
      color: cores.textoPrincipal,
      fontFamily: tipografia.outfit.semibold,
      fontSize: 16,
      lineHeight: 22,
      marginTop: 12,
      marginBottom: 4,
    },
    strong: {
      fontFamily: tipografia.inter.semibold,
      color: cores.textoPrincipal,
    },
    b: {
      fontFamily: tipografia.inter.semibold,
      color: cores.textoPrincipal,
    },
    a: {
      color: cores.primaria,
      fontFamily: tipografia.inter.medio,
      textDecorationLine: 'underline' as const,
    },
    ul: {
      marginVertical: 8,
      paddingLeft: 16,
    },
    ol: {
      marginVertical: 8,
      paddingLeft: 16,
    },
    li: {
      color: cores.textoPrincipal,
      fontFamily: tipografia.inter.regular,
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 4,
    },
    img: {
      maxWidth: '100%',
      borderRadius: borda.pq,
      marginVertical: 8,
    },
  };

  const estaCurtido = artigo ? eFavorito(artigo.id) : false;

  return (
    <View style={estilos.container}>
      <Header
        nome="Artigo"
        mostrarVoltar
        aoVoltar={() => router.back()}
        iconeDireita={estaCurtido ? 'favorite' : 'favorite-border'}
        corIconeDireita={estaCurtido ? cores.secundaria : cores.mutedForeground}
        aoClicarIcone={() => {
          if (artigo) alternarFavorito(artigo);
        }}
        ocultarIcone={!artigo}
      />

      {carregando ? (
        <View style={estilos.containerCarregando}>
          <ActivityIndicator size="large" color={cores.primaria} />
          <Text style={estilos.textoCarregando}>Carregando artigo...</Text>
        </View>
      ) : erro || !artigo ? (
        <View style={estilos.containerErro}>
          <MaterialIcons name="error-outline" size={48} color={cores.destrutivo} />
          <Text style={estilos.textoErro}>{erro || 'Artigo não encontrado.'}</Text>
        </View>
      ) : (
        <ScrollView
          style={estilos.scroll}
          contentContainerStyle={estilos.conteudoScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Título do artigo - Sem ícone à esquerda */}
          <Text style={estilos.tituloArtigo}>{artigo.titulo}</Text>

          {/* Palavras-chave / Tags */}
          {artigo.palavrasChave && artigo.palavrasChave.length > 0 && (
            <View style={estilos.containerPalavras}>
              {artigo.palavrasChave.map((palavra, index) => (
                <Chip key={index} rotulo={palavra} ativo />
              ))}
            </View>
          )}

          {/* Conteúdo em HTML */}
          <View style={estilos.conteudoHtml}>
            <RenderHtml
              contentWidth={larguraConteudo}
              source={{ html: artigo.descricao || '<p>Sem conteúdo disponível.</p>' }}
              renderersProps={renderersProps}
              tagsStyles={tagsStyles}
            />
          </View>

          {/* Alerta informativo médico */}
          <View style={estilos.containerAlerta}>
            <Alert mensagem="Este conteúdo tem caráter informativo e não substitui avaliação médica." />
          </View>
        </ScrollView>
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
  scroll: {
    flex: 1,
  },
  conteudoScroll: {
    paddingHorizontal: espacamento.md,
    paddingTop: espacamento.gd,
    paddingBottom: espacamento.xg,
  },
  tituloArtigo: {
    fontSize: tipografia.tamanho2xg,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
    marginBottom: espacamento.md,
    lineHeight: tipografia.tamanho2xg * 1.25,
  },
  containerPalavras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
    marginBottom: espacamento.gd,
  },
  conteudoHtml: {
  },
  containerAlerta: {
    marginTop: espacamento.md,
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
  containerErro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.xg,
    gap: espacamento.pq,
  },
  textoErro: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.medio,
    color: cores.destrutivo,
    textAlign: 'center',
  },
});

