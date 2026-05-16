import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';
import { borda, cores, espacamento, tipografia } from '../styles/theme';

type VarianteAlert = 'info' | 'sucesso' | 'destrutivo';

interface AlertProps {
  mensagem: string;
  variante?: VarianteAlert;
}

const estilosPorVariante: Record<VarianteAlert, {
  fundo: string;
  texto: string;
  icone: React.ComponentProps<typeof MaterialIcons>['name'];
}> = {
  info:       { fundo: cores.muted,   texto: cores.mutedForeground, icone: 'info-outline'    },
  sucesso:    { fundo: '#D6F5E9',     texto: cores.sucesso,         icone: 'check-circle'    },
  destrutivo: { fundo: '#FFE4EA',     texto: cores.destrutivo,      icone: 'error-outline'   },
};

export default function Alert({ mensagem, variante = 'info' }: AlertProps) {
  const { fundo, texto, icone } = estilosPorVariante[variante];

  return (
    <View style={[estilos.container, { backgroundColor: fundo }]}>
      <MaterialIcons name={icone} size={18} color={texto} style={estilos.icone} />
      <Text style={[estilos.mensagem, { color: texto }]}>{mensagem}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borda.md,
    padding: espacamento.md,
    gap: espacamento.pq,
  },
  icone: {
    flexShrink: 0,
  },
  mensagem: {
    flex: 1,
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    lineHeight: tipografia.tamanhoPq * 1.5,
  },
});
