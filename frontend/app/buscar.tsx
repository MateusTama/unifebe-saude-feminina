import { useState, useMemo } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from './components/Header';
import Input from './components/Input';
import ComboBox from './components/ComboBox';
import Chip from './components/Chip';
import ArticleCard, { Artigo } from './components/ArticleCard';
import BottomNavBar from './components/BottomNavBar';
import { cores, tipografia, espacamento } from './styles/theme';

// Dados mockados — 10 artigos com temas variados
const ARTIGOS_MOCK: Artigo[] = [
  {
    id: '1',
    titulo: 'Entendendo o Ciclo Menstrual',
    descricao: 'Aprenda sobre as fases do ciclo menstrual e como seu corpo muda ao longo do mês. Conheça os hormônios envolvidos e o que é considerado normal.',
    icone: '🌸',
    palavrasChave: ['ciclo', 'menstruação', 'hormônios', 'fases'],
    tema: 'Menstruação',
  },
  {
    id: '2',
    titulo: 'Cólicas Menstruais: Causas e Alívio',
    descricao: 'Descubra por que as cólicas acontecem e conheça métodos naturais e medicamentosos para aliviar o desconforto durante a menstruação.',
    icone: '💊',
    palavrasChave: ['cólica', 'menstruação', 'dor', 'alívio'],
    tema: 'Menstruação',
  },
  {
    id: '3',
    titulo: 'TPM: Sintomas e Como Lidar',
    descricao: 'A Tensão Pré-Menstrual afeta muitas mulheres. Entenda os sintomas físicos e emocionais e aprenda estratégias para gerenciar melhor esse período.',
    icone: '😌',
    palavrasChave: ['TPM', 'menstruação', 'sintomas', 'humor'],
    tema: 'Menstruação',
  },
  {
    id: '4',
    titulo: 'Primeiros Meses de Gravidez',
    descricao: 'Saiba o que esperar nos primeiros três meses de gestação, desde os sintomas iniciais até os cuidados essenciais com sua saúde e do bebê.',
    icone: '🤰',
    palavrasChave: ['gravidez', 'gestação', 'trimestre', 'cuidados'],
    tema: 'Gravidez',
  },
  {
    id: '5',
    titulo: 'Alimentação na Gravidez',
    descricao: 'Nutrição adequada é fundamental durante a gestação. Conheça os alimentos recomendados e aqueles que devem ser evitados para uma gravidez saudável.',
    icone: '🥗',
    palavrasChave: ['gravidez', 'alimentação', 'nutrição', 'saúde'],
    tema: 'Gravidez',
  },
  {
    id: '6',
    titulo: 'Preparando-se para o Parto',
    descricao: 'Informações sobre os tipos de parto, o que levar para a maternidade e como se preparar física e emocionalmente para o nascimento do bebê.',
    icone: '👶',
    palavrasChave: ['gravidez', 'parto', 'maternidade', 'preparação'],
    tema: 'Gravidez',
  },
  {
    id: '7',
    titulo: 'Pílula Anticoncepcional: Guia Completo',
    descricao: 'Entenda como funciona a pílula anticoncepcional, seus tipos, eficácia, efeitos colaterais e como escolher o método mais adequado para você.',
    icone: '💊',
    palavrasChave: ['contraceptivos', 'pílula', 'hormônios', 'prevenção'],
    tema: 'Contraceptivos',
  },
  {
    id: '8',
    titulo: 'DIU: Tudo Sobre o Dispositivo Intrauterino',
    descricao: 'Conheça os tipos de DIU disponíveis, como funciona a colocação, duração, eficácia e quem pode usar este método contraceptivo de longa duração.',
    icone: '🔒',
    palavrasChave: ['contraceptivos', 'DIU', 'prevenção', 'longa duração'],
    tema: 'Contraceptivos',
  },
  {
    id: '9',
    titulo: 'Menopausa: Uma Nova Fase',
    descricao: 'A menopausa é uma transição natural na vida da mulher. Entenda as mudanças hormonais, sintomas comuns e como manter qualidade de vida nesta fase.',
    icone: '🌺',
    palavrasChave: ['menopausa', 'hormônios', 'sintomas', 'climatério'],
    tema: 'Menopausa',
  },
  {
    id: '10',
    titulo: 'Saúde Íntima e Prevenção de Infecções',
    descricao: 'Aprenda sobre higiene íntima adequada, prevenção de infecções urinárias e vaginais, e quando procurar ajuda médica para manter sua saúde sexual.',
    icone: '🩺',
    palavrasChave: ['saúde sexual', 'prevenção', 'higiene', 'infecções'],
    tema: 'Saúde Sexual',
  },
];

// Opções de tema para o ComboBox
const OPCOES_TEMA = [
  { rotulo: 'Todos os temas', valor: '' },
  { rotulo: 'Menstruação', valor: 'Menstruação' },
  { rotulo: 'Gravidez', valor: 'Gravidez' },
  { rotulo: 'Contraceptivos', valor: 'Contraceptivos' },
  { rotulo: 'Menopausa', valor: 'Menopausa' },
  { rotulo: 'Saúde Sexual', valor: 'Saúde Sexual' },
];

