import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borda, cores, espacamento, sombra, tipografia } from '../styles/theme';

interface CardProps {
  nome: string;
  icone: React.ComponentProps<typeof MaterialIcons>['name'];
  corIcone?: string;
  aoPress?: () => void;
  /** Valor em destaque exibido abaixo do nome (ex: "28 dias") */
  valor?: string;
  /** Aplica fundo lilás claro e texto colorido no valor */
  destaque?: boolean;
}

export default function Card({
  nome,
  icone,
  corIcone = cores.primaria,
  aoPress,
  valor,
  destaque = false,
}: CardProps) {
  const temValor = valor !== undefined;

  return (
    <TouchableOpacity
      style={[
        estilos.container,
        temValor && estilos.containerEstatistica,
        destaque && estilos.containerDestaque,
      ]}
      activeOpacity={aoPress ? 0.8 : 1}
      onPress={aoPress}
    >
      {temValor ? (
        // Layout de estatística: ícone + rótulo em cima, valor em baixo
        <>
          <View style={estilos.topo}>
            <MaterialIcons name={icone} size={16} color={cores.mutedForeground} />
            <Text style={estilos.rotulo}>{nome}</Text>
          </View>
          <Text style={[estilos.valor, destaque && estilos.valorDestaque]}>{valor}</Text>
        </>
      ) : (
        // Layout original: ícone grande + nome centralizado
        <>
          <MaterialIcons name={icone} size={32} color={corIcone} />
          <Text style={estilos.nome}>{nome}</Text>
        </>
      )}
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
  // Quando usado como card de estatística: ocupa metade da linha, sem aspect ratio fixo
  containerEstatistica: {
    width: undefined,
    aspectRatio: undefined,
    flex: 1,
    alignItems: 'flex-start',
    padding: espacamento.md,
  },
  containerDestaque: {
    backgroundColor: cores.destaque,
    borderColor: cores.primaria,
  },
  // Layout original
  nome: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    color: cores.textoPrincipal,
    textAlign: 'center',
  },
  // Layout estatística
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rotulo: {
    fontSize: tipografia.tamanhoXp,
    fontFamily: tipografia.inter.semibold,
    color: cores.mutedForeground,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  valor: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
  },
  valorDestaque: {
    color: cores.primaria,
  },
});
