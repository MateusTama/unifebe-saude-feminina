import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borda, cores, espacamento, sombra, tipografia } from '../styles/theme';

// ---------------------------------------------------------------------------
// Tipos exportados (reutilizáveis por quem importar o componente)
// ---------------------------------------------------------------------------

export type TipoDia = 'menstruacao' | 'fertil' | 'ovulacao' | 'normal';

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

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function chaveData(ano: number, mes: number, dia: number): string {
  return `${ano}-${mes}-${dia}`;
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

  const hoje = new Date();
  const ehHoje = (dia: number) =>
    dia === hoje.getDate() && mes === hoje.getMonth() + 1 && ano === hoje.getFullYear();

  return (
    <View style={estilos.container}>
      {/* Cabeçalho com navegação */}
      <View style={estilos.cabecalho}>
        <TouchableOpacity onPress={aoMesAnterior} style={estilos.botaoNav} activeOpacity={0.7}>
          <MaterialIcons name="chevron-left" size={28} color={cores.textoPrincipal} />
        </TouchableOpacity>
        <Text style={estilos.tituloCabecalho}>
          {NOMES_MESES[mes - 1]} {ano}
        </Text>
        <TouchableOpacity onPress={aoProximoMes} style={estilos.botaoNav} activeOpacity={0.7}>
          <MaterialIcons name="chevron-right" size={28} color={cores.textoPrincipal} />
        </TouchableOpacity>
      </View>

      {/* Dias da semana */}
      <View style={estilos.linhaSemana}>
        {DIAS_SEMANA.map((d) => (
          <Text key={d} style={estilos.labelSemana}>{d}</Text>
        ))}
      </View>

      {/* Grade de dias */}
      <View style={estilos.grade}>
        {celulas.map((dia, idx) => {
          if (dia === null) {
            return <View key={`vazio-${idx}`} style={estilos.celula} />;
          }

          const chave = chaveData(ano, mes, dia);
          const tipo: TipoDia = registros[chave]?.tipo ?? 'normal';
          const selecionado = dia === diaSelecionado;
          const diaHoje = ehHoje(dia);

          return (
            <TouchableOpacity
              key={chave}
              style={estilos.celula}
              onPress={() => aoSelecionarDia(dia)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  estilos.bolaDia,
                  selecionado && estilos.bolaSelecionada,
                  diaHoje && !selecionado && estilos.bolaHoje,
                ]}
              >
                <Text
                  style={[
                    estilos.textoDia,
                    selecionado && estilos.textoDiaSelecionado,
                    diaHoje && !selecionado && estilos.textoDiaHoje,
                  ]}
                >
                  {dia}
                </Text>
              </View>

              {tipo !== 'normal' && (
                <View
                  style={[
                    estilos.indicador,
                    tipo === 'menstruacao' && estilos.indicadorMenstruacao,
                    tipo === 'fertil'      && estilos.indicadorFertil,
                    tipo === 'ovulacao'    && estilos.indicadorOvulacao,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legenda */}
      <View style={estilos.legenda}>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaPonto, estilos.indicadorMenstruacao]} />
          <Text style={estilos.legendaTexto}>Menstruação</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaPonto, estilos.indicadorFertil]} />
          <Text style={estilos.legendaTexto}>Fértil</Text>
        </View>
        <View style={estilos.legendaItem}>
          <View style={[estilos.legendaPonto, estilos.indicadorOvulacao]} />
          <Text style={estilos.legendaTexto}>Ovulação</Text>
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
    borderRadius: borda.gd,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamento.md,
    ...sombra.pq,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamento.md,
  },
  botaoNav: {
    padding: espacamento.pq,
  },
  tituloCabecalho: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
  },
  linhaSemana: {
    flexDirection: 'row',
    marginBottom: espacamento.pq,
  },
  labelSemana: {
    flex: 1,
    textAlign: 'center',
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.semibold,
    color: cores.mutedForeground,
    letterSpacing: 0.5,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celula: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  bolaDia: {
    width: 36,
    height: 36,
    borderRadius: borda.cheia,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolaSelecionada: {
    backgroundColor: cores.primaria,
  },
  bolaHoje: {
    borderWidth: 2,
    borderColor: cores.primaria,
  },
  textoDia: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.textoPrincipal,
  },
  textoDiaSelecionado: {
    color: cores.branco,
    fontFamily: tipografia.inter.semibold,
  },
  textoDiaHoje: {
    color: cores.primaria,
    fontFamily: tipografia.inter.semibold,
  },
  indicador: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicadorMenstruacao: {
    backgroundColor: cores.secundaria,
  },
  indicadorFertil: {
    backgroundColor: '#F5A623',
  },
  indicadorOvulacao: {
    backgroundColor: cores.sucesso,
  },
  legenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espacamento.gd,
    marginTop: espacamento.md,
    paddingTop: espacamento.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaPonto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendaTexto: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },
});
