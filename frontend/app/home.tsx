import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArticleCard, { Artigo } from './components/ArticleCard';
import Badge from './components/Badge';
import Alert from './components/Alert';
import BottomNavBar from './components/BottomNavBar';
import Card from './components/Card';
import { borda, cores, espacamento, sombra, tipografia } from './styles/theme';

interface Tema {
  id: string;
  nome: string;
  icone: React.ComponentProps<typeof MaterialIcons>['name'];
  corIcone: string;
}

const TEMAS_DESTAQUE: Tema[] = [
  { id: '1', nome: 'Menstruação',  icone: 'water-drop',       corIcone: cores.secundaria },
  { id: '2', nome: 'Gravidez',     icone: 'pregnant-woman',   corIcone: cores.primaria   },
  { id: '3', nome: 'Saúde Mental', icone: 'psychology',       corIcone: cores.primaria   },
  { id: '4', nome: 'ISTs',         icone: 'health-and-safety', corIcone: cores.primaria  },
  { id: '5', nome: 'Menopausa',    icone: 'self-improvement', corIcone: cores.secundaria },
];

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
  const [curtidos, setCurtidos] = useState<Set<string>>(new Set());

  const alternarCurtida = (id: string) => {
    setCurtidos((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  return (
    <View style={estilos.container}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={[
          estilos.conteudo,
          { paddingTop: insets.top + espacamento.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.secaoSaudacao}>
          <Text style={estilos.saudacaoTitulo}>Olá, Usuária 👋</Text>
          <Badge rotulo="Vida adulta" variante="primaria" />
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Temas em destaque</Text>
          <View style={estilos.gradeDestaque}>
            {TEMAS_DESTAQUE.map((tema) => (
              <Card key={tema.id} nome={tema.nome} icone={tema.icone} corIcone={tema.corIcone} />
            ))}
          </View>
        </View>

        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Recomendados para você</Text>
          <View style={estilos.listaArtigos}>
            {ARTIGOS_RECOMENDADOS.map((artigo) => (
              <ArticleCard
                key={artigo.id}
                artigo={artigo}
                curtido={curtidos.has(artigo.id)}
                aoAlternarCurtida={() => alternarCurtida(artigo.id)}
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
  secaoTitulo: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: espacamento.pq,
  },
  subsecaoRotulo: {
    fontSize: tipografia.tamanhoXp,
    fontFamily: tipografia.inter.semibold,
    color: cores.primaria,
    letterSpacing: 0.8,
    marginBottom: espacamento.pq,
  },

  gradeDestaque: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
  },
  listaArtigos: {
    gap: espacamento.md,
  },

});
