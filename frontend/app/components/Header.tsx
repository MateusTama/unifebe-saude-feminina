import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tema from '../styles/theme';

interface HeaderProps {
  nome?: string;
  editando?: boolean;
  aoClicarIcone?: () => void;
  ocultarIcone?: boolean;
  mostrarVoltar?: boolean;
  aoVoltar?: () => void;
  iconeDireita?: React.ComponentProps<typeof MaterialIcons>['name'];
  corIconeDireita?: string;
}

export default function Header(props: HeaderProps) {
  const nomeIconeDireita = props.iconeDireita
    ? props.iconeDireita
    : props.editando
    ? 'close'
    : 'edit';

  const corIcone = props.corIconeDireita
    ? props.corIconeDireita
    : props.editando
    ? tema.cores.textoPrincipal
    : tema.cores.primaria;

  return (
    <View style={estilos.container}>
      <View style={estilos.ladoEsquerdo}>
        {props.mostrarVoltar && (
          <TouchableOpacity onPress={props.aoVoltar} style={estilos.botaoVoltar}>
            <MaterialIcons name="arrow-back" size={24} color={tema.cores.textoPrincipal} />
          </TouchableOpacity>
        )}
        <Text style={estilos.titulo}>{props.nome ?? 'VidaFem'}</Text>
      </View>

      {!props.ocultarIcone && props.aoClicarIcone && (
        <TouchableOpacity onPress={props.aoClicarIcone}>
          <MaterialIcons
            name={nomeIconeDireita}
            size={props.iconeDireita ? 28 : 20}
            color={corIcone}
          />
        </TouchableOpacity>
      )}
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
  ladoEsquerdo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tema.espacamento.md,
  },
  botaoVoltar: {
    padding: 2,
  },
  titulo: {
    fontSize: tema.tipografia.tamanhoXg,
    fontFamily: tema.tipografia.outfit.negrito,
    color: tema.cores.textoPrincipal,
  },
});

