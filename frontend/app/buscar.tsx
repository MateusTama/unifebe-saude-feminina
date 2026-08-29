import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Header from './components/Header';
import Input from './components/Input';
import ComboBox from './components/ComboBox';
import Chip from './components/Chip';
import ArticleCard, { Artigo } from './components/ArticleCard';
import BottomNavBar from './components/BottomNavBar';
import { useFavoritos } from './context/FavoritosContext';
import { api } from './services/api';
import { borda, cores, espacamento, sombra, tipografia } from './styles/theme';

interface TemaAPI {
  id: number;
  nome: string;
  descricao?: string;
  destaque?: boolean;
}

interface PalavraChaveAPI {
  id: number;
  nome: string;
}

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
    const descricaoCorresponde = (artigo.descricao || '').toLowerCase().includes(buscaNormalizada);
    const palavraCorresponde = (artigo.palavrasChave || []).some((palavra) =>
      palavra.toLowerCase().includes(buscaNormalizada)
    );

    return tituloCorresponde || descricaoCorresponde || palavraCorresponde;
  });
}

export default function TelaBuscarArtigos() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [temaSelecionado, setTemaSelecionado] = useState<string | null>(null);
  const [palavrasSelecionadasIds, setPalavrasSelecionadasIds] = useState<Set<number>>(new Set());
  const [temas, setTemas] = useState<TemaAPI[]>([]);
  const [palavrasChave, setPalavrasChave] = useState<PalavraChaveAPI[]>([]);
  const [carregandoFiltros, setCarregandoFiltros] = useState(true);

  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [carregandoArtigos, setCarregandoArtigos] = useState(true);

  const { alternarFavorito, eFavorito, sincronizarFavoritos } = useFavoritos();

  useEffect(() => {
    carregarFiltros();
  }, []);

  const carregarFiltros = async () => {
    setCarregandoFiltros(true);
    try {
      const [resTemas, resPalavras] = await Promise.all([
        api('/temas').catch(() => ({ temas: [] })),
        api('/palavras-chave').catch(() => ({ palavras_chave: [] })),
      ]);

      if (resTemas?.temas && Array.isArray(resTemas.temas)) {
        setTemas(resTemas.temas);
      }

      if (resPalavras?.palavras_chave && Array.isArray(resPalavras.palavras_chave)) {
        const validas: PalavraChaveAPI[] = resPalavras.palavras_chave
          .filter((p: any) => p && typeof p.id === 'number' && typeof p.nome === 'string');
        setPalavrasChave(validas);
      }
    } catch (erro) {
      console.log('Erro ao carregar filtros da API:', erro);
    } finally {
      setCarregandoFiltros(false);
    }
  };

  const carregarArtigos = useCallback(
    async (termoBusca: string, idTema: string | null, idsPalavras: Set<number>) => {
      setCarregandoArtigos(true);
      try {
        const params = new URLSearchParams();

        if (termoBusca.trim()) {
          params.append('titulo', termoBusca.trim());
        }

        if (idTema && idTema !== '') {
          params.append('tema_id', idTema);
        }

        if (idsPalavras.size > 0) {
          params.append('palavras_chave_ids', Array.from(idsPalavras).join(','));
        }

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const resposta = await api(`/artigos${queryString}`);

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
        console.log('Erro ao buscar artigos:', erro);
        setArtigos([]);
      } finally {
        setCarregandoArtigos(false);
      }
    },
    [sincronizarFavoritos]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarArtigos(busca, temaSelecionado, palavrasSelecionadasIds);
    }, 300);

    return () => clearTimeout(timer);
  }, [busca, temaSelecionado, palavrasSelecionadasIds, carregarArtigos]);

  const opcoesTema = useMemo(() => {
    const opcoes = [{ rotulo: 'Todos os temas', valor: '' }];
    temas.forEach((t) => {
      if (t.nome) {
        opcoes.push({ rotulo: t.nome, valor: String(t.id) });
      }
    });
    return opcoes;
  }, [temas]);

  const alternarPalavra = (id: number) => {
    setPalavrasSelecionadasIds((anterior) => {
      const proximo = new Set(anterior);
      if (proximo.has(id)) {
        proximo.delete(id);
      } else {
        proximo.add(id);
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
        <View style={[estilos.campoBusca, { zIndex: 30 }]}>
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
            itens={opcoesTema}
            placeholder="Todos os temas"
            zIndex={20}
          />
        </View>

        {/* Palavras-chave populares */}
        <View style={[estilos.secao, { zIndex: 10 }]}>
          <Text style={estilos.tituloSecao}>Palavras-chave populares</Text>
          {carregandoFiltros && palavrasChave.length === 0 ? (
            <ActivityIndicator
              size="small"
              color={cores.primaria}
              style={{ alignSelf: 'flex-start', marginVertical: espacamento.pq }}
            />
          ) : palavrasChave.length === 0 ? (
            <Text style={estilos.textoSemFiltro}>Nenhuma palavra-chave disponível</Text>
          ) : (
            <View style={estilos.containerPalavras}>
              {palavrasChave.map((palavra) => (
                <Chip
                  key={palavra.id}
                  rotulo={palavra.nome}
                  ativo={palavrasSelecionadasIds.has(palavra.id)}
                  aoPress={() => alternarPalavra(palavra.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Lista de artigos */}
        <View style={[estilos.secaoUltima, { zIndex: 1 }]}>
          {carregandoArtigos ? (
            <View style={estilos.containerCarregando}>
              <ActivityIndicator size="small" color={cores.primaria} />
              <Text style={estilos.textoCarregando}>Buscando artigos...</Text>
            </View>
          ) : artigos.length === 0 ? (
            <View style={estilos.estadoVazio}>
              <MaterialIcons name="search-off" size={48} color={cores.mutedForeground} />
              <Text style={estilos.textoEstadoVazio}>Nenhum artigo encontrado</Text>
            </View>
          ) : (
            <FlatList
              data={artigos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ArticleCard
                  artigo={item}
                  curtido={eFavorito(item.id)}
                  aoAlternarCurtida={() => alternarFavorito(item)}
                  aoPressionar={() =>
                    router.push({
                      pathname: '/artigo',
                      params: { id: item.id },
                    })
                  }
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
  campoBusca: {
    marginBottom: espacamento.md,
  },
  secao: {
    marginBottom: espacamento.gd,
  },
  secaoUltima: {
    marginBottom: 0,
  },
  tituloSecao: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: espacamento.pq,
  },
  containerPalavras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
  },
  separador: {
    height: espacamento.md,
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
  textoSemFiltro: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },
});
