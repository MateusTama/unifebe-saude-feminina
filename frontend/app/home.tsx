import { useMemo, useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import ArticleCard, { Artigo } from './components/ArticleCard';
import Badge from './components/Badge';
import Alert from './components/Alert';
import BottomNavBar from './components/BottomNavBar';
import InfoList from './components/InfoList';
import { useFavoritos } from './context/FavoritosContext';
import { useDiario } from './context/DiarioContext';
import {
  calcularDuracaoMedia,
  calcularJanelaFertil,
  calcularProximaMenstruacao,
  calcularRegularidade,
  formatarDataCurta,
  formatarJanelaFertil,
  obterUltimoCicloInicio,
} from './services/calculoCiclo';
import { api } from './services/api';
import { borda, cores, espacamento, sombra, tipografia } from './styles/theme';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { alternarFavorito, eFavorito, sincronizarFavoritos } = useFavoritos();
  const { ciclos } = useDiario();

  const [nomeUsuario, setNomeUsuario] = useState('Usuária');
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [carregandoArtigos, setCarregandoArtigos] = useState(true);

  const carregarArtigos = useCallback(async () => {
    setCarregandoArtigos(true);
    try {
      const resposta = await api('/artigos?destaque=true');
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

        const favoritados = resposta.artigos
          .filter((item: any) => item.curtido)
          .map((item: any) => ({
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

        if (favoritados.length > 0 && sincronizarFavoritos) {
          sincronizarFavoritos(favoritados);
        }
      } else {
        setArtigos([]);
      }
    } catch (erro) {
      console.log('Erro ao carregar artigos recomendados:', erro);
      setArtigos([]);
    } finally {
      setCarregandoArtigos(false);
    }
  }, [sincronizarFavoritos]);

  useEffect(() => {
    AsyncStorage.getItem('@usuario').then((dados) => {
      if (dados) {
        try {
          const u = JSON.parse(dados);
          if (u?.nome) {
            const primeiroNome = u.nome.trim().split(' ')[0];
            if (primeiroNome) setNomeUsuario(primeiroNome);
          }
        } catch { }
      }
    });

    carregarArtigos();
  }, [carregarArtigos]);

  const duracaoMedia = useMemo(() => calcularDuracaoMedia(ciclos), [ciclos]);
  const regularidade = useMemo(() => calcularRegularidade(ciclos), [ciclos]);
  const proximaMenstruacao = useMemo(() => calcularProximaMenstruacao(ciclos), [ciclos]);
  const janelaFertil = useMemo(() => calcularJanelaFertil(ciclos), [ciclos]);
  const ultimoCicloInicio = useMemo(() => obterUltimoCicloInicio(ciclos), [ciclos]);

  const itensCiclo = useMemo(() => {
    const itens = [];

    itens.push({
      emoji: '🔴',
      rotulo: 'Último ciclo',
      valor: ultimoCicloInicio ? formatarDataCurta(ultimoCicloInicio) : 'Sem registro',
      destaque: !!ultimoCicloInicio,
    });

    itens.push({
      emoji: '📅',
      rotulo: 'Próxima menstruação',
      valor: proximaMenstruacao ? formatarDataCurta(proximaMenstruacao) : 'Sem dados',
    });

    itens.push({
      emoji: '⏱️',
      rotulo: 'Duração média',
      valor: `${duracaoMedia} dias`,
    });

    itens.push({
      emoji: '📊',
      rotulo: 'Regularidade',
      valor: regularidade
        ? `${regularidade} ${regularidade === 'Regular' ? '✅' : '⚠️'}`
        : 'Sem dados',
      destaque: regularidade === 'Regular',
    });

    itens.push({
      emoji: '🌱',
      rotulo: 'Período fértil',
      valor: janelaFertil ? formatarJanelaFertil(janelaFertil) : 'Sem dados',
    });

    return itens;
  }, [ultimoCicloInicio, proximaMenstruacao, duracaoMedia, regularidade, janelaFertil]);

  return (
    <View style={estilos.container}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={[
          estilos.conteudo,
          { paddingTop: insets.top + espacamento.md, paddingBottom: espacamento.xg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.secaoSaudacao}>
          <Text style={estilos.saudacaoTitulo}>Olá, {nomeUsuario} 👋</Text>
          <Badge rotulo="Vida adulta" variante="primaria" />
        </View>

        {/* ── SEÇÃO: Seu ciclo ── */}
        <View style={estilos.secaoCiclo}>
          <Text style={estilos.secaoTitulo}>Seu ciclo</Text>
          <InfoList itens={itensCiclo} style={{ marginBottom: 0 }} />
        </View>

        {/* ── SEÇÃO: Artigos recomendados para você ── */}
        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Artigos recomendados para você</Text>

          {carregandoArtigos ? (
            <View style={estilos.containerCarregando}>
              <ActivityIndicator size="small" color={cores.primaria} />
              <Text style={estilos.textoCarregando}>Carregando artigos recomendados...</Text>
            </View>
          ) : artigos.length === 0 ? (
            <View style={estilos.containerVazio}>
              <MaterialIcons name="auto-stories" size={40} color={cores.mutedForeground} />
              <Text style={estilos.textoVazio}>
                Não existe nenhum artigo recomendado para você no momento.
              </Text>
            </View>
          ) : (
            <View style={estilos.listaArtigos}>
              {artigos.map((artigo) => (
                <ArticleCard
                  key={artigo.id}
                  artigo={artigo}
                  curtido={eFavorito(artigo.id)}
                  aoAlternarCurtida={() => alternarFavorito(artigo)}
                  aoPressionar={() =>
                    router.push({
                      pathname: '/artigo',
                      params: { id: artigo.id },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>

        <Alert mensagem="Este aplicativo tem caráter informativo e não substitui avaliação médica profissional." />
      </ScrollView>

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
  conteudo: {
    paddingHorizontal: espacamento.md,
    paddingBottom: espacamento.md,
  },

  secaoSaudacao: {
    marginBottom: espacamento.gd,
  },
  saudacaoTitulo: {
    fontSize: tipografia.tamanho2xg,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
    marginBottom: espacamento.pq,
  },

  secao: {
    marginBottom: espacamento.gd,
  },
  secaoCiclo: {
    marginBottom: espacamento.gd,
  },
  secaoTitulo: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: espacamento.pq,
  },

  listaArtigos: {
    gap: espacamento.md,
  },
  containerCarregando: {
    backgroundColor: cores.branco,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.gd,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.pq,
    ...sombra.pq,
  },
  textoCarregando: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    marginTop: espacamento.pq,
  },
  containerVazio: {
    backgroundColor: cores.branco,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.gd,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.pq,
    ...sombra.pq,
  },
  textoVazio: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.medio,
    color: cores.mutedForeground,
    textAlign: 'center',
  },
});
