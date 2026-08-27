import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import Button from './components/Button';
import CalendarioMenstrual from './components/CalendarioMenstrual';
import type { RegistrosDias as RegistrosDiasCalendario } from './components/CalendarioMenstrual';
import InfoList from './components/InfoList';
import Chip from './components/Chip';
import Input from './components/Input';
import DateInput from './components/DateInput';
import { borda, cores, espacamento, tipografia } from './styles/theme';
import { useDiario } from './context/DiarioContext';
import type { IntensidadeFluxo } from './types/diario';
import {
  calcularDuracaoMedia,
  calcularJanelaFertil,
  calcularProximaMenstruacao,
  calcularRegularidade,
  formatarDataCurta,
  formatarDataISOCurta,
  formatarJanelaFertil,
  gerarPrevisoes,
  obterUltimoCicloInicio,
  verificarSobreposicaoCiclos,
} from './services/calculoCiclo';

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

type PasoModal =
  | 'escolha'
  | 'sintomas'
  | 'iniciar_menstruacao'
  | 'editar_ciclo'
  | 'confirmar_cancelar'
  | 'confirmar_excluir';

// ---------------------------------------------------------------------------
// Constantes locais
// ---------------------------------------------------------------------------

const SINTOMAS_DISPONIVEIS = [
  { id: 'colica',           rotulo: '💥 Cólica'                  },
  { id: 'dor_cabeca',       rotulo: '🤕 Dor de cabeça'           },
  { id: 'corrimento',       rotulo: '💧 Corrimento'              },
  { id: 'nausea',           rotulo: '🤢 Náusea'                  },
  { id: 'cansaco',          rotulo: '😴 Cansaço'                 },
  { id: 'ansiedade',        rotulo: '😰 Ansiedade'               },
  { id: 'inchaco',          rotulo: '📍 Inchaço'                 },
  { id: 'insonia',          rotulo: '🌙 Insônia'                 },
  { id: 'irritabilidade',   rotulo: '😤 Irritabilidade'          },
  { id: 'dor_costas',       rotulo: '🔙 Dor nas costas'          },
  { id: 'sens_mamas',       rotulo: '⚡ Sensibilidade nas mamas' },
  { id: 'acne',             rotulo: '🔴 Acne'                    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chaveParaISO(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function formatarDataModal(ano: number, mes: number, dia: number): string {
  const data = new Date(ano, mes - 1, dia);
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function dateParaISO(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function isoParaDate(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

function diffDias(isoA: string, isoB: string): number {
  const [aA, mA, dA] = isoA.split('-').map(Number);
  const [aB, mB, dB] = isoB.split('-').map(Number);
  const dateA = new Date(aA, mA - 1, dA);
  const dateB = new Date(aB, mB - 1, dB);
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Tela principal: Diário de Saúde
// ---------------------------------------------------------------------------

export default function Diario() {
  const insets = useSafeAreaInsets();
  const {
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
  } = useDiario();

  const [hoje, setHoje] = useState(() => new Date());
  const hojeInicio = useMemo(
    () => new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
    [hoje]
  );

  useFocusEffect(
    useCallback(() => {
      const agora = new Date();
      setHoje(agora);
    }, [])
  );

  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [mesAtual, setMesAtual] = useState(hoje.getMonth() + 1);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [pasoModal, setPasoModal] = useState<PasoModal>('escolha');

  // Estado do formulário de sintomas no modal
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');
  const [intensidade, setIntensidade] = useState<IntensidadeFluxo>('moderado');

  // Estado de edição de ciclo no modal
  const [editDataInicio, setEditDataInicio] = useState<Date>(hoje);
  const [editDataFim, setEditDataFim] = useState<Date>(hoje);
  const [editIntensidade, setEditIntensidade] = useState<IntensidadeFluxo>('moderado');
  const [editErro, setEditErro] = useState<string | null>(null);
  const [iniciarErro, setIniciarErro] = useState<string | null>(null);
  const [finalizarErro, setFinalizarErro] = useState<string | null>(null);

  // Confirmação de avisos (para permitir continuar mesmo com alerta)
  const [iniciarAvisoConfirmado, setIniciarAvisoConfirmado] = useState(false);
  const [finalizarAvisoConfirmado, setFinalizarAvisoConfirmado] = useState(false);
  const [editAvisoConfirmado, setEditAvisoConfirmado] = useState(false);

  const cicloAtivo = obterCicloAtivo();

  // Dados do dia selecionado
  const dataISOSelecionada =
    diaSelecionado !== null ? chaveParaISO(anoAtual, mesAtual, diaSelecionado) : '';
  const cicloDoDiaSelecionado = dataISOSelecionada ? obterCicloDoDia(dataISOSelecionada) : null;

  // ---------------------------------------------------------------------------
  // Cálculos derivados (memoizados)
  // ---------------------------------------------------------------------------

  const duracaoMedia = useMemo(() => calcularDuracaoMedia(ciclos), [ciclos]);
  const regularidade = useMemo(() => calcularRegularidade(ciclos), [ciclos]);
  const proximaMenstruacao = useMemo(() => calcularProximaMenstruacao(ciclos), [ciclos]);
  const janelaFertil = useMemo(() => calcularJanelaFertil(ciclos), [ciclos]);
  const ultimoCicloInicio = useMemo(() => obterUltimoCicloInicio(ciclos), [ciclos]);

  // Merge registros reais + previsões para o calendário
  const registrosComPrevisoes: RegistrosDiasCalendario = useMemo(() => {
    const previsoes = gerarPrevisoes(ciclos, registros);
    return { ...previsoes, ...registros };
  }, [ciclos, registros]);

  // ---------------------------------------------------------------------------
  // Navegação de mês
  // ---------------------------------------------------------------------------

  function irMesAnterior() {
    if (mesAtual === 1) {
      setMesAtual(12);
      setAnoAtual((a) => a - 1);
    } else {
      setMesAtual((m) => m - 1);
    }
    setDiaSelecionado(null);
  }

  function irProximoMes() {
    if (mesAtual === 12) {
      setMesAtual(1);
      setAnoAtual((a) => a + 1);
    } else {
      setMesAtual((m) => m + 1);
    }
    setDiaSelecionado(null);
  }

  // ---------------------------------------------------------------------------
  // Abrir modal ao clicar em um dia
  // ---------------------------------------------------------------------------

  function abrirModal(dia: number) {
    const dataSelecionada = new Date(anoAtual, mesAtual - 1, dia);
    if (dataSelecionada > hojeInicio) return;

    setDiaSelecionado(dia);
    const dataISO = chaveParaISO(anoAtual, mesAtual, dia);
    const existente = registros[dataISO];
    const cicloEncontrado = obterCicloDoDia(dataISO);

    setSintomasSelecionados(existente?.sintomas ?? []);
    setObservacao(existente?.observacao ?? '');
    setIntensidade(existente?.intensidade ?? cicloEncontrado?.intensidade ?? 'moderado');

    if (cicloEncontrado) {
      setEditDataInicio(isoParaDate(cicloEncontrado.dataInicio));
      setEditDataFim(isoParaDate(cicloEncontrado.dataFim ?? cicloEncontrado.dataInicio));
      setEditIntensidade(cicloEncontrado.intensidade);
    } else {
      setEditDataInicio(dataSelecionada);
      setEditDataFim(dataSelecionada);
      setEditIntensidade('moderado');
    }
    setEditErro(null);
    setIniciarErro(null);
    setFinalizarErro(null);
    setIniciarAvisoConfirmado(false);
    setFinalizarAvisoConfirmado(false);
    setEditAvisoConfirmado(false);

    setPasoModal('escolha');
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
    setPasoModal('escolha');
    setEditErro(null);
    setIniciarErro(null);
    setFinalizarErro(null);
    setIniciarAvisoConfirmado(false);
    setFinalizarAvisoConfirmado(false);
    setEditAvisoConfirmado(false);
  }

  // ---------------------------------------------------------------------------
  // Ações de Sintomas
  // ---------------------------------------------------------------------------

  function salvarSintomas() {
    if (diaSelecionado === null) return;
    const chave = chaveParaISO(anoAtual, mesAtual, diaSelecionado);
    const existente = registros[chave];
    const eMenstruacao = existente?.tipo === 'menstruacao';
    const temAlgo = sintomasSelecionados.length > 0 || observacao.trim().length > 0;

    if (!temAlgo) {
      if (eMenstruacao) {
        salvarRegistroDia(chave, {
          tipo: 'menstruacao',
          sintomas: [],
          observacao: '',
          intensidade: existente?.intensidade,
        });
      } else {
        removerRegistroDia(chave);
      }
    } else {
      salvarRegistroDia(chave, {
        tipo: eMenstruacao ? 'menstruacao' : 'sintomas',
        sintomas: sintomasSelecionados,
        observacao: observacao.trim(),
        intensidade: existente?.intensidade,
      });
    }
    fecharModal();
  }

  function limparSintomasDoDia() {
    if (diaSelecionado === null) return;
    const chave = chaveParaISO(anoAtual, mesAtual, diaSelecionado);
    const existente = registros[chave];
    const eMenstruacao = existente?.tipo === 'menstruacao';

    if (eMenstruacao) {
      salvarRegistroDia(chave, {
        tipo: 'menstruacao',
        sintomas: [],
        observacao: '',
        intensidade: existente?.intensidade,
      });
    } else {
      removerRegistroDia(chave);
    }
    fecharModal();
  }

  function toggleSintoma(id: string) {
    setSintomasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  // ---------------------------------------------------------------------------
  // Ações de Ciclo
  // ---------------------------------------------------------------------------

  function aoIniciarMenstruacao() {
    if (diaSelecionado === null) return;
    const dataISO = chaveParaISO(anoAtual, mesAtual, diaSelecionado);

    const conflito = verificarSobreposicaoCiclos(ciclos, dataISO, null);
    if (conflito) {
      setIniciarErro(
        `Já existe um ciclo registrado de ${formatarDataISOCurta(conflito.dataInicio)} a ${formatarDataISOCurta(
          conflito.dataFim ?? conflito.dataInicio
        )}. Edite o ciclo existente para alterar as datas.`
      );
      return;
    }

    const ultimoFinalizado = ciclos
      .filter((c) => c.dataFim !== null)
      .sort((a, b) => (b.dataFim ?? b.dataInicio).localeCompare(a.dataFim ?? a.dataInicio))[0];

    if (ultimoFinalizado && ultimoFinalizado.dataFim) {
      const intervalo = diffDias(ultimoFinalizado.dataFim, dataISO);
      if (intervalo >= 0 && intervalo < 15 && !iniciarAvisoConfirmado) {
        setIniciarErro(
          `Apenas ${intervalo} dias desde o término do último ciclo (${formatarDataISOCurta(ultimoFinalizado.dataFim)}). Ciclos com intervalo menor que 21 dias são incomuns. Clique novamente para confirmar.`
        );
        setIniciarAvisoConfirmado(true);
        return;
      }
    }

    iniciarCiclo(dataISO, intensidade);
    fecharModal();
  }

  function aoFinalizarMenstruacao() {
    if (diaSelecionado === null || !cicloAtivo) return;
    const dataISO = chaveParaISO(anoAtual, mesAtual, diaSelecionado);

    if (dataISO < cicloAtivo.dataInicio) {
      return;
    }

    const conflito = verificarSobreposicaoCiclos(
      ciclos,
      cicloAtivo.dataInicio,
      dataISO,
      cicloAtivo.id
    );
    if (conflito) {
      setFinalizarErro(
        `Já existe um ciclo registrado de ${formatarDataISOCurta(conflito.dataInicio)} a ${formatarDataISOCurta(
          conflito.dataFim ?? conflito.dataInicio
        )}. Edite o ciclo existente para alterar as datas.`
      );
      return;
    }

    const duracao = diffDias(cicloAtivo.dataInicio, dataISO) + 1;
    if (duracao > 10 && !finalizarAvisoConfirmado) {
      setFinalizarErro(
        `Duração de ${duracao} dias é incomum (menstruações normalmente duram de 2 a 8 dias). Clique em finalizar novamente para confirmar.`
      );
      setFinalizarAvisoConfirmado(true);
      return;
    }

    finalizarCiclo(dataISO);
    fecharModal();
  }

  function aoSalvarEdicaoCiclo() {
    if (!cicloDoDiaSelecionado) return;

    if (editDataFim < editDataInicio) {
      setEditErro('A data de término não pode ser anterior à data de início.');
      return;
    }
    if (editDataFim > hojeInicio || editDataInicio > hojeInicio) {
      setEditErro('Não é permitido registrar datas futuras.');
      return;
    }

    const isoInicio = dateParaISO(editDataInicio);
    const isoFim = dateParaISO(editDataFim);

    const conflito = verificarSobreposicaoCiclos(
      ciclos,
      isoInicio,
      isoFim,
      cicloDoDiaSelecionado.id
    );
    if (conflito) {
      setEditErro(
        `Este período colide com outro ciclo registrado de ${formatarDataISOCurta(
          conflito.dataInicio
        )} a ${formatarDataISOCurta(conflito.dataFim ?? conflito.dataInicio)}.`
      );
      return;
    }

    const duracao = diffDias(isoInicio, isoFim) + 1;
    if (duracao > 10 && !editAvisoConfirmado) {
      setEditErro(
        `Duração de ${duracao} dias é incomum (menstruações normalmente duram de 2 a 8 dias). Clique em salvar novamente para confirmar.`
      );
      setEditAvisoConfirmado(true);
      return;
    }

    editarCiclo(cicloDoDiaSelecionado.id, isoInicio, isoFim, editIntensidade);
    fecharModal();
  }

  // ---------------------------------------------------------------------------
  // Estatísticas de sintomas do mês
  // ---------------------------------------------------------------------------

  const mesFormatado = String(mesAtual).padStart(2, '0');
  const registrosMes = Object.entries(registros).filter(([chave]) =>
    chave.startsWith(`${anoAtual}-${mesFormatado}-`)
  );

  const diasComSintomas = registrosMes.filter(
    ([, d]) => (d.sintomas?.length ?? 0) > 0 || d.tipo === 'sintomas'
  ).length;

  const contagemSintomas: Record<string, number> = {};
  registrosMes.forEach(([, d]) => {
    (d.sintomas ?? []).forEach((s) => {
      contagemSintomas[s] = (contagemSintomas[s] ?? 0) + 1;
    });
  });
  const sintomaFrequente = Object.entries(contagemSintomas).sort((a, b) => b[1] - a[1])[0];
  const rotuloSintomaFrequente = sintomaFrequente
    ? SINTOMAS_DISPONIVEIS.find((s) => s.id === sintomaFrequente[0])?.rotulo ?? '—'
    : '—';

  // ---------------------------------------------------------------------------
  // Itens do InfoList — dados calculados
  // ---------------------------------------------------------------------------

  const itensCiclo = useMemo(() => {
    const itens = [];

    itens.push({
      emoji: '🔴',
      rotulo: 'Último ciclo',
      valor: ultimoCicloInicio ? formatarDataCurta(ultimoCicloInicio) : 'Sem registro',
      destaque: !!ultimoCicloInicio,
    });

    itens.push({
      emoji: '📅',
      rotulo: 'Próxima menstruação',
      valor: proximaMenstruacao ? formatarDataCurta(proximaMenstruacao) : 'Sem dados',
    });

    itens.push({
      emoji: '⏱️',
      rotulo: 'Duração média',
      valor: `${duracaoMedia} dias`,
    });

    itens.push({
      emoji: '📊',
      rotulo: 'Regularidade',
      valor: regularidade
        ? `${regularidade} ${regularidade === 'Regular' ? '✅' : '⚠️'}`
        : 'Sem dados',
      destaque: regularidade === 'Regular',
    });

    itens.push({
      emoji: '🌱',
      rotulo: 'Período fértil',
      valor: janelaFertil ? formatarJanelaFertil(janelaFertil) : 'Sem dados',
    });

    return itens;
  }, [ultimoCicloInicio, proximaMenstruacao, duracaoMedia, regularidade, janelaFertil]);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (carregando) {
    return (
      <View style={[estilos.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={estilos.container}>
      <Header nome="Diário de Saúde" editando={false} aoClicarIcone={() => {}} ocultarIcone />

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={[
          estilos.conteudo,
          { paddingTop: insets.top + espacamento.md, paddingBottom: espacamento.xg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SEÇÃO: Calendário ── */}
        <View style={estilos.secaoCalendario}>
          <CalendarioMenstrual
            ano={anoAtual}
            mes={mesAtual}
            registros={registrosComPrevisoes}
            diaSelecionado={diaSelecionado}
            aoSelecionarDia={abrirModal}
            aoMesAnterior={irMesAnterior}
            aoProximoMes={irProximoMes}
          />
        </View>

        {/* ── SEÇÃO: Seu ciclo ── */}
        <View style={estilos.secao}>
          <Text style={estilos.secaoTitulo}>Seu ciclo</Text>
          <InfoList itens={itensCiclo} style={{ marginBottom: 0 }} />
        </View>

        {/* ── SEÇÃO: Sintomas do mês ── */}
        <View style={estilos.secaoUltima}>
          <Text style={estilos.secaoTitulo}>Sintomas do mês</Text>
          <InfoList
            itens={[
              { emoji: '📌', rotulo: 'Mais frequente', valor: rotuloSintomaFrequente },
              { emoji: '📋', rotulo: 'Dias com sintomas', valor: `${diasComSintomas} dias` },
            ]}
            style={{ marginBottom: 0 }}
          />
        </View>
      </ScrollView>

      {/* ── MODAL DE REGISTRO / EDIÇÃO ── */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <Pressable style={estilos.modalOverlay} onPress={fecharModal}>
          <Pressable style={estilos.modalContainer} onPress={() => {}}>
            {/* Cabeçalho do modal */}
            <View style={estilos.modalCabecalho}>
              <Text style={estilos.modalTitulo}>
                {diaSelecionado !== null
                  ? formatarDataModal(anoAtual, mesAtual, diaSelecionado)
                  : ''}
              </Text>
              <TouchableOpacity onPress={fecharModal} style={estilos.modalBotaoFechar}>
                <MaterialIcons name="close" size={22} color={cores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            {/* PASSO 1: Escolha Contextual */}
            {pasoModal === 'escolha' && (
              <View style={estilos.escolhaContainer}>
                {/* ── CENÁRIO A: Ciclo Ativo em Andamento ── */}
                {cicloAtivo ? (
                  <>
                    <View style={estilos.infoCicloCard}>
                      <View style={estilos.infoCicloTopo}>
                        <MaterialIcons name="opacity" size={20} color={cores.secundaria} />
                        <Text style={estilos.infoCicloTitulo}>Menstruação em andamento</Text>
                      </View>
                      <Text style={estilos.infoCicloTexto}>
                        Iniciada em{' '}
                        <Text style={{ fontFamily: tipografia.inter.semibold }}>
                          {formatarDataISOCurta(cicloAtivo.dataInicio)}
                        </Text>
                      </Text>
                    </View>

                    {finalizarErro && (
                      <View style={estilos.avisoConflitoCard}>
                        <MaterialIcons name="warning" size={20} color="#B45309" />
                        <Text style={estilos.avisoConflitoTexto}>{finalizarErro}</Text>
                      </View>
                    )}

                    {/* Opção Finalizar se data for >= dataInicio */}
                    {dataISOSelecionada >= cicloAtivo.dataInicio ? (
                      <TouchableOpacity
                        style={estilos.escolhaOpcao}
                        activeOpacity={0.8}
                        onPress={aoFinalizarMenstruacao}
                      >
                        <View style={[estilos.escolhaIconeWrap, { backgroundColor: '#FFF0F3' }]}>
                          <Text style={estilos.escolhaEmoji}>🩸</Text>
                        </View>
                        <View style={estilos.escolhaTextos}>
                          <Text style={estilos.escolhaOpcaoTitulo}>
                            {dataISOSelecionada === cicloAtivo.dataInicio
                              ? 'Finalizar menstruação neste dia'
                              : `Finalizar menstruação no dia ${diaSelecionado}`}
                          </Text>
                          <Text style={estilos.escolhaOpcaoDesc}>
                            {dataISOSelecionada === cicloAtivo.dataInicio
                              ? 'Encerra o ciclo com duração de 1 dia'
                              : `Período de ${formatarDataISOCurta(cicloAtivo.dataInicio)} a ${formatarDataISOCurta(dataISOSelecionada)}`}
                          </Text>
                        </View>
                        <MaterialIcons name="check-circle" size={22} color={cores.secundaria} />
                      </TouchableOpacity>
                    ) : null}

                    {/* Opção Cancelar Ciclo Ativo */}
                    <TouchableOpacity
                      style={[estilos.escolhaOpcao, estilos.escolhaOpcaoDestrutiva]}
                      activeOpacity={0.8}
                      onPress={() => setPasoModal('confirmar_cancelar')}
                    >
                      <View style={[estilos.escolhaIconeWrap, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={estilos.escolhaEmoji}>❌</Text>
                      </View>
                      <View style={estilos.escolhaTextos}>
                        <Text style={[estilos.escolhaOpcaoTitulo, { color: '#DC2626' }]}>
                          Cancelar início da menstruação
                        </Text>
                        <Text style={estilos.escolhaOpcaoDesc}>
                          Desmarca o início e cancela este ciclo
                        </Text>
                      </View>
                      <MaterialIcons name="delete-outline" size={22} color="#DC2626" />
                    </TouchableOpacity>

                    {/* Opção Sintomas */}
                    <TouchableOpacity
                      style={estilos.escolhaOpcao}
                      activeOpacity={0.8}
                      onPress={() => setPasoModal('sintomas')}
                    >
                      <View style={[estilos.escolhaIconeWrap, { backgroundColor: cores.destaque }]}>
                        <Text style={estilos.escolhaEmoji}>😊</Text>
                      </View>
                      <View style={estilos.escolhaTextos}>
                        <Text style={estilos.escolhaOpcaoTitulo}>Sintomas e Observações</Text>
                        <Text style={estilos.escolhaOpcaoDesc}>Registre como você se sentiu hoje</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={22} color={cores.mutedForeground} />
                    </TouchableOpacity>
                  </>
                ) : cicloDoDiaSelecionado ? (
                  /* ── CENÁRIO B: Ciclo Passado Registrado ── */
                  <>
                    <View style={estilos.infoCicloCard}>
                      <View style={estilos.infoCicloTopo}>
                        <MaterialIcons name="event-available" size={20} color={cores.secundaria} />
                        <Text style={estilos.infoCicloTitulo}>Ciclo Menstrual Registrado</Text>
                      </View>
                      <Text style={estilos.infoCicloTexto}>
                        Período: {formatarDataISOCurta(cicloDoDiaSelecionado.dataInicio)} a{' '}
                        {formatarDataISOCurta(
                          cicloDoDiaSelecionado.dataFim ?? cicloDoDiaSelecionado.dataInicio
                        )}
                        {' • '}Fluxo {cicloDoDiaSelecionado.intensidade}
                      </Text>
                    </View>

                    {/* Opção Editar Período */}
                    <TouchableOpacity
                      style={estilos.escolhaOpcao}
                      activeOpacity={0.8}
                      onPress={() => setPasoModal('editar_ciclo')}
                    >
                      <View style={[estilos.escolhaIconeWrap, { backgroundColor: '#F0EBFF' }]}>
                        <Text style={estilos.escolhaEmoji}>✏️</Text>
                      </View>
                      <View style={estilos.escolhaTextos}>
                        <Text style={estilos.escolhaOpcaoTitulo}>Editar ciclo</Text>
                        <Text style={estilos.escolhaOpcaoDesc}>
                          Alterar data de início, fim ou intensidade
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={22} color={cores.mutedForeground} />
                    </TouchableOpacity>

                    {/* Opção Excluir Ciclo */}
                    <TouchableOpacity
                      style={[estilos.escolhaOpcao, estilos.escolhaOpcaoDestrutiva]}
                      activeOpacity={0.8}
                      onPress={() => setPasoModal('confirmar_excluir')}
                    >
                      <View style={[estilos.escolhaIconeWrap, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={estilos.escolhaEmoji}>🗑️</Text>
                      </View>
                      <View style={estilos.escolhaTextos}>
                        <Text style={[estilos.escolhaOpcaoTitulo, { color: '#DC2626' }]}>
                          Excluir este ciclo menstrual
                        </Text>
                        <Text style={estilos.escolhaOpcaoDesc}>
                          Remove o período e mantém as anotações
                        </Text>
                      </View>
                      <MaterialIcons name="delete" size={22} color="#DC2626" />
                    </TouchableOpacity>

                    {/* Opção Sintomas */}
                    <TouchableOpacity
                      style={estilos.escolhaOpcao}
                      activeOpacity={0.8}
                      onPress={() => setPasoModal('sintomas')}
                    >
                      <View style={[estilos.escolhaIconeWrap, { backgroundColor: cores.destaque }]}>
                        <Text style={estilos.escolhaEmoji}>😊</Text>
                      </View>
                      <View style={estilos.escolhaTextos}>
                        <Text style={estilos.escolhaOpcaoTitulo}>Sintomas e Observações</Text>
                        <Text style={estilos.escolhaOpcaoDesc}>Registre como você se sentiu hoje</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={22} color={cores.mutedForeground} />
                    </TouchableOpacity>
                  </>
                ) : (
                  /* ── CENÁRIO C: Dia Neutro ── */
                  <>
                    <Text style={estilos.escolhaSubtitulo}>O que deseja registrar?</Text>

                    <TouchableOpacity
                      style={estilos.escolhaOpcao}
                      activeOpacity={0.8}
                      onPress={() => setPasoModal('iniciar_menstruacao')}
                    >
                      <View style={[estilos.escolhaIconeWrap, { backgroundColor: '#FFF0F3' }]}>
                        <Text style={estilos.escolhaEmoji}>🩸</Text>
                      </View>
                      <View style={estilos.escolhaTextos}>
                        <Text style={estilos.escolhaOpcaoTitulo}>Menstruação</Text>
                        <Text style={estilos.escolhaOpcaoDesc}>
                          Registrar início do período menstrual
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={22} color={cores.mutedForeground} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={estilos.escolhaOpcao}
                      activeOpacity={0.8}
                      onPress={() => setPasoModal('sintomas')}
                    >
                      <View style={[estilos.escolhaIconeWrap, { backgroundColor: cores.destaque }]}>
                        <Text style={estilos.escolhaEmoji}>😊</Text>
                      </View>
                      <View style={estilos.escolhaTextos}>
                        <Text style={estilos.escolhaOpcaoTitulo}>Sintomas</Text>
                        <Text style={estilos.escolhaOpcaoDesc}>
                          Registre como você se sentiu hoje
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={22} color={cores.mutedForeground} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* PASSO 2A: Formulário de Sintomas */}
            {pasoModal === 'sintomas' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={estilos.modalSecaoTitulo}>Como você se sentiu?</Text>
                <View style={estilos.chipRow}>
                  {SINTOMAS_DISPONIVEIS.map((s) => (
                    <Chip
                      key={s.id}
                      rotulo={s.rotulo}
                      ativo={sintomasSelecionados.includes(s.id)}
                      aoPress={() => toggleSintoma(s.id)}
                    />
                  ))}
                </View>

                <Text style={estilos.modalSecaoTitulo}>Observações do dia</Text>
                <Input
                  placeholder="Como foi seu dia?"
                  valor={observacao}
                  aoMudar={setObservacao}
                />

                <View style={estilos.botoesSintomas}>
                  <Button
                    titulo="Salvar sintomas"
                    variante="primario"
                    onPress={salvarSintomas}
                  />

                  {((registros[chaveParaISO(anoAtual, mesAtual, diaSelecionado ?? 0)]?.sintomas?.length ?? 0) > 0 ||
                    (registros[chaveParaISO(anoAtual, mesAtual, diaSelecionado ?? 0)]?.observacao?.trim()?.length ?? 0) > 0) && (
                    <TouchableOpacity
                      style={estilos.botaoLimparSintomas}
                      activeOpacity={0.8}
                      onPress={limparSintomasDoDia}
                    >
                      <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
                      <Text style={estilos.textoBotaoLimparSintomas}>Limpar sintomas deste dia</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}

            {/* PASSO 2B: Iniciar Menstruação (Dia Neutro) */}
            {pasoModal === 'iniciar_menstruacao' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={estilos.modalSecaoTitulo}>Intensidade do fluxo</Text>
                <View style={estilos.intensidadeRow}>
                  {(
                    [
                      { id: 'leve',     rotulo: 'Leve',     emoji: '💧'       },
                      { id: 'moderado', rotulo: 'Moderado', emoji: '💧💧'     },
                      { id: 'intenso',  rotulo: 'Intenso',  emoji: '💧💧💧'   },
                    ] as { id: IntensidadeFluxo; rotulo: string; emoji: string }[]
                  ).map((op) => (
                    <TouchableOpacity
                      key={op.id}
                      style={[
                        estilos.intensidadeCard,
                        intensidade === op.id && estilos.intensidadeCardAtivo,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setIntensidade(op.id)}
                    >
                      <Text style={estilos.intensidadeEmoji}>{op.emoji}</Text>
                      <Text
                        style={[
                          estilos.intensidadeRotulo,
                          intensidade === op.id && estilos.intensidadeRotuloAtivo,
                        ]}
                      >
                        {op.rotulo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {iniciarErro && (
                  <Text style={estilos.erroTexto}>{iniciarErro}</Text>
                )}

                <Button
                  titulo="Iniciar menstruação neste dia"
                  variante="primario"
                  style={estilos.botaoSalvar}
                  onPress={aoIniciarMenstruacao}
                />
              </ScrollView>
            )}

            {/* PASSO 2C: Editar Ciclo Passado */}
            {pasoModal === 'editar_ciclo' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={estilos.voltarBtn} onPress={() => setPasoModal('escolha')}>
                  <MaterialIcons name="arrow-back" size={18} color={cores.primaria} />
                  <Text style={estilos.voltarTexto}>Voltar</Text>
                </TouchableOpacity>

                <Text style={estilos.modalSecaoTitulo}>Período do ciclo</Text>

                <View style={estilos.formDatas}>
                  <DateInput
                    rotulo="Data de início"
                    valor={editDataInicio}
                    aoMudar={(d) => {
                      setEditDataInicio(d);
                      setEditErro(null);
                    }}
                  />
                  <DateInput
                    rotulo="Data de término"
                    valor={editDataFim}
                    aoMudar={(d) => {
                      setEditDataFim(d);
                      setEditErro(null);
                    }}
                  />
                </View>

                {editErro && (
                  <Text style={estilos.erroTexto}>{editErro}</Text>
                )}

                <Text style={estilos.modalSecaoTitulo}>Intensidade do fluxo</Text>
                <View style={estilos.intensidadeRow}>
                  {(
                    [
                      { id: 'leve',     rotulo: 'Leve',     emoji: '💧'       },
                      { id: 'moderado', rotulo: 'Moderado', emoji: '💧💧'     },
                      { id: 'intenso',  rotulo: 'Intenso',  emoji: '💧💧💧'   },
                    ] as { id: IntensidadeFluxo; rotulo: string; emoji: string }[]
                  ).map((op) => (
                    <TouchableOpacity
                      key={op.id}
                      style={[
                        estilos.intensidadeCard,
                        editIntensidade === op.id && estilos.intensidadeCardAtivo,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setEditIntensidade(op.id)}
                    >
                      <Text style={estilos.intensidadeEmoji}>{op.emoji}</Text>
                      <Text
                        style={[
                          estilos.intensidadeRotulo,
                          editIntensidade === op.id && estilos.intensidadeRotuloAtivo,
                        ]}
                      >
                        {op.rotulo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  titulo="Salvar alterações"
                  variante="primario"
                  style={estilos.botaoSalvar}
                  onPress={aoSalvarEdicaoCiclo}
                />
              </ScrollView>
            )}

            {/* PASSO 2D: Confirmar Cancelar Ciclo Ativo */}
            {pasoModal === 'confirmar_cancelar' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={estilos.confirmacaoContainer}>
                  <View style={estilos.confirmacaoIconeWrap}>
                    <MaterialIcons name="warning" size={32} color="#DC2626" />
                  </View>
                  <Text style={estilos.confirmacaoTitulo}>Cancelar início da menstruação?</Text>
                  <Text style={estilos.confirmacaoDesc}>
                    O registro de início da menstruação será desmarcado e o ciclo ativo será cancelado. Anotações de sintomas e observações serão mantidas.
                  </Text>

                  <View style={estilos.confirmacaoBotoes}>
                    <TouchableOpacity
                      style={estilos.botaoExcluirConfirmado}
                      activeOpacity={0.8}
                      onPress={() => {
                        cancelarCicloAtivo();
                        fecharModal();
                      }}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={cores.branco} />
                      <Text style={estilos.textoBotaoExcluirConfirmado}>Sim, cancelar ciclo</Text>
                    </TouchableOpacity>

                    <Button
                      titulo="Voltar"
                      variante="secundario"
                      onPress={() => setPasoModal('escolha')}
                    />
                  </View>
                </View>
              </ScrollView>
            )}

            {/* PASSO 2E: Confirmar Excluir Ciclo Completo */}
            {pasoModal === 'confirmar_excluir' && cicloDoDiaSelecionado && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={estilos.confirmacaoContainer}>
                  <View style={estilos.confirmacaoIconeWrap}>
                    <MaterialIcons name="delete-forever" size={32} color="#DC2626" />
                  </View>
                  <Text style={estilos.confirmacaoTitulo}>Excluir este ciclo menstrual?</Text>
                  <Text style={estilos.confirmacaoDesc}>
                    Deseja excluir o ciclo de{' '}
                    <Text style={{ fontFamily: tipografia.inter.semibold }}>
                      {formatarDataISOCurta(cicloDoDiaSelecionado.dataInicio)} a{' '}
                      {formatarDataISOCurta(
                        cicloDoDiaSelecionado.dataFim ?? cicloDoDiaSelecionado.dataInicio
                      )}
                    </Text>
                    ? O período será removido do histórico. Anotações de sintomas serão mantidas no calendário.
                  </Text>

                  <View style={estilos.confirmacaoBotoes}>
                    <TouchableOpacity
                      style={estilos.botaoExcluirConfirmado}
                      activeOpacity={0.8}
                      onPress={() => {
                        excluirCiclo(cicloDoDiaSelecionado.id);
                        fecharModal();
                      }}
                    >
                      <MaterialIcons name="delete" size={20} color={cores.branco} />
                      <Text style={estilos.textoBotaoExcluirConfirmado}>Sim, excluir ciclo</Text>
                    </TouchableOpacity>

                    <Button
                      titulo="Voltar"
                      variante="secundario"
                      onPress={() => setPasoModal('escolha')}
                    />
                  </View>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNavBar />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos da tela
// ---------------------------------------------------------------------------

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  scroll: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: espacamento.md,
  },
  secaoTitulo: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: espacamento.pq,
    marginTop: 0,
  },
  secaoCalendario: {
    marginTop: 0,
    marginBottom: espacamento.gd,
  },
  secao: {
    marginBottom: espacamento.gd,
  },
  secaoUltima: {
    marginBottom: 0,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: cores.branco,
    borderTopLeftRadius: borda.gd,
    borderTopRightRadius: borda.gd,
    padding: espacamento.gd,
    maxHeight: '85%',
  },
  modalCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamento.md,
  },
  modalTitulo: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
    textTransform: 'capitalize',
  },
  modalBotaoFechar: {
    padding: espacamento.xp,
  },
  escolhaContainer: {
    gap: espacamento.md,
    paddingVertical: espacamento.pq,
  },
  escolhaSubtitulo: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.medio,
    color: cores.mutedForeground,
  },
  escolhaOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    padding: espacamento.md,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  escolhaOpcaoDestrutiva: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  escolhaIconeWrap: {
    width: 48,
    height: 48,
    borderRadius: borda.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  escolhaEmoji: {
    fontSize: 22,
  },
  escolhaTextos: {
    flex: 1,
  },
  escolhaOpcaoTitulo: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: 2,
  },
  escolhaOpcaoDesc: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },
  voltarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: espacamento.md,
  },
  voltarTexto: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.medio,
    color: cores.primaria,
  },
  modalSecaoTitulo: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: espacamento.pq,
    marginTop: espacamento.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
    marginBottom: espacamento.md,
  },
  intensidadeRow: {
    flexDirection: 'row',
    gap: espacamento.pq,
    marginBottom: espacamento.md,
  },
  intensidadeCard: {
    flex: 1,
    padding: espacamento.md,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
    alignItems: 'center',
    gap: espacamento.pq,
  },
  intensidadeCardAtivo: {
    borderColor: cores.secundaria,
    backgroundColor: '#FFF5F7',
  },
  intensidadeEmoji: {
    fontSize: 20,
  },
  intensidadeRotulo: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    color: cores.mutedForeground,
  },
  intensidadeRotuloAtivo: {
    color: cores.secundaria,
    fontFamily: tipografia.inter.semibold,
  },
  botaoSalvar: {
    marginTop: espacamento.gd,
    marginBottom: espacamento.md,
  },
  botoesSintomas: {
    gap: espacamento.pq,
    marginTop: espacamento.gd,
  },
  botaoLimparSintomas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
    borderRadius: borda.gd,
    minHeight: 48,
    paddingHorizontal: espacamento.gd,
  },
  textoBotaoLimparSintomas: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.medio,
    color: '#DC2626',
  },

  // Card informativo de ciclo
  infoCicloCard: {
    backgroundColor: '#FFF5F7',
    padding: espacamento.md,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  infoCicloTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoCicloTitulo: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
  },
  infoCicloTexto: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },

  // Aviso de conflito de datas
  avisoConflitoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: borda.md,
    padding: espacamento.md,
  },
  avisoConflitoTexto: {
    flex: 1,
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    color: '#92400E',
    lineHeight: 18,
  },

  // Formulário de edição
  formDatas: {
    gap: espacamento.md,
    marginBottom: espacamento.md,
  },
  erroTexto: {
    color: '#DC2626',
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    marginBottom: espacamento.pq,
  },

  // Telas de confirmação interna
  confirmacaoContainer: {
    alignItems: 'center',
    paddingVertical: espacamento.md,
    gap: espacamento.md,
  },
  confirmacaoIconeWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmacaoTitulo: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
    textAlign: 'center',
  },
  confirmacaoDesc: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmacaoBotoes: {
    width: '100%',
    gap: espacamento.pq,
    marginTop: espacamento.md,
  },
  botaoExcluirConfirmado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: borda.gd,
    minHeight: 52,
    paddingHorizontal: espacamento.gd,
  },
  textoBotaoExcluirConfirmado: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.semibold,
    color: cores.branco,
  },
});
