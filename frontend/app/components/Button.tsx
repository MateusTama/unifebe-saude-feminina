import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cores, tipografia, espacamento, borda } from '../styles/theme';

type NomeIcone = React.ComponentProps<typeof MaterialIcons>['name'];

interface ButtonProps extends TouchableOpacityProps {
  titulo: string;
  /**
   * Variantes visuais:
   * - `primario`   — fundo lilás, texto branco (padrão)
   * - `lista`      — fundo branco, borda cinza, ícone à esquerda e seta à direita
   * - `destrutivo` — fundo branco, borda cinza, ícone e texto em rosa
   * - `tracejado`  — fundo rosado, borda tracejada rosa, ícone e texto em rosa
   * - `secundario` — fundo lilás claro, texto lilás escuro
   * - `fantasma`   — transparente, texto lilás
   */
  variante?: 'primario' | 'secundario' | 'fantasma' | 'lista' | 'destrutivo' | 'tracejado';
  /** Nome do ícone MaterialIcons exibido à esquerda do texto */
  icone?: NomeIcone;
  carregando?: boolean;
}

export default function Button({
  titulo,
  variante = 'primario',
  icone,
  carregando = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const desabilitado = disabled || carregando;

  // Cor do ícone e do indicador de carregamento por variante
  const corIcone: Record<NonNullable<ButtonProps['variante']>, string> = {
    primario:   cores.branco,
    secundario: cores.textoDestaque,
    fantasma:   cores.primaria,
    lista:      cores.textoPrincipal,
    destrutivo: cores.destrutivo,
    tracejado:  cores.secundaria,
  };

  const corAtual = corIcone[variante];

  return (
    <TouchableOpacity
      style={[
        estilos.base,
        estilos[variante],
        desabilitado && estilos.desabilitado,
        style,
      ]}
      activeOpacity={0.8}
      disabled={desabilitado}
      {...rest}
    >
      {carregando ? (
        <ActivityIndicator color={corAtual} />
      ) : (
        // Layout interno: ícone esquerdo · texto · seta direita (só em "lista")
        <View style={estilos.linha}>
          {icone && (
            <MaterialIcons
              name={icone}
              size={20}
              color={corAtual}
              style={estilos.iconeEsquerdo}
            />
          )}

          <Text style={[estilos.texto, { color: corAtual }, estilos[`texto_${variante}`]]}>
            {titulo}
          </Text>

          {variante === 'lista' && (
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={corAtual}
              style={estilos.iconeDireito}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  // --- Base ---
  base: {
    width: '100%',
    minHeight: 52,
    borderRadius: borda.gd,
    justifyContent: 'center',
    paddingHorizontal: espacamento.gd,
    paddingVertical: espacamento.md,
  },

  // --- Variantes de container ---
  primario: {
    backgroundColor: cores.primaria,
    alignItems: 'center',
  },
  secundario: {
    backgroundColor: cores.destaque,
    borderWidth: 1,
    borderColor: cores.primaria,
    alignItems: 'center',
  },
  fantasma: {
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  lista: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'stretch',
  },
  destrutivo: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'stretch',
  },
  tracejado: {
    // Fundo rosado claro (destaque da cor secundária)
    backgroundColor: '#FFF0F3',
    borderWidth: 1.5,
    borderColor: cores.secundaria,
    borderStyle: 'dashed',
    alignItems: 'center',
  },

  // --- Estado desabilitado ---
  desabilitado: {
    opacity: 0.5,
  },

  // --- Layout interno ---
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconeEsquerdo: {
    marginRight: espacamento.pq,
  },
  iconeDireito: {
    marginLeft: 'auto',
  },

  // --- Texto base ---
  texto: {
    fontSize: tipografia.tamanhoMd,
  },

  // Ajustes de peso por variante (cor é aplicada inline via corAtual)
  texto_primario:   { fontFamily: tipografia.outfit.semibold },
  texto_secundario: { fontFamily: tipografia.outfit.semibold },
  texto_fantasma:   { fontFamily: tipografia.outfit.semibold },
  texto_lista:      { fontFamily: tipografia.inter.medio },
  texto_destrutivo: { fontFamily: tipografia.inter.medio },
  texto_tracejado:  { fontFamily: tipografia.outfit.semibold },
});
