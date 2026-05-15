import React, { useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import tema from '../styles/theme';

interface SwitchProps {
  valor: boolean;
  aoMudarValor: (valor: boolean) => void;
  desativado?: boolean;
}

export default function Switch({ valor, aoMudarValor, desativado = false }: SwitchProps) {
  const valorAnim = useRef(new Animated.Value(valor ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(valorAnim, {
      toValue: valor ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [valor, valorAnim]);

  const corFundo = valorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [tema.cores.muted, tema.cores.primaria]
  });

  const translacaoX = valorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23] // (50 largura - 24 largura bolinha - 3 margem direita)
  });

  return (
    <Pressable
      onPress={() => aoMudarValor(!valor)}
      disabled={desativado}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: valor, disabled: desativado }}
    >
      <Animated.View style={[
        estilos.trilha,
        { backgroundColor: corFundo },
        desativado && { opacity: 0.5 }
      ]}>
        <Animated.View style={[
          estilos.bolinha,
          { transform: [{ translateX: translacaoX }] }
        ]} />
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  trilha: {
    width: 50,
    height: 30,
    borderRadius: tema.borda.cheia,
    justifyContent: 'center',
  },
  bolinha: {
    width: 24,
    height: 24,
    borderRadius: tema.borda.cheia,
    backgroundColor: tema.cores.branco,
    ...tema.sombra.pq,
  }
});
