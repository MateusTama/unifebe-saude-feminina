import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import ArticleCard, { Artigo } from './components/ArticleCard';
import { cores, tipografia, espacamento } from './styles/theme';

const ARTIGOS_FAVORITOS: Artigo[] = [];

export default function TelaFavoritos() {
  const semFavoritos = ARTIGOS_FAVORITOS.length === 0;

  return (
    <View style={estilos.container}>
      <Header nome="Favoritos" editando={false} aoClicarIcone={() => {}} ocultarIcone />

      {semFavoritos ? (
        <View style={estilos.estadoVazio}>
          <MaterialIcons name="favorite" size={64} color={cores.primaria} />
          <Text style={estilos.tituloVazio}>Nenhum favorito ainda</Text>
          <Text style={estilos.subtituloVazio}>
            Toque no coração dos artigos para salvá-los aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={ARTIGOS_FAVORITOS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <ArticleCard
              artigo={item}
              curtido
              aoAlternarCurtida={() => {}}
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