// Palavras-chave populares para seleção rápida
const PALAVRAS_POPULARES = [
  'menstruação',
  'gravidez',
  'contraceptivos',
  'cólica',
  'TPM',
  'fertilidade',
  'menopausa',
  'hormônios',
];

/**
 * Filtra artigos pela busca usando correspondência parcial sem distinção de maiúsculas.
 * Verifica título, descrição e palavras-chave do artigo.
 * Retorna todos os artigos se a busca estiver vazia.
 */
export function filtrarArtigosPorBusca(artigos: Artigo[], busca: string): Artigo[] {
  if (!busca.trim()) {
    return artigos;
  }

  const buscaNormalizada = busca.toLowerCase().trim();

  return artigos.filter((artigo) => {
    const tituloCorresponde = artigo.titulo.toLowerCase().includes(buscaNormalizada);
    const descricaoCorresponde = artigo.descricao.toLowerCase().includes(buscaNormalizada);
    const palavraCorresponde = artigo.palavrasChave.some((palavra) =>
      palavra.toLowerCase().includes(buscaNormalizada)
    );

    return tituloCorresponde || descricaoCorresponde || palavraCorresponde;
  });
}

export default function TelaBuscarArtigos() {
  const [busca, setBusca] = useState('');
  const [temaSelecionado, setTemaSelecionado] = useState<string | null>(null);
  const [palavrasSelecionadas, setPalavrasSelecionadas] = useState<Set<string>>(new Set());
  const [artigosCurtidos, setArtigosCurtidos] = useState<Set<string>>(new Set());

  // Artigos filtrados em tempo real com base na busca
  const artigosFiltrados = useMemo(
    () => filtrarArtigosPorBusca(ARTIGOS_MOCK, busca),
    [busca]
  );

  const alternarPalavra = (palavra: string) => {
    setPalavrasSelecionadas((anterior) => {
      const proximo = new Set(anterior);
      if (proximo.has(palavra)) {
        proximo.delete(palavra);
      } else {
        proximo.add(palavra);
      }
      return proximo;
    });
  };

  const alternarCurtida = (idArtigo: string) => {
    setArtigosCurtidos((anterior) => {
      const proximo = new Set(anterior);
      if (proximo.has(idArtigo)) {
        proximo.delete(idArtigo);
      } else {
        proximo.add(idArtigo);
      }
      return proximo;
    });
  };

  return (
    <View style={estilos.container}>
      <Header nome="Buscar Artigos" editando={false} aoClicarIcone={() => {}} ocultarIcone />

      <ScrollView
        style={estilos.scrollView}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Campo de busca */}
        <View style={[estilos.secao, { zIndex: 30 }]}>
          <Input
            placeholder="Buscar artigos..."
            valor={busca}
            aoMudar={setBusca}
            icone="search"
          />
        </View>

        {/* Filtro por tema — zIndex alto para o dropdown sobrepor as seções abaixo */}
        <View style={[estilos.secao, { zIndex: 20 }]}>
          <Text style={estilos.tituloSecao}>Filtrar por tema</Text>
          <ComboBox
            valor={temaSelecionado}
            aoMudar={setTemaSelecionado}
            itens={OPCOES_TEMA}
            placeholder="Todos os temas"
            zIndex={20}
          />
        </View>

        {/* Palavras-chave populares */}
        <View style={[estilos.secao, { zIndex: 10 }]}>
          <Text style={estilos.tituloSecao}>Palavras-chave populares</Text>
          <View style={estilos.containerPalavras}>
            {PALAVRAS_POPULARES.map((palavra) => (
              <Chip
                key={palavra}
                rotulo={palavra}
                ativo={palavrasSelecionadas.has(palavra)}
                aoPress={() => alternarPalavra(palavra)}
              />
            ))}
          </View>
        </View>

        {/* Lista de artigos */}
        <View style={[estilos.secao, { zIndex: 1 }]}>
          {artigosFiltrados.length === 0 && busca !== '' ? (
            <View style={estilos.estadoVazio}>
              <MaterialIcons name="search-off" size={48} color={cores.mutedForeground} />
              <Text style={estilos.textoEstadoVazio}>Nenhum artigo encontrado</Text>
            </View>
          ) : (
            <FlatList
              data={artigosFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ArticleCard
                  artigo={item}
                  curtido={artigosCurtidos.has(item.id)}
                  aoAlternarCurtida={() => alternarCurtida(item.id)}
                />
              )}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={estilos.separador} />}
            />
          )}
        </View>
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
  scrollView: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: espacamento.md,
    paddingTop: espacamento.md,
    paddingBottom: espacamento.xg,
  },
  secao: {
    marginTop: espacamento.md,
  },
  tituloSecao: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.outfit.medio,
    color: cores.textoPrincipal,
    marginBottom: espacamento.md,
  },
  containerPalavras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
  },
  separador: {
    height: espacamento.md,
  },
  estadoVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamento.gd,
  },
  textoEstadoVazio: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.medio,
    color: cores.mutedForeground,
    marginTop: espacamento.md,
  },
});
