import { View, Text, StyleSheet } from 'react-native';
import tema from '../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface Hero {
  titulo?: string;
  subtitulo?: string;
}

export default function HeroSection(props: Hero) {
  return (
    <View style={estilos.container}>
      <View style={estilos.iconeContainer}>
        <Text style={estilos.rosa}>🌸</Text>
      </View>

      {props.titulo ? (
        <Text style={estilos.titulo}>{props.titulo}</Text>
      ) : null}

      {props.subtitulo ? (
        <Text style={estilos.subtitulo}>
          {props.subtitulo}
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tema.espacamento.xg,
    paddingHorizontal: tema.espacamento.gd,
  },
  iconeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tema.espacamento.md,
  },
  rosa: {
    fontSize: 60,
    textAlign: 'center',
  },
  icone: {
    marginBottom: tema.espacamento.md,
  },
  titulo: {
    fontSize: 32,
    fontFamily: tema.tipografia.outfit.negrito,
    color: tema.cores.textoPrincipal,
    textAlign: 'center',
    marginBottom: tema.espacamento.pq,
  },
  subtitulo: {
    fontSize: tema.tipografia.tamanhoMd,
    fontFamily: tema.tipografia.inter.regular,
    color: tema.cores.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: tema.espacamento.pq,
  },
});
