import { useState } from 'react';
import {
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
import BottomNavBar from './components/BottomNavBar';
import Header from './components/Header';
import Button from './components/Button';
import CalendarioMenstrual, {
  type DadosDia,
  type RegistrosDias,
  type TipoDia,
} from './components/CalendarioMenstrual';
import Card from './components/Card';
import Chip from './components/Chip';
import Input from './components/Input';
import { borda, cores, espacamento, tipografia } from './styles/theme';

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

type PasoModal = 'escolha' | 'sintomas' | 'menstruacao';
type IntensidadeFluxo = 'leve' | 'moderado' | 'intenso';

// ---------------------------------------------------------------------------
// Constantes locais
// ---------------------------------------------------------------------------

const SINTOMAS_DISPONIVEIS = [
  { id: 'colica',           rotulo: '🌟 Cólica'                  },
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

// Dados de exemplo: dias de menstruação, férteis e ovulação para maio/2026
const REGISTROS_INICIAIS: RegistrosDias = {
  '2026-5-3':  { sintomas: ['colica'],     observacao: '', tipo: 'menstruacao' },
  '2026-5-4':  { sintomas: ['colica'],     observacao: '', tipo: 'menstruacao' },
  '2026-5-5':  { sintomas: ['dor_cabeca'], observacao: '', tipo: 'menstruacao' },
  '2026-5-6':  { sintomas: [],             observacao: '', tipo: 'menstruacao' },
  '2026-5-7':  { sintomas: [],             observacao: '', tipo: 'menstruacao' },
  '2026-5-15': { sintomas: [],             observacao: '', tipo: 'fertil'      },
  '2026-5-16': { sintomas: [],             observacao: '', tipo: 'fertil'      },
  '2026-5-17': { sintomas: [],             observacao: '', tipo: 'fertil'      },
  '2026-5-18': { sintomas: [],             observacao: '', tipo: 'fertil'      },
  '2026-5-19': { sintomas: [],             observacao: '', tipo: 'fertil'      },
  '2026-5-20': { sintomas: [],             observacao: '', tipo: 'fertil'      },
  '2026-5-21': { sintomas: [],             observacao: '', tipo: 'ovulacao'    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chaveData(ano: number, mes: number, dia: number): string {
  return `${ano}-${mes}-${dia}`;
}

function formatarDataModal(ano: number, mes: number, dia: number): string {
  const data = new Date(ano, mes - 1, dia);
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

// ---------------------------------------------------------------------------
// Tela principal: Diário
// ---------------------------------------------------------------------------

export default function Diario() {
  const insets = useSafeAreaInsets();

  const hoje = new Date();
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [mesAtual, setMesAtual] = useState(hoje.getMonth() + 1);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [pasoModal, setPasoModal] = useState<PasoModal>('escolha');
  const [registros, setRegistros] = useState<RegistrosDias>(REGISTROS_INICIAIS);

  // Estado do formulário no modal
  const [sintomasSelecionados, setSintomasSelecionados] = useState<string[]>([]);
  const [observacao, setObservacao] = useState('');
  const [intensidade, setIntensidade] = useState<IntensidadeFluxo>('moderado');

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
    setDiaSelecionado(dia);
    const chave = chaveData(anoAtual, mesAtual, dia);
    const existente = registros[chave];
    setSintomasSelecionados(existente?.sintomas ?? []);
    setObservacao(existente?.observacao ?? '');
    setIntensidade(existente?.intensidade ?? 'moderado');
    setPasoModal('escolha');
    setModalVisivel(true);
  }

  function fecharModal() {
    setModalVisivel(false);
    setPasoModal('escolha');
  }

  // ---------------------------------------------------------------------------
  // Salvar registro
  // ---------------------------------------------------------------------------

  function salvarRegistro(tipo: TipoDia) {
    if (diaSelecionado === null) return;
    const chave = chaveData(anoAtual, mesAtual, diaSelecionado);
    setRegistros((prev) => ({
      ...prev,
      [chave]: {
        sintomas: sintomasSelecionados,
        observacao,
        tipo,
        intensidade: tipo === 'menstruacao' ? intensidade : undefined,
      },
    }));
    fecharModal();
  }

  // ---------------------------------------------------------------------------
  // Toggle sintoma
  // ---------------------------------------------------------------------------

  function toggleSintoma(id: string) {
    setSintomasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  // ---------------------------------------------------------------------------
  // Estatísticas do mês atual
  // ---------------------------------------------------------------------------

  const registrosMes = Object.entries(registros).filter(([chave]) =>
    chave.startsWith(`${anoAtual}-${mesAtual}-`)
  );

  const diasMenstruacao = registrosMes.filter(([, d]) => d.tipo === 'menstruacao').length;
  const diasComSintomas = registrosMes.filter(([, d]) => (d.sintomas?.length ?? 0) > 0).length;

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
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={estilos.container}>
      <Header nome="Diário de Saúde" editando={false} aoClicarIcone={() => {}} ocultarIcone />
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={[
          estilos.conteudo,
        { paddingTop: insets.top + espacamento.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendário */}
        <View style={estilos.secaoCalendario}>
          <CalendarioMenstrual
            ano={anoAtual}
            mes={mesAtual}
            registros={registros}
            diaSelecionado={diaSelecionado}
            aoSelecionarDia={abrirModal}
            aoMesAnterior={irMesAnterior}
            aoProximoMes={irProximoMes}
          />
        </View>

        {/* Seção: Seu ciclo */}
        <Text style={estilos.secaoTitulo}>Seu ciclo</Text>
        <View style={estilos.gradeEstatisticas}>
          <Card
            nome="Último ciclo"
            valor={`${diasMenstruacao > 0 ? diasMenstruacao : '—'} dias`}
            icone="water-drop"
            destaque
          />
          <Card
            nome="Próxima menstruação"
            valor="07 jun 2026"
            icone="calendar-today"
          />
        </View>
        <View style={[estilos.gradeEstatisticas, { marginTop: espacamento.pq }]}>
          <Card
            nome="Duração média"
            valor="28 dias"
            icone="timer"
          />
          <Card
            nome="Regularidade"
            valor="Regular ✅"
            icone="bar-chart"
            destaque
          />
        </View>

        {/* Seção: Sintomas do mês */}
        <Text style={estilos.secaoTitulo}>Sintomas do mês</Text>
        <View style={estilos.gradeEstatisticas}>
          <Card
            nome="Mais frequente"
            valor={rotuloSintomaFrequente}
            icone="push-pin"
          />
          <Card
            nome="Dias com sintomas"
            valor={`${diasComSintomas} dias`}
            icone="assignment"
          />
        </View>
      </ScrollView>

      {/* Modal de registro */}
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

            {/* ── PASSO 1: Escolha ── */}
            {pasoModal === 'escolha' && (
              <View style={estilos.escolhaContainer}>
                <Text style={estilos.escolhaSubtitulo}>O que deseja registrar?</Text>
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
                    <Text style={estilos.escolhaOpcaoDesc}>Registre como você se sentiu hoje</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={cores.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={estilos.escolhaOpcao}
                  activeOpacity={0.8}
                  onPress={() => setPasoModal('menstruacao')}
                >
                  <View style={[estilos.escolhaIconeWrap, { backgroundColor: '#FFF0F3' }]}>
                    <Text style={estilos.escolhaEmoji}>🩸</Text>
                  </View>
                  <View style={estilos.escolhaTextos}>
                    <Text style={estilos.escolhaOpcaoTitulo}>Menstruação</Text>
                    <Text style={estilos.escolhaOpcaoDesc}>Registre o fluxo menstrual</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={22} color={cores.mutedForeground} />
                </TouchableOpacity>
              </View>
            )}

            {/* ── PASSO 2A: Sintomas ── */}
            {pasoModal === 'sintomas' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={estilos.voltarBtn} onPress={() => setPasoModal('escolha')}>
                  <MaterialIcons name="arrow-back" size={18} color={cores.primaria} />
                  <Text style={estilos.voltarTexto}>Voltar</Text>
                </TouchableOpacity>

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

                <Button
                  titulo="Salvar registro"
                  variante="primario"
                  style={estilos.botaoSalvar}
                  onPress={() => salvarRegistro('normal')}
                />
              </ScrollView>
            )}

            {/* ── PASSO 2B: Menstruação ── */}
            {pasoModal === 'menstruacao' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={estilos.voltarBtn} onPress={() => setPasoModal('escolha')}>
                  <MaterialIcons name="arrow-back" size={18} color={cores.primaria} />
                  <Text style={estilos.voltarTexto}>Voltar</Text>
                </TouchableOpacity>

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

                <Text style={estilos.modalSecaoTitulo}>Observações do dia</Text>
                <Input
                  placeholder="Como foi seu dia?"
                  valor={observacao}
                  aoMudar={setObservacao}
                />

                <Button
                  titulo="Salvar menstruação"
                  variante="primario"
                  style={estilos.botaoSalvar}
                  onPress={() => salvarRegistro('menstruacao')}
                />
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
    paddingBottom: espacamento.xxg,
  },
  secaoTitulo: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: espacamento.pq,
    marginTop: espacamento.md,
  },
  gradeEstatisticas: {
    flexDirection: 'row',
    gap: espacamento.pq,
  },
  secaoCalendario: {
    marginBottom: espacamento.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    fontSize: tipografia.tamanhoXg,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
  },
  modalBotaoFechar: {
    padding: 4,
  },
  modalSecaoTitulo: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.semibold,
    color: cores.mutedForeground,
    marginBottom: espacamento.pq,
    marginTop: espacamento.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
  },
  botaoSalvar: {
    marginTop: espacamento.gd,
    marginBottom: espacamento.pq,
  },

  // Escolha
  escolhaContainer: {
    gap: espacamento.md,
    paddingTop: espacamento.pq,
  },
  escolhaSubtitulo: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    marginBottom: espacamento.pq,
  },
  escolhaOpcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamento.md,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: borda.md,
    padding: espacamento.md,
  },
  escolhaIconeWrap: {
    width: 44,
    height: 44,
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
  },
  escolhaOpcaoDesc: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    marginTop: 2,
  },

  // Voltar
  voltarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: espacamento.pq,
  },
  voltarTexto: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.semibold,
    color: cores.primaria,
  },

  // Intensidade do fluxo
  intensidadeRow: {
    flexDirection: 'row',
    gap: espacamento.pq,
  },
  intensidadeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.pq,
    paddingVertical: espacamento.md,
    borderRadius: borda.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  intensidadeCardAtivo: {
    backgroundColor: cores.destaque,
    borderColor: cores.primaria,
  },
  intensidadeEmoji: {
    fontSize: 20,
  },
  intensidadeRotulo: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    color: cores.textoPrincipal,
  },
  intensidadeRotuloAtivo: {
    color: cores.primaria,
    fontFamily: tipografia.inter.semibold,
  },
});
