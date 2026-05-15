import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Switch from './Switch';
import tema from '../styles/theme';

interface Propriedades {
  titulo: string;
  subtitulo?: string;
  icone?: any;
  valor: boolean;
  aoMudarValor: (novoValor: boolean) => void;
}

export default function CartaoSwitch({ titulo, subtitulo, icone, valor, aoMudarValor }: Propriedades) {
  return (
    <Pressable style={estilos.cartao} onPress={() => aoMudarValor(!valor)}>
      <View style={estilos.ladoEsquerdo}>
        {icone && (
          <MaterialIcons name={icone} size={24} color={tema.cores.mutedForeground} style={estilos.icone} />
        )}
        <View style={estilos.textos}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {subtitulo && <Text style={estilos.subtitulo}>{subtitulo}</Text>}
        </View>
      </View>
      
      <Switch valor={valor} aoMudarValor={aoMudarValor} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tema.espacamento.md,
    backgroundColor: tema.cores.branco,
    borderWidth: 1,
    borderColor: tema.cores.borda,
    borderRadius: tema.borda.md,
  },
  ladoEsquerdo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icone: {
    marginRight: tema.espacamento.md,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: tema.tipografia.tamanhoMd,
    fontFamily: tema.tipografia.inter.medio,
    color: tema.cores.textoPrincipal,
  },
  subtitulo: {
    fontSize: tema.tipografia.tamanhoPq,
    fontFamily: tema.tipografia.inter.regular,
    color: tema.cores.mutedForeground,
  },
});
