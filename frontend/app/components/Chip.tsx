import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { cores, tipografia, espacamento, borda } from '../styles/theme';

interface ChipProps {
  rotulo: string;
  ativo?: boolean;
  aoPress?: () => void;
}

export default function Chip({ rotulo, ativo = false, aoPress }: ChipProps) {
  const Container = aoPress ? TouchableOpacity : View;

  return (
    <Container
      style={[estilos.base, ativo ? estilos.ativo : estilos.inativo]}
      onPress={aoPress}
      activeOpacity={aoPress ? 0.7 : 1}
    >
      <Text style={[estilos.texto, ativo ? estilos.textoAtivo : estilos.textoInativo]}>
        {rotulo}
      </Text>
    </Container>
  );
}

const estilos = StyleSheet.create({
  base: {
    borderRadius: borda.cheia,
    paddingVertical: espacamento.pq,
    paddingHorizontal: espacamento.md,
    alignSelf: 'flex-start',
  },
  ativo: {
    backgroundColor: cores.destaque,
  },
  inativo: {
    backgroundColor: cores.muted,
  },
  texto: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
  },
  textoAtivo: {
    color: cores.textoDestaque,
  },
  textoInativo: {
    color: cores.mutedForeground,
  },
});
