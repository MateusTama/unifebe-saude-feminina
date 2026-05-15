import { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores, tipografia, espacamento, input } from '../styles/theme';

type DateInputProps = {
  rotulo?: string;
  valor?: Date;
  aoMudar: (data: Date) => void;
  erro?: string;
};

export default function DateInput({ rotulo, valor, aoMudar, erro }: DateInputProps) {
  const [texto, setTexto] = useState('');
  const [focado, setFocado] = useState(false);

  const formatarData = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const aplicarMascara = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    
    let resultado = '';
    
    if (numeros.length > 0) {
      resultado = numeros.substring(0, 2);
    }
    if (numeros.length >= 3) {
      resultado += '/' + numeros.substring(2, 4);
    }
    if (numeros.length >= 5) {
      resultado += '/' + numeros.substring(4, 8);
    }
    
    return resultado;
  };

  const validarEConverterData = (textoData: string) => {
    if (textoData.length === 10) {
      const [dia, mes, ano] = textoData.split('/').map(Number);
      
      if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12 && ano >= 1900 && ano <= 2100) {
        const data = new Date(ano, mes - 1, dia);
        
        if (data.getDate() === dia && data.getMonth() === mes - 1) {
          aoMudar(data);
        }
      }
    }
  };

  const handleChangeText = (novoTexto: string) => {
    const textoFormatado = aplicarMascara(novoTexto);
    setTexto(textoFormatado);
    validarEConverterData(textoFormatado);
  };

  const textoExibido = valor && !texto ? formatarData(valor) : texto;

  return (
    <View style={estilos.container}>
      {rotulo && <Text style={estilos.rotulo}>{rotulo}</Text>}
      <View style={[estilos.campo, focado && estilos.campoFocado]}>
        <TextInput
          style={[estilos.input, 
            {
                outlineStyle: 'none',
            } as any
          ]}
          value={textoExibido}
          onChangeText={handleChangeText}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={input.corPlaceholder}
          keyboardType="numeric"
          maxLength={10}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
        />
        <MaterialIcons name="calendar-today" size={20} color={cores.textoPrincipal} />
      </View>
      {erro && <Text style={estilos.erroTexto}>{erro}</Text>}
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
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: input.raio,
    borderColor: input.bordaCor,
    borderWidth: input.bordaEspessura,
    backgroundColor: input.fundo,
    paddingHorizontal: input.paddingHorizontal,
    paddingVertical: input.paddingVertical,
    minHeight: 48,
  },
  campoFocado: {
    borderColor: input.bordaCorFocado,
    borderWidth: input.bordaEspessuraFocado,
  },
  erroTexto: {
    color: cores.destrutivo,
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
  },
  input: {
    flex: 1,
    fontSize: input.tamanhoFonte,
    color: input.corTexto,
    outlineWidth: 0,
    outline: 'none'
  },
});
