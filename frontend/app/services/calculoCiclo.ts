import type { Ciclo, RegistrosDias } from '../types/diario';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Converte 'YYYY-MM-DD' em Date (meia-noite local) */
function paraDate(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

/** Diferença em dias entre duas datas */
function diffDias(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}



/** Adiciona N dias a uma data */
function adicionarDias(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Chave no formato ISO YYYY-MM-DD */
function chaveCalendario(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Retorna apenas ciclos finalizados (com dataFim), ordenados por dataInicio */
function ciclosFinalizados(ciclos: Ciclo[]): Ciclo[] {
  return ciclos
    .filter((c) => c.dataFim !== null)
    .sort((a, b) => paraDate(a.dataInicio).getTime() - paraDate(b.dataInicio).getTime());
}

// ---------------------------------------------------------------------------
// Cálculos de ciclo
// ---------------------------------------------------------------------------

/**
 * Calcula a duração de cada ciclo (em dias) a partir do histórico.
 * Duração = diferença entre o início de um ciclo e o início do próximo.
 * Precisa de no mínimo 2 ciclos finalizados.
 */
export function calcularDuracoesCiclos(ciclos: Ciclo[]): number[] {
  const finalizados = ciclosFinalizados(ciclos);
  if (finalizados.length < 2) return [];

  const duracoes: number[] = [];
  for (let i = 1; i < finalizados.length; i++) {
    const dias = diffDias(
      paraDate(finalizados[i - 1].dataInicio),
      paraDate(finalizados[i].dataInicio)
    );
    if (dias >= 15 && dias <= 90) duracoes.push(dias);
  }
  return duracoes;
}

/**
 * Média da duração do ciclo. Retorna 28 se não houver dados suficientes.
 */
export function calcularDuracaoMedia(ciclos: Ciclo[]): number {
  const duracoes = calcularDuracoesCiclos(ciclos);
  if (duracoes.length === 0) return 28;
  return Math.round(duracoes.reduce((a, b) => a + b, 0) / duracoes.length);
}

/**
 * Duração média da menstruação em si (dias de sangramento).
 * Calculada a partir da diferença entre dataInicio e dataFim de cada ciclo.
 */
export function calcularDuracaoMediaMenstruacao(ciclos: Ciclo[]): number {
  const finalizados = ciclosFinalizados(ciclos);
  if (finalizados.length === 0) return 5;

  const duracoes = finalizados.map((c) =>
    diffDias(paraDate(c.dataInicio), paraDate(c.dataFim!)) + 1
  );
  return Math.round(duracoes.reduce((a, b) => a + b, 0) / duracoes.length);
}

/**
 * Regularidade: desvio padrão das durações ≤ 3 dias = Regular.
 */
export function calcularRegularidade(ciclos: Ciclo[]): 'Regular' | 'Irregular' | null {
  const duracoes = calcularDuracoesCiclos(ciclos);
  if (duracoes.length < 2) return null;

  const media = duracoes.reduce((a, b) => a + b, 0) / duracoes.length;
  const variancia = duracoes.reduce((acc, d) => acc + (d - media) ** 2, 0) / duracoes.length;
  const desvioPadrao = Math.sqrt(variancia);

  return desvioPadrao <= 3 ? 'Regular' : 'Irregular';
}

/**
 * Data prevista da próxima menstruação.
 * = dataInicio do último ciclo + duração média do ciclo.
 */
export function calcularProximaMenstruacao(ciclos: Ciclo[]): Date | null {
  const todos = [...ciclos].sort(
    (a, b) => paraDate(b.dataInicio).getTime() - paraDate(a.dataInicio).getTime()
  );
  if (todos.length === 0) return null;

  const ultimoCiclo = todos[0];
  const media = calcularDuracaoMedia(ciclos);
  return adicionarDias(paraDate(ultimoCiclo.dataInicio), media);
}

/**
 * Data estimada da ovulação = próxima menstruação - 14 dias.
 */
export function calcularOvulacao(ciclos: Ciclo[]): Date | null {
  const proxima = calcularProximaMenstruacao(ciclos);
  if (!proxima) return null;
  return adicionarDias(proxima, -14);
}

/**
 * Janela fértil = ovulação - 5 dias até ovulação + 1 dia.
 */
export function calcularJanelaFertil(
  ciclos: Ciclo[]
): { inicio: Date; fim: Date } | null {
  const ovulacao = calcularOvulacao(ciclos);
  if (!ovulacao) return null;
  return {
    inicio: adicionarDias(ovulacao, -5),
    fim: adicionarDias(ovulacao, 1),
  };
}

/**
 * Retorna a data de início do último ciclo registrado, ou null.
 */
export function obterUltimoCicloInicio(ciclos: Ciclo[]): Date | null {
  if (ciclos.length === 0) return null;
  const ordenados = [...ciclos].sort(
    (a, b) => paraDate(b.dataInicio).getTime() - paraDate(a.dataInicio).getTime()
  );
  return paraDate(ordenados[0].dataInicio);
}

/**
 * Gera registros de previsão (previsão de menstruação, janela fértil e ovulação)
 * para exibir no calendário em meses futuros.
 * Registros reais do usuário NÃO são sobrescritos.
 */
export function gerarPrevisoes(
  ciclos: Ciclo[],
  registrosExistentes: RegistrosDias,
  quantidadeCiclos: number = 13
): RegistrosDias {
  const previsoes: RegistrosDias = {};

  const todos = [...ciclos].sort(
    (a, b) => paraDate(b.dataInicio).getTime() - paraDate(a.dataInicio).getTime()
  );
  if (todos.length === 0) return previsoes;

  const mediaCiclo = calcularDuracaoMedia(ciclos);
  const duracaoMenst = calcularDuracaoMediaMenstruacao(ciclos);
  const ultimoInicio = paraDate(todos[0].dataInicio);

  for (let c = 0; c <= quantidadeCiclos; c++) {
    const inicioCiclo = adicionarDias(ultimoInicio, mediaCiclo * c);
    const ovulacaoPrevista = adicionarDias(inicioCiclo, mediaCiclo - 14);
    const janelaInicio = adicionarDias(ovulacaoPrevista, -5);
    const janelaFim = adicionarDias(ovulacaoPrevista, 1);

    // 1. Menstruação prevista (apenas para ciclos futuros c >= 1)
    if (c >= 1) {
      for (let i = 0; i < duracaoMenst; i++) {
        const dia = adicionarDias(inicioCiclo, i);
        const chave = chaveCalendario(dia);
        if (!registrosExistentes[chave]) {
          previsoes[chave] = {
            tipo: 'previsao',
            sintomas: [],
            observacao: '',
          };
        }
      }
    }

    // 2. Janela fértil
    const diasJanela = diffDias(janelaInicio, janelaFim);
    for (let i = 0; i <= diasJanela; i++) {
      const dia = adicionarDias(janelaInicio, i);
      const chave = chaveCalendario(dia);
      if (!registrosExistentes[chave] && !previsoes[chave]) {
        previsoes[chave] = {
          tipo: 'fertil',
          sintomas: [],
          observacao: '',
        };
      }
    }

    // 3. Ovulação
    const chaveOvulacao = chaveCalendario(ovulacaoPrevista);
    if (!registrosExistentes[chaveOvulacao]) {
      previsoes[chaveOvulacao] = {
        tipo: 'ovulacao',
        sintomas: [],
        observacao: '',
      };
    }
  }

  return previsoes;
}

// ---------------------------------------------------------------------------
// Formatação para exibição
// ---------------------------------------------------------------------------

/** Formata Date para exibição curta: "05 mar 2026" */
export function formatarDataCurta(d: Date): string {
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace('.', '');
}

/** Formata intervalo de janela fértil: "14 – 20 mar" */
export function formatarJanelaFertil(
  janela: { inicio: Date; fim: Date }
): string {
  const mesIgual = janela.inicio.getMonth() === janela.fim.getMonth();
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
                 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  if (mesIgual) {
    return `${janela.inicio.getDate()} – ${janela.fim.getDate()} ${meses[janela.inicio.getMonth()]}`;
  }
  return `${janela.inicio.getDate()} ${meses[janela.inicio.getMonth()]} – ${janela.fim.getDate()} ${meses[janela.fim.getMonth()]}`;
}

/** Formata data 'YYYY-MM-DD' para exibição curta: "05 mar 2026" */
export function formatarDataISOCurta(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return formatarDataCurta(new Date(a, m - 1, d));
}

/**
 * Verifica se um intervalo [dataInicio, dataFim] colide com algum ciclo existente.
 * Retorna o ciclo conflitante, se houver, ou null.
 */
export function verificarSobreposicaoCiclos(
  ciclos: Ciclo[],
  dataInicio: string,
  dataFim: string | null,
  cicloIgnoradoId?: string
): Ciclo | null {
  const novoInicio = dataInicio;
  const novoFim = dataFim ?? dataInicio;

  for (const c of ciclos) {
    if (cicloIgnoradoId && c.id === cicloIgnoradoId) continue;

    const cInicio = c.dataInicio;
    const cFim = c.dataFim ?? c.dataInicio;

    // Dois intervalos [A1, A2] e [B1, B2] se sobrepõem se: A1 <= B2 e B1 <= A2
    if (novoInicio <= cFim && cInicio <= novoFim) {
      return c;
    }
  }
  return null;
}



