import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { cores, espacamento, tipografia } from './styles/theme';

const ARTIGOS_RECOMENDADOS: Artigo[] = [
  {
    id: '1',
    titulo: 'Entendendo o Ciclo Menstrual',
    descricao:
      'Saiba como funciona o ciclo menstrual e quais mudanças são normais no seu corpo.',
    icone: 'sync',
    palavrasChave: ['menstruação', 'ciclo', 'saúde'],
    tema: 'Menstruação',
  },
  {
    id: '2',
    titulo: 'Métodos Contraceptivos: Guia Completo',
    descricao:
      'Conheça os principais métodos contraceptivos disponíveis no SUS e escolha o melhor para você.',
    icone: 'medication',
    palavrasChave: ['contraceptivos', 'planejamento', 'SUS'],
    tema: 'Contraceptivos',
  },
  {
    id: '3',
    titulo: 'Saúde Mental Feminina',
    descricao:
      'A importância de cuidar da saúde mental e como buscar ajuda quando necessário.',
    icone: 'psychology',
    palavrasChave: ['saúde mental', 'ansiedade', 'bem-estar'],
    tema: 'Saúde Mental',
  },
  {
    id: '4',
    titulo: 'ISTs: Prevenção e Tratamento',
    descricao:
      'Conheça as principais infecções sexualmente transmissíveis e como se proteger.',
    icone: 'health-and-safety',
    palavrasChave: ['IST', 'prevenção', 'camisinha'],
    tema: 'ISTs',
  },
  {
    id: '5',
    titulo: 'Menopausa: O Que Esperar',
    descricao:
      'Entenda as mudanças físicas e emocionais da menopausa e como atravessar essa fase com qualidade de vida.',
    icone: 'self-improvement',
    palavrasChave: ['menopausa', 'hormônios', 'climatério'],
    tema: 'Menopausa',
  },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const { alternarFavorito, eFavorito } = useFavoritos();
  const { ciclos } = useDiario();

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
          <Text style={estilos.saudacaoTitulo}>Olá, Usuária 👋</Text>
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

          <View style={estilos.listaArtigos}>
            {ARTIGOS_RECOMENDADOS.map((artigo) => (
              <ArticleCard
                key={artigo.id}
                artigo={artigo}
                curtido={eFavorito(artigo.id)}
                aoAlternarCurtida={() => alternarFavorito(artigo)}
              />
            ))}
          </View>
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
});
