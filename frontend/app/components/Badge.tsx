import { StyleSheet, Text, View } from 'react-native';
import { borda, cores, espacamento, tipografia } from '../styles/theme';

type VarianteBadge = 'primaria' | 'destaque' | 'sucesso' | 'muted';

interface BadgeProps {
  rotulo: string;
  variante?: VarianteBadge;
}

const estilosPorVariante: Record<VarianteBadge, { fundo: string; texto: string }> = {
  primaria: { fundo: cores.destaque, texto: cores.textoDestaque },
  destaque: { fundo: cores.destaque, texto: cores.textoDestaque },
  sucesso:  { fundo: '#D6F5E9',      texto: cores.sucesso        },
  muted:    { fundo: cores.muted,    texto: cores.mutedForeground },
};

export default function Badge({ rotulo, variante = 'primaria' }: BadgeProps) {
  const { fundo, texto } = estilosPorVariante[variante];

  return (
    <View style={[estilos.container, { backgroundColor: fundo }]}>
      <Text style={[estilos.rotulo, { color: texto }]}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borda.cheia,
    paddingVertical: 4,
    paddingHorizontal: espacamento.md,
  },
  rotulo: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
  },
});
