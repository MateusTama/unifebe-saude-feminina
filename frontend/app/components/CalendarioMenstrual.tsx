import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borda, cores, espacamento, sombra, tipografia } from '../styles/theme';

// ---------------------------------------------------------------------------
// Tipos exportados
// ---------------------------------------------------------------------------

export type TipoDia = 'menstruacao' | 'previsao' | 'fertil' | 'ovulacao' | 'sintomas' | 'normal';

export interface DadosDia {
  tipo: TipoDia;
  sintomas?: string[];
  observacao?: string;
  intensidade?: 'leve' | 'moderado' | 'intenso';
}

export interface RegistrosDias {
  [chave: string]: DadosDia;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CalendarioMenstrualProps {
  ano: number;
  mes: number;
  registros: RegistrosDias;
  diaSelecionado?: number | null;
  aoSelecionarDia: (dia: number) => void;
  aoMesAnterior: () => void;
  aoProximoMes: () => void;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function chaveData(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function diasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

function primeiroDiaSemana(ano: number, mes: number): number {
  return new Date(ano, mes - 1, 1).getDay();
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CalendarioMenstrual({
  ano,
  mes,
  registros,
  diaSelecionado = null,
  aoSelecionarDia,
  aoMesAnterior,
  aoProximoMes,
}: CalendarioMenstrualProps) {
  const total = diasNoMes(ano, mes);
  const offset = primeiroDiaSemana(ano, mes);

  const celulas: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  return (
    <View style={estilos.container}>
      {/* Cabeçalho com navegação */}
      <View style={estilos.cabecalho}>
        <TouchableOpacity onPress={aoMesAnterior} style={estilos.botaoNav} activeOpacity={0.7}>
          <MaterialIcons name="chevron-left" size={24} color={cores.textoPrincipal} />
        </TouchableOpacity>
        <Text style={estilos.tituloCabecalho}>
          {NOMES_MESES[mes - 1]} {ano}
        </Text>
        <TouchableOpacity onPress={aoProximoMes} style={estilos.botaoNav} activeOpacity={0.7}>
          <MaterialIcons name="chevron-right" size={24} color={cores.textoPrincipal} />
        </TouchableOpacity>
      </View>

      {/* Dias da semana */}
      <View style={estilos.linhaSemana}>
        {DIAS_SEMANA.map((d, i) => (
          <Text key={i} style={estilos.labelSemana}>{d}</Text>
        ))}
      </View>

      {/* Grade de dias */}
      <View style={estilos.grade}>
        {celulas.map((dia, idx) => {
          if (dia === null) {
            return <View key={`vazio-${idx}`} style={estilos.celula} />;
          }

          const chave = chaveData(ano, mes, dia);
          const reg = registros[chave];
          const tipo: TipoDia = reg?.tipo ?? 'normal';
          const temSintomas =
            (reg?.sintomas?.length ?? 0) > 0 || (reg?.observacao?.trim()?.length ?? 0) > 0;
          const selecionado = dia === diaSelecionado;

          return (
            <View key={chave} style={estilos.celula}>
              <TouchableOpacity
                style={[
                  estilos.blocoDia,
                  selecionado && estilos.blocoSelecionado,
                  !selecionado && tipo === 'menstruacao' && estilos.blocoMenstruacao,
                  !selecionado && tipo === 'previsao' && estilos.blocoPrevisao,
                  !selecionado && tipo === 'fertil' && estilos.blocoFertil,
                  !selecionado && tipo === 'ovulacao' && estilos.blocoOvulacao,
                ]}
                onPress={() => aoSelecionarDia(dia)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    estilos.textoDia,
                    selecionado && estilos.textoDiaSelecionado,
                    !selecionado && tipo === 'menstruacao' && estilos.textoMenstruacao,
                    !selecionado && tipo === 'previsao' && estilos.textoPrevisao,
                    !selecionado && tipo === 'fertil' && estilos.textoFertil,
                    !selecionado && tipo === 'ovulacao' && estilos.textoOvulacao,
                  ]}
                >
                  {dia}
                </Text>
                {temSintomas && !selecionado && (
                  <View style={estilos.pontoSintoma} />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Legenda */}
      <View style={estilos.legenda}>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaCaixa, { backgroundColor: '#FFE4E9' }]} />
          <Text style={estilos.legendaTexto}>Menstruação</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaCaixa, estilos.legendaCaixaPrevisao]} />
          <Text style={estilos.legendaTexto}>Previsão</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaCaixa, { backgroundColor: '#DCFCE7' }]} />
          <Text style={estilos.legendaTexto}>Período fértil</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaCaixa, { backgroundColor: '#A7F3D0' }]} />
          <Text style={estilos.legendaTexto}>Ovulação</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={estilos.legendaPontoSintoma} />
          <Text style={estilos.legendaTexto}>Sintomas</Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const estilos = StyleSheet.create({
  container: {
    backgroundColor: cores.branco,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.md,
    ...sombra.pq,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamento.gd,
    paddingHorizontal: espacamento.pq,
  },
  botaoNav: {
    padding: espacamento.xp,
  },
  tituloCabecalho: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
  },
  linhaSemana: {
    flexDirection: 'row',
    marginBottom: espacamento.md,
  },
  labelSemana: {
    flex: 1,
    textAlign: 'center',
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.medio,
    color: cores.mutedForeground,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  celula: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  blocoDia: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  blocoSelecionado: {
    backgroundColor: '#8B5CF6',
  },
  blocoMenstruacao: {
    backgroundColor: '#FFE4E9',
  },
  blocoPrevisao: {
    backgroundColor: '#FFF0F3',
    borderWidth: 1.5,
    borderColor: '#FDA4AF',
    borderStyle: 'dashed',
  },
  blocoFertil: {
    backgroundColor: '#DCFCE7',
  },
  blocoOvulacao: {
    backgroundColor: '#A7F3D0',
  },
  textoDia: {
    fontSize: 15,
    fontFamily: tipografia.inter.regular,
    color: cores.textoPrincipal,
  },
  textoDiaSelecionado: {
    color: cores.branco,
    fontFamily: tipografia.outfit.semibold,
  },
  textoMenstruacao: {
    color: '#E11D48',
    fontFamily: tipografia.inter.medio,
  },
  textoPrevisao: {
    color: '#E11D48',
    fontFamily: tipografia.inter.medio,
  },
  textoFertil: {
    color: '#047857',
    fontFamily: tipografia.inter.medio,
  },
  textoOvulacao: {
    color: '#065F46',
    fontFamily: tipografia.inter.semibold,
  },
  pontoSintoma: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 2,
  },
  legendaPontoSintoma: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 3,
  },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacamento.gd,
    paddingTop: espacamento.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaCaixa: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendaCaixaPrevisao: {
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    borderStyle: 'dashed',
  },
  legendaTexto: {
    fontSize: 12,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },
});
