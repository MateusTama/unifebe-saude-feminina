import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borda, cores, espacamento, sombra, tipografia } from '../styles/theme';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ItemInfo {
  /** Emoji exibido à esquerda do rótulo */
  emoji: string;
  /** Rótulo descritivo do indicador */
  rotulo: string;
  /** Valor do indicador (exibido à direita) */
  valor: string;
  /** Se verdadeiro, aplica cor de destaque ao valor */
  destaque?: boolean;
}

interface InfoListProps {
  itens: ItemInfo[];
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function InfoList({ itens, style }: InfoListProps) {
  return (
    <View style={[estilos.container, style]}>
      {itens.map((item, indice) => (
        <View key={item.rotulo}>
          <View style={estilos.linha}>
            <View style={estilos.esquerda}>
              <Text style={estilos.emoji}>{item.emoji}</Text>
              <Text style={estilos.rotulo}>{item.rotulo}</Text>
            </View>
            <Text
              style={[
                estilos.valor,
                item.destaque && estilos.valorDestaque,
              ]}
            >
              {item.valor}
            </Text>
          </View>
          {indice < itens.length - 1 && <View style={estilos.divisor} />}
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.branco,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: 'hidden',
    marginBottom: espacamento.md,
    ...sombra.pq,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: espacamento.md,
  },
  esquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  emoji: {
    fontSize: 18,
  },
  rotulo: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.medio,
    color: cores.textoPrincipal,
  },
  valor: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.mutedForeground,
    textAlign: 'right',
    flexShrink: 0,
    marginLeft: espacamento.md,
  },
  valorDestaque: {
    color: cores.textoDestaque,
    fontFamily: tipografia.outfit.negrito,
  },
  divisor: {
    height: 1,
    backgroundColor: cores.borda,
    marginHorizontal: espacamento.md,
  },
});
