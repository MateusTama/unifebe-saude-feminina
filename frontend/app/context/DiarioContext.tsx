import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Ciclo, IntensidadeFluxo, RegistroDia, RegistrosDias } from '../types/diario';
import {
  carregarCiclos,
  carregarRegistros,
  salvarCiclos,
  salvarRegistros,
} from '../services/diarioStorage';

// ---------------------------------------------------------------------------
// Interface do contexto
// ---------------------------------------------------------------------------

interface DiarioContextData {
  /** Lista de todos os ciclos registrados */
  ciclos: Ciclo[];
  /** Mapa de registros diários indexado por 'ano-mes-dia' */
  registros: RegistrosDias;
  /** True enquanto carrega dados do storage na inicialização */
  carregando: boolean;

  /** Inicia um novo ciclo menstrual */
  iniciarCiclo: (dataInicio: string, intensidade: IntensidadeFluxo) => void;
  /** Define a data de fim do ciclo ativo (sem dataFim) */
  finalizarCiclo: (dataFim: string) => void;
  /** Cancela o ciclo ativo em andamento */
  cancelarCicloAtivo: () => void;
  /** Exclui um ciclo completo do histórico */
  excluirCiclo: (cicloId: string) => void;
  /** Edita datas de início, fim e intensidade de um ciclo */
  editarCiclo: (
    cicloId: string,
    novaDataInicio: string,
    novaDataFim: string | null,
    novaIntensidade: IntensidadeFluxo
  ) => void;
  /** Retorna o ciclo ativo (sem dataFim), se existir */
  obterCicloAtivo: () => Ciclo | null;
  /** Retorna o ciclo que engloba a data ISO informada, se existir */
  obterCicloDoDia: (dataISO: string) => Ciclo | null;

  /** Salva/atualiza o registro diário de um dia */
  salvarRegistroDia: (chave: string, dados: RegistroDia) => void;
  /** Remove o registro de um dia */
  removerRegistroDia: (chave: string) => void;
}

