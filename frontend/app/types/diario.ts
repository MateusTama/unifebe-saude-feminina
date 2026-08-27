// ---------------------------------------------------------------------------
// Tipos centralizados do módulo Diário de Saúde
// ---------------------------------------------------------------------------

/** Tipos visuais de um dia no calendário */
export type TipoDia =
  | 'menstruacao'
  | 'previsao'
  | 'fertil'
  | 'ovulacao'
  | 'sintomas'
  | 'normal';

/** Intensidade do fluxo menstrual */
export type IntensidadeFluxo = 'leve' | 'moderado' | 'intenso';

/** Representa um ciclo menstrual completo ou em andamento */
export interface Ciclo {
  /** Identificador único gerado localmente */
  id: string;
  /** Data de início no formato 'YYYY-MM-DD' */
  dataInicio: string;
  /** Data de fim no formato 'YYYY-MM-DD'. null = ciclo em andamento */
  dataFim: string | null;
  /** Intensidade do fluxo */
  intensidade: IntensidadeFluxo;
}

/** Registro diário de um dia específico */
export interface RegistroDia {
  tipo: TipoDia;
  sintomas: string[];
  observacao: string;
  intensidade?: IntensidadeFluxo;
}

/** Mapa de registros indexado por chave 'ano-mes-dia' */
export interface RegistrosDias {
  [chave: string]: RegistroDia;
}

