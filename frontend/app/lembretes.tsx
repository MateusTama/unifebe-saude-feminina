import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Badge from './components/Badge';
import Button from './components/Button';
import Header from './components/Header';
import { borda, cores, espacamento, tipografia } from './styles/theme';

export interface Lembrete {
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  hora: string;
  concluido: boolean;
}

const LEMBRETES_INICIAIS: Lembrete[] = [
  {
    id: '1',
    titulo: 'Consulta ginecologista',
    descricao: 'Consulta de rotina anual',
    data: '2026-03-25',
    hora: '14:00',
    concluido: true,
  },
  {
    id: '2',
    titulo: 'Exame de Papanicolau',
    descricao: 'Levar resultados anteriores',
    data: '2026-04-10',
    hora: '09:00',
    concluido: true,
  },
  {
    id: '3',
    titulo: 'teste',
    descricao: 'Observação do lembrete de teste',
    data: '2026-09-03',
    hora: '01:44',
    concluido: false,
  },
];

export default function TelaLembretes() {
  const router = useRouter();
  const [lembretes, setLembretes] = useState<Lembrete[]>(LEMBRETES_INICIAIS);
  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState<'criar' | 'editar'>('criar');
  const [lembreteEditandoId, setLembreteEditandoId] = useState<string | null>(null);

  // Formulário do modal
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [concluido, setConcluido] = useState(false);

  const abrirModalCriar = () => {
    setTitulo('');
    setDescricao('');
    setData(new Date().toISOString().split('T')[0]);
    setHora('08:00');
    setConcluido(false);
    setModoModal('criar');
    setLembreteEditandoId(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (lembrete: Lembrete) => {
    setTitulo(lembrete.titulo);
    setDescricao(lembrete.descricao ?? '');
    setData(lembrete.data);
    setHora(lembrete.hora);
    setConcluido(lembrete.concluido);
    setModoModal('editar');
    setLembreteEditandoId(lembrete.id);
    setModalAberto(true);
  };

  const alternarConcluidoRapido = (id: string) => {
    setLembretes((atuais) =>
      atuais.map((l) => (l.id === id ? { ...l, concluido: !l.concluido } : l))
    );
  };

  const excluirLembrete = (id: string) => {
    setLembretes((atuais) => atuais.filter((l) => l.id !== id));
    if (modalAberto && lembreteEditandoId === id) {
      setModalAberto(false);
    }
  };

  const salvarLembrete = () => {
    if (!titulo.trim()) return;

    const dataFinal = data.trim() || new Date().toISOString().split('T')[0];
    const horaFinal = hora.trim() || '08:00';

    if (modoModal === 'criar') {
      const novo: Lembrete = {
        id: Date.now().toString(),
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        data: dataFinal,
        hora: horaFinal,
        concluido: false,
      };
      setLembretes((atuais) => [novo, ...atuais]);
    } else if (lembreteEditandoId) {
      setLembretes((atuais) =>
        atuais.map((l) =>
          l.id === lembreteEditandoId
            ? {
                ...l,
                titulo: titulo.trim(),
                descricao: descricao.trim() || undefined,
                data: dataFinal,
                hora: horaFinal,
                concluido,
              }
            : l
        )
      );
    }

    setModalAberto(false);
  };

  return (
    <View style={estilos.container}>
      <Header
        nome="Lembretes"
        mostrarVoltar
        aoVoltar={() => router.replace('/perfil' as never)}
        iconeDireita="add"
        aoClicarIcone={abrirModalCriar}
      />

      {lembretes.length === 0 ? (
        <View style={estilos.estadoVazio}>
          <MaterialIcons name="notifications-none" size={64} color={cores.mutedForeground} />
          <Text style={estilos.tituloVazio}>Nenhum lembrete cadastrado</Text>
          <Text style={estilos.subtituloVazio}>
            Toque no botão + acima para adicionar um novo lembrete.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lembretes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={estilos.cartaoLembrete}
              onPress={() => abrirModalEditar(item)}
              activeOpacity={0.8}
            >
              <View style={estilos.ladoEsquerdo}>
                {/* Ícone indicador de status */}
                <View style={estilos.iconeStatus}>
                  <MaterialIcons
                    name={item.concluido ? 'check-circle-outline' : 'error-outline'}
                    size={24}
                    color={item.concluido ? cores.mutedForeground : cores.primaria}
                  />
                </View>

                {/* Conteúdo: Título, Descrição, Data/Hora e Badge */}
                <View style={estilos.infoLembrete}>
                  <Text
                    style={[
                      estilos.tituloLembrete,
                      item.concluido && estilos.tituloConcluido,
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.titulo}
                  </Text>

                  {item.descricao ? (
                    <Text
                      style={[
                        estilos.descricaoLembrete,
                        item.concluido && estilos.descricaoConcluida,
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.descricao}
                    </Text>
                  ) : null}

                  <View style={estilos.linhaDataHora}>
                    <MaterialIcons name="event" size={16} color={cores.mutedForeground} />
                    <Text style={estilos.textoDataHora}>{item.data}</Text>

                    <MaterialIcons
                      name="access-time"
                      size={16}
                      color={cores.mutedForeground}
                      style={{ marginLeft: 8 }}
                    />
                    <Text style={estilos.textoDataHora}>{item.hora}</Text>
                  </View>

                  <View style={estilos.badgeWrapper}>
                    <Badge
                      rotulo={item.concluido ? 'Concluído' : 'Pendente'}
                      variante={item.concluido ? 'muted' : 'destaque'}
                    />
                  </View>
                </View>
              </View>

              {/* Ação Rápida no Lado Direito */}
              <View style={estilos.ladoDireito}>
                {item.concluido ? (
                  // Concluído: Exibe lixeira para excluir
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      excluirLembrete(item.id);
                    }}
                    style={estilos.botaoAcaoRapida}
                    activeOpacity={0.7}
                    accessibilityLabel="Excluir lembrete"
                  >
                    <MaterialIcons name="delete-outline" size={24} color={cores.mutedForeground} />
                  </TouchableOpacity>
                ) : (
                  // Pendente: Exibe botão para marcar como concluído com 1 toque
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      alternarConcluidoRapido(item.id);
                    }}
                    style={[estilos.botaoAcaoRapida, estilos.botaoConcluirPendente]}
                    activeOpacity={0.7}
                    accessibilityLabel="Marcar como concluído"
                  >
                    <MaterialIcons name="check" size={20} color={cores.primaria} />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
        />
      )}

      {/* Modal para visualizar, editar ou adicionar lembrete */}
      <Modal
        visible={modalAberto}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAberto(false)}
      >
        <Pressable style={estilos.modalOverlay} onPress={() => setModalAberto(false)}>
          <Pressable style={estilos.modalContainer} onPress={() => {}}>
            <View style={estilos.modalCabecalho}>
              <Text style={estilos.modalTitulo}>
                {modoModal === 'criar' ? 'Novo Lembrete' : 'Detalhes do Lembrete'}
              </Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}>
                <MaterialIcons name="close" size={24} color={cores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={estilos.modalScroll}>
              <View style={estilos.modalFormulario}>
                {/* Campo Título */}
                <View style={estilos.campoModal}>
                  <Text style={estilos.rotuloModal}>Título</Text>
                  <TextInput
                    style={estilos.inputModal}
                    placeholder="Ex: Consulta médica"
                    placeholderTextColor={cores.mutedForeground}
                    value={titulo}
                    onChangeText={setTitulo}
                  />
                </View>

                {/* Campo Descrição */}
                <View style={estilos.campoModal}>
                  <Text style={estilos.rotuloModal}>Descrição</Text>
                  <TextInput
                    style={[estilos.inputModal, estilos.inputModalDescricao]}
                    placeholder="Observações ou detalhes do lembrete"
                    placeholderTextColor={cores.mutedForeground}
                    value={descricao}
                    onChangeText={setDescricao}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Linha com Data e Horário (50% cada) */}
                <View style={estilos.linhaCamposDuplos}>
                  {/* Campo Data */}
                  <View style={estilos.campoModalMetade}>
                    <Text style={estilos.rotuloModal}>Data</Text>
                    <View style={estilos.containerInputIcone}>
                      <TextInput
                        style={estilos.inputComIcone}
                        placeholder="AAAA-MM-DD"
                        placeholderTextColor={cores.mutedForeground}
                        value={data}
                        onChangeText={setData}
                        {...({ type: 'date' } as any)}
                      />
                      <MaterialIcons name="event" size={20} color={cores.textoPrincipal} style={estilos.iconeInput} />
                    </View>
                  </View>

                  {/* Campo Horário */}
                  <View style={estilos.campoModalMetade}>
                    <Text style={estilos.rotuloModal} numberOfLines={1} ellipsizeMode="tail">
                      Horário
                    </Text>
                    <View style={estilos.containerInputIcone}>
                      <TextInput
                        style={estilos.inputComIcone}
                        placeholder="HH:MM"
                        placeholderTextColor={cores.mutedForeground}
                        value={hora}
                        onChangeText={setHora}
                        {...({ type: 'time' } as any)}
                      />
                      <MaterialIcons name="access-time" size={20} color={cores.textoPrincipal} style={estilos.iconeInput} />
                    </View>
                  </View>
                </View>

                {/* Opção Marcar como Concluído (apenas se ainda estiver pendente) */}
                {modoModal === 'editar' && !concluido && (
                  <Button
                    titulo="Marcar como concluído"
                    variante="secundario"
                    icone="check"
                    onPress={() => setConcluido(true)}
                  />
                )}

                {/* Botão Salvar / Adicionar (quando criando ou pendente) */}
                {!concluido && (
                  <Button
                    titulo={modoModal === 'criar' ? 'Adicionar lembrete' : 'Salvar alterações'}
                    variante="primario"
                    onPress={salvarLembrete}
                  />
                )}

                {/* Botão Excluir no Modo Edição */}
                {modoModal === 'editar' && lembreteEditandoId && (
                  <Button
                    titulo="Excluir lembrete"
                    variante="destrutivo"
                    icone="delete-outline"
                    onPress={() => excluirLembrete(lembreteEditandoId)}
                  />
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  lista: {
    padding: espacamento.md,
    paddingBottom: espacamento.xg,
  },
  separador: {
    height: espacamento.md,
  },
  cartaoLembrete: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: borda.md,
    padding: espacamento.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  ladoEsquerdo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: espacamento.md,
    marginRight: espacamento.pq,
  },
  iconeStatus: {
    marginTop: 2,
  },
  infoLembrete: {
    flex: 1,
    gap: 4,
  },
  tituloLembrete: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
  },
  tituloConcluido: {
    textDecorationLine: 'line-through',
    color: cores.mutedForeground,
  },
  descricaoLembrete: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    lineHeight: 18,
  },
  descricaoConcluida: {
    textDecorationLine: 'line-through',
    color: cores.mutedForeground,
    opacity: 0.8,
  },
  linhaDataHora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  textoDataHora: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  ladoDireito: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAcaoRapida: {
    padding: 6,
  },
  botaoConcluirPendente: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: cores.primaria,
    backgroundColor: cores.destaque,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },

  // Estado vazio
  estadoVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacamento.xg,
    gap: espacamento.pq,
  },
  tituloVazio: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginTop: espacamento.pq,
  },
  subtituloVazio: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    textAlign: 'center',
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
    maxHeight: '88%',
  },
  modalCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamento.gd,
  },
  modalTitulo: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  modalFormulario: {
    gap: espacamento.md,
  },
  campoModal: {
    gap: espacamento.pq,
  },
  rotuloModal: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    color: cores.textoPrincipal,
  },
  inputModal: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: borda.md,
    backgroundColor: cores.branco,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.pq,
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.textoPrincipal,
    minHeight: 48,
  },
  inputModalDescricao: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  containerInputIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: borda.md,
    backgroundColor: cores.branco,
    paddingHorizontal: espacamento.md,
    minHeight: 48,
  },
  inputComIcone: {
    flex: 1,
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.textoPrincipal,
    paddingVertical: espacamento.pq,
  },
  iconeInput: {
    marginLeft: espacamento.pq,
  },
  linhaCamposDuplos: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamento.md,
    width: '100%',
  },
  campoModalMetade: {
    flex: 1,
    gap: espacamento.pq,
  },
});