const DiarioContext = createContext<DiarioContextData>({} as DiarioContextData);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Diferença em dias entre duas datas ISO */
function diffDias(isoA: string, isoB: string): number {
  const [aA, mA, dA] = isoA.split('-').map(Number);
  const [aB, mB, dB] = isoB.split('-').map(Number);
  const dateA = new Date(aA, mA - 1, dA);
  const dateB = new Date(aB, mB - 1, dB);
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

/** Adiciona N dias a uma data ISO e retorna nova ISO 'YYYY-MM-DD' */
function adicionarDiasISO(iso: string, n: number): string {
  const [a, m, d] = iso.split('-').map(Number);
  const date = new Date(a, m - 1, d);
  date.setDate(date.getDate() + n);
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Reclassifica um registro que deixou de ser 'menstruacao' */
function reclassificarRegistro(
  registros: RegistrosDias,
  chaveISO: string
): RegistrosDias {
  const novos = { ...registros };
  const reg = novos[chaveISO];
  if (!reg) return novos;

  const temSintomasOuObs =
    (reg.sintomas?.length ?? 0) > 0 || (reg.observacao?.trim() ?? '').length > 0;

  if (temSintomasOuObs) {
    novos[chaveISO] = {
      ...reg,
      tipo: 'sintomas',
      intensidade: undefined,
    };
  } else {
    delete novos[chaveISO];
  }
  return novos;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DiarioProvider({ children }: { children: ReactNode }) {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [registros, setRegistros] = useState<RegistrosDias>({});
  const [carregando, setCarregando] = useState(true);

  // Carregar dados do storage na inicialização
  useEffect(() => {
    (async () => {
      const [ciclosStorage, registrosStorage] = await Promise.all([
        carregarCiclos(),
        carregarRegistros(),
      ]);
      setCiclos(ciclosStorage);
      setRegistros(registrosStorage);
      setCarregando(false);
    })();
  }, []);

  // Persistir ciclos quando mudam
  useEffect(() => {
    if (!carregando) {
      salvarCiclos(ciclos);
    }
  }, [ciclos, carregando]);

  // Persistir registros quando mudam
  useEffect(() => {
    if (!carregando) {
      salvarRegistros(registros);
    }
  }, [registros, carregando]);

  // -----------------------------------------------------------------------
  // Funções de ciclo
  // -----------------------------------------------------------------------

  const obterCicloAtivo = useCallback((): Ciclo | null => {
    return ciclos.find((c) => c.dataFim === null) ?? null;
  }, [ciclos]);

  const iniciarCiclo = useCallback(
    (dataInicio: string, intensidade: IntensidadeFluxo) => {
      const jaTemAtivo = ciclos.some((c) => c.dataFim === null);
      if (jaTemAtivo) return;

      const novoCiclo: Ciclo = {
        id: gerarId(),
        dataInicio,
        dataFim: null,
        intensidade,
      };

      setCiclos((prev) => [...prev, novoCiclo]);

      // Marca o dia de início como menstruação nos registros usando dataInicio ISO
      setRegistros((prev) => ({
        ...prev,
        [dataInicio]: {
          tipo: 'menstruacao',
          sintomas: prev[dataInicio]?.sintomas ?? [],
          observacao: prev[dataInicio]?.observacao ?? '',
          intensidade,
        },
      }));
    },
    [ciclos]
  );

  const finalizarCiclo = useCallback(
    (dataFim: string) => {
      const cicloAtivo = ciclos.find((c) => c.dataFim === null);
      if (!cicloAtivo) return;

      setCiclos((prev) =>
        prev.map((c) => (c.id === cicloAtivo.id ? { ...c, dataFim } : c))
      );

      // Marca todos os dias entre início e fim como menstruação
      const dias = diffDias(cicloAtivo.dataInicio, dataFim);
      setRegistros((prev) => {
        const novos = { ...prev };
        for (let i = 0; i <= dias; i++) {
          const diaISO = adicionarDiasISO(cicloAtivo.dataInicio, i);
          if (!novos[diaISO] || novos[diaISO].tipo !== 'menstruacao') {
            novos[diaISO] = {
              tipo: 'menstruacao',
              sintomas: novos[diaISO]?.sintomas ?? [],
              observacao: novos[diaISO]?.observacao ?? '',
              intensidade: cicloAtivo.intensidade,
            };
          }
        }
        return novos;
      });
    },
    [ciclos]
  );

  const cancelarCicloAtivo = useCallback(() => {
    const cicloAtivo = ciclos.find((c) => c.dataFim === null);
    if (!cicloAtivo) return;

    setCiclos((prev) => prev.filter((c) => c.id !== cicloAtivo.id));

    setRegistros((prev) => reclassificarRegistro(prev, cicloAtivo.dataInicio));
  }, [ciclos]);

  const excluirCiclo = useCallback(
    (cicloId: string) => {
      const ciclo = ciclos.find((c) => c.id === cicloId);
      if (!ciclo) return;

      setCiclos((prev) => prev.filter((c) => c.id !== cicloId));

      const fim = ciclo.dataFim ?? ciclo.dataInicio;
      const dias = diffDias(ciclo.dataInicio, fim);

      setRegistros((prev) => {
        let novos = { ...prev };
        for (let i = 0; i <= dias; i++) {
          const diaISO = adicionarDiasISO(ciclo.dataInicio, i);
          novos = reclassificarRegistro(novos, diaISO);
        }
        return novos;
      });
    },
    [ciclos]
  );

  const editarCiclo = useCallback(
    (
      cicloId: string,
      novaDataInicio: string,
      novaDataFim: string | null,
      novaIntensidade: IntensidadeFluxo
    ) => {
      const cicloAntigo = ciclos.find((c) => c.id === cicloId);
      if (!cicloAntigo) return;

      setCiclos((prev) =>
        prev.map((c) =>
          c.id === cicloId
            ? {
                ...c,
                dataInicio: novaDataInicio,
                dataFim: novaDataFim,
                intensidade: novaIntensidade,
              }
            : c
        )
      );

      setRegistros((prev) => {
        let novos = { ...prev };

        // 1. Limpa dias do ciclo antigo
        const fimAntigo = cicloAntigo.dataFim ?? cicloAntigo.dataInicio;
        const diasAntigos = diffDias(cicloAntigo.dataInicio, fimAntigo);
        for (let i = 0; i <= diasAntigos; i++) {
          const diaISO = adicionarDiasISO(cicloAntigo.dataInicio, i);
          novos = reclassificarRegistro(novos, diaISO);
        }

        // 2. Aplica dias do novo ciclo
        const fimNovo = novaDataFim ?? novaDataInicio;
        const diasNovos = diffDias(novaDataInicio, fimNovo);
        for (let i = 0; i <= diasNovos; i++) {
          const diaISO = adicionarDiasISO(novaDataInicio, i);
          const reg = novos[diaISO];
          novos[diaISO] = {
            tipo: 'menstruacao',
            sintomas: reg?.sintomas ?? [],
            observacao: reg?.observacao ?? '',
            intensidade: novaIntensidade,
          };
        }

        return novos;
      });
    },
    [ciclos]
  );

  const obterCicloDoDia = useCallback(
    (dataISO: string): Ciclo | null => {
      const [anoT, mesT, diaT] = dataISO.split('-').map(Number);
      const targetTime = new Date(anoT, mesT - 1, diaT).getTime();

      for (const c of ciclos) {
        const [anoI, mesI, diaI] = c.dataInicio.split('-').map(Number);
        const startTime = new Date(anoI, mesI - 1, diaI).getTime();

        const endISO = c.dataFim ?? c.dataInicio;
        const [anoF, mesF, diaF] = endISO.split('-').map(Number);
        const endTime = new Date(anoF, mesF - 1, diaF).getTime();

        if (targetTime >= startTime && targetTime <= endTime) {
          return c;
        }
      }
      return null;
    },
    [ciclos]
  );

  // -----------------------------------------------------------------------
  // Funções de registro diário
  // -----------------------------------------------------------------------

  const salvarRegistroDia = useCallback(
    (chave: string, dados: RegistroDia) => {
      setRegistros((prev) => ({ ...prev, [chave]: dados }));
    },
    []
  );

  const removerRegistroDia = useCallback((chave: string) => {
    setRegistros((prev) => {
      const novos = { ...prev };
      delete novos[chave];
      return novos;
    });
  }, []);

  return (
    <DiarioContext.Provider
      value={{
        ciclos,
        registros,
        carregando,
        iniciarCiclo,
        finalizarCiclo,
        cancelarCicloAtivo,
        excluirCiclo,
        editarCiclo,
        obterCicloAtivo,
        obterCicloDoDia,
        salvarRegistroDia,
        removerRegistroDia,
      }}
    >
      {children}
    </DiarioContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDiario(): DiarioContextData {
  const context = useContext(DiarioContext);
  if (!context) {
    throw new Error('useDiario deve ser usado dentro de um DiarioProvider');
  }
  return context;
}
