import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { cores, tipografia, espacamento, input, borda } from '../styles/theme';

type ItemComboBox = {
  rotulo: string;
  valor: string;
};

type ComboBoxProps = {
  rotulo?: string;
  valor: string | null;
  aoMudar: (valor: string | null) => void;
  itens: ItemComboBox[];
  placeholder?: string;
  zIndex?: number;
  erro?: string;
};

export default function ComboBox(props: ComboBoxProps) {
  const [aberto, setAberto] = useState(false);
  
  // Mapeia os itens de português para o formato do DropDownPicker
  const itensDropdown = props.itens.map(item => ({
    label: item.rotulo,
    value: item.valor,
  }));
  
  const [itens, setItens] = useState(itensDropdown);

  return (
    <View style={[estilos.container, { zIndex: props.zIndex ?? 1 }]}>
      {props.rotulo && <Text style={estilos.rotulo}>{props.rotulo}</Text>}

      <DropDownPicker
        open={aberto}
        value={props.valor}
        items={itens}
        setOpen={setAberto}
        setValue={(callback) => props.aoMudar(callback(props.valor))}
        setItems={setItens}
        placeholder={props.placeholder ?? 'Selecione uma opção'}
        style={[estilos.campo, aberto && estilos.campoAberto]}
        dropDownContainerStyle={estilos.dropdown}
        placeholderStyle={estilos.placeholder}
        labelStyle={estilos.labelTexto}
        selectedItemLabelStyle={estilos.textoSelecionado}
        selectedItemContainerStyle={estilos.itemSelecionado}
        listItemLabelStyle={estilos.itemTexto}
        arrowIconStyle={estilos.icone}
        tickIconStyle={estilos.icone}
      />
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
  campo: {
    borderRadius: input.raio,
    borderColor: input.bordaCor,
    borderWidth: input.bordaEspessura,
    backgroundColor: input.fundo,
    paddingHorizontal: input.paddingHorizontal,
    paddingVertical: input.paddingVertical,
    minHeight: 48,
  },
  campoAberto: {
    borderColor: input.bordaCorFocado,
    borderWidth: input.bordaEspessuraFocado,
  },
  erroTexto: {
    color: cores.destrutivo,
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
  },
  dropdown: {
    borderRadius: borda.md,
    borderColor: input.bordaCorFocado,
    borderWidth: input.bordaEspessuraFocado,
    backgroundColor: cores.branco,
    marginTop: 4,
  },
  placeholder: {
    color: input.corPlaceholder,
    fontSize: input.tamanhoFonte,
  },
  labelTexto: {
    color: input.corTexto,
    fontSize: input.tamanhoFonte,
  },
  textoSelecionado: {
    color: input.corTexto,
    fontWeight: tipografia.medio,
  },
  itemSelecionado: {
    backgroundColor: cores.destaque,
  },
  itemTexto: {
    fontSize: tipografia.tamanhoMd,
    color: input.corTexto,
  },
  icone: {
    tintColor: cores.textoPrincipal,
  } as any,
});
