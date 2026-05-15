import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tema from '../styles/theme';

interface HeaderProps {
  nome?: string;
  editando: boolean;
  aoClicarIcone: () => void;
}

export default function Header(props: HeaderProps) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>{props.nome ?? 'VidaFem'}</Text>

      <TouchableOpacity onPress={props.aoClicarIcone}>
        <MaterialIcons
          name={props.editando ? 'close' : 'edit'}
          size={20}
          color={props.editando ? tema.cores.textoPrincipal : tema.cores.primaria}
        />
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    backgroundColor: tema.cores.branco,
    paddingHorizontal: tema.espacamento.md,
    paddingVertical: tema.espacamento.md,
    borderBottomWidth: 1,
    borderBottomColor: tema.cores.borda,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    fontSize: tema.tipografia.tamanhoXg,
    fontFamily: tema.tipografia.outfit.negrito,
    color: tema.cores.textoPrincipal,
  },
});
