import { View, Text, StyleSheet } from 'react-native';
import { cores, tipografia, espacamento, borda, sombra } from '../styles/theme';
import Chip from './Chip';
import LikeButton from './LikeButton';

export interface Artigo {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  palavrasChave: string[];
  tema: string;
}

interface CardArtigoProps {
  artigo: Artigo;
  curtido: boolean;
  aoAlternarCurtida: () => void;
}

export default function ArticleCard({ artigo, curtido, aoAlternarCurtida }: CardArtigoProps) {
  // Exibe até 3 palavras-chave
  const palavrasExibidas = artigo.palavrasChave.slice(0, 3);

  return (
    <View style={estilos.card}>
      {/* Cabeçalho: título e botão de curtir na mesma linha */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.titulo} numberOfLines={2} ellipsizeMode="tail">
          {artigo.titulo}
        </Text>
        <LikeButton curtido={curtido} aoPress={aoAlternarCurtida} />
      </View>

      {/* Descrição */}
      <Text style={estilos.descricao} numberOfLines={3} ellipsizeMode="tail">
        {artigo.descricao}
      </Text>

      {/* Palavras-chave */}
      {palavrasExibidas.length > 0 && (
        <View style={estilos.containerPalavras}>
          {palavrasExibidas.map((palavra, indice) => (
            <Chip key={indice} rotulo={palavra} />
          ))}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.branco,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.md,
    ...sombra.pq,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espacamento.pq,
    gap: espacamento.pq,
  },
  titulo: {
    flex: 1,
    fontSize: 16,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
  },
  descricao: {
    fontSize: 14,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    marginBottom: espacamento.md,
    lineHeight: 14 * 1.5,
  },
  containerPalavras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
  },
});
