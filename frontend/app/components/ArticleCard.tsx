import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borda, cores, espacamento, sombra, tipografia } from '../styles/theme';
import Chip from './Chip';
import LikeButton from './LikeButton';

export interface Artigo {
  id: string;
  titulo: string;
  descricao?: string;
  conteudo?: string;
  icone?: string;
  palavrasChave?: string[];
  tema?: string;
}

interface CardArtigoProps {
  artigo: Artigo;
  curtido: boolean;
  aoAlternarCurtida: () => void;
  aoPressionar?: () => void;
}

export default function ArticleCard({
  artigo,
  curtido,
  aoAlternarCurtida,
  aoPressionar,
}: CardArtigoProps) {
  const palavrasExibidas = (artigo.palavrasChave || []).slice(0, 5);
  const temTema = Boolean(artigo.tema && artigo.tema.trim());

  return (
    <TouchableOpacity
      style={estilos.card}
      onPress={aoPressionar}
      activeOpacity={aoPressionar ? 0.7 : 1}
      disabled={!aoPressionar}
    >
      {/* Linha principal: título e tema agrupados + curtir */}
      <View
        style={[
          estilos.cabecalho,
          temTema ? estilos.cabecalhoComTema : estilos.cabecalhoSemTema,
        ]}
      >
        <View style={estilos.blocoTitulo}>
          <Text style={estilos.titulo} numberOfLines={2} ellipsizeMode="tail">
            {artigo.titulo}
          </Text>
          {temTema && (
            <Text style={estilos.subtituloTema}>
              {artigo.tema!.trim()}
            </Text>
          )}
        </View>
        <LikeButton curtido={curtido} aoPress={aoAlternarCurtida} />
      </View>

      {/* Palavras-chave */}
      {palavrasExibidas.length > 0 && (
        <View style={estilos.containerPalavras}>
          {palavrasExibidas.map((palavra, indice) => (
            <Chip key={indice} rotulo={palavra} ativo />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.branco,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.md,
    gap: espacamento.pq,
    ...sombra.pq,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacamento.pq,
  },
  cabecalhoComTema: {
    alignItems: 'flex-start',
  },
  cabecalhoSemTema: {
    alignItems: 'center',
  },
  blocoTitulo: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 16,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
  },
  subtituloTema: {
    fontSize: 12,
    fontFamily: tipografia.inter.regular,
    color: 'rgb(100, 116, 139)',
  },
  containerPalavras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
  },
});
