import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { borda, cores, espacamento, sombra, tipografia } from '../styles/theme';

interface CardProps {
  nome: string;
  icone: React.ComponentProps<typeof MaterialIcons>['name'];
  corIcone?: string;
  aoPress?: () => void;
}

export default function Card({ nome, icone, corIcone = cores.primaria, aoPress }: CardProps) {
  return (
    <TouchableOpacity
      style={estilos.container}
      activeOpacity={0.8}
      onPress={aoPress}
    >
      <MaterialIcons name={icone} size={32} color={corIcone} />
      <Text style={estilos.nome}>{nome}</Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  container: {
    width: '31.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: espacamento.pq,
    backgroundColor: cores.branco,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    ...sombra.pq,
  },
  nome: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    color: cores.textoPrincipal,
    textAlign: 'center',
  },
});
