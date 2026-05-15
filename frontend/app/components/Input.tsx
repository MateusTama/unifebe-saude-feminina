import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores, tipografia, espacamento, input } from '../styles/theme';

interface InputProps {
  rotulo?: string;
  placeholder?: string;
  valor?: string;
  aoMudar?: (texto: string) => void;
  seguro?: boolean;
  erro?: string;
}

export default function Input(props: InputProps) {
  const [focado, setFocado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <View style={estilos.container}>
      {props.rotulo && <Text style={estilos.rotulo}>{props.rotulo}</Text>}
      <View style={estilos.inputContainer}>
        <TextInput
          style={[
            estilos.input,
            props.seguro && estilos.inputComIcone,
            focado && estilos.inputFocado, 
            focado && {
              outline: 'none',
            }
          ]}
          placeholder={props.placeholder}
          placeholderTextColor={input.corPlaceholder}
          value={props.valor}
          onChangeText={props.aoMudar}
          secureTextEntry={props.seguro && !senhaVisivel}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
        />
        {props.seguro && (
          <TouchableOpacity
            style={estilos.iconeOlho}
            onPress={() => setSenhaVisivel(!senhaVisivel)}
          >
            <MaterialIcons
              name={senhaVisivel ? 'visibility' : 'visibility-off'}
              size={20}
              color={cores.textoPrincipal}
            />
          </TouchableOpacity>
        )}
      </View>
      {props.erro && <Text style={estilos.erroTexto}>{props.erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    gap: espacamento.pq,
  },
  rotulo: {
    fontSize: tipografia.tamanhoPq,
    fontWeight: tipografia.medio,
    color: cores.textoPrincipal,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderRadius: input.raio,
    borderWidth: input.bordaEspessura,
    borderColor: input.bordaCor,
    paddingHorizontal: input.paddingHorizontal,
    paddingVertical: input.paddingVertical,
    fontSize: input.tamanhoFonte,
    color: input.corTexto,
    backgroundColor: input.fundo,
    minHeight: 48,
  },
  inputFocado: {
    borderColor: input.bordaCorFocado,
    borderWidth: input.bordaEspessuraFocado,
  },
  inputComIcone: {
    paddingRight: input.paddingHorizontal + 32, // Espaço para o ícone
  },
  iconeOlho: {
    position: 'absolute',
    right: input.paddingHorizontal,
    top: '50%',
    transform: [{ translateY: -10 }], // Centraliza verticalmente (metade do tamanho do ícone)
  },
  erroTexto: {
    color: cores.destrutivo,
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
  },
});
