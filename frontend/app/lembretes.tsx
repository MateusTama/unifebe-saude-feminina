import { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Button from './components/Button';
import Header from './components/Header';
import { borda, cores, espacamento, tipografia } from './styles/theme';
import { api } from './services/api';

export interface Lembrete {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;
  hora: string;
}

export default function TelaLembretes() {
  const router = useRouter();
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState<'criar' | 'editar'>('criar');
  const [lembreteEditandoId, setLembreteEditandoId] = useState<number | null>(null);

  // Formulário do modal
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');

  useEffect(() => {
    carregarLembretes();
  }, []);

  const carregarLembretes = async () => {
    setCarregando(true);
    try {
      const resposta = await api('/lembretes/');
      if (resposta?.lembretes && Array.isArray(resposta.lembretes)) {
        // Filtra apenas lembretes com situacao == true se aplicável
        const ativos = resposta.lembretes.filter((l: any) => l.situacao !== false);

        const formatados: Lembrete[] = ativos.map((l: any) => {
          let dataStr = new Date().toISOString().split('T')[0];
          let horaStr = '08:00';

          if (l.data_hora) {
            const partes = l.data_hora.split('T');
            if (partes.length >= 1 && partes[0]) dataStr = partes[0];
            if (partes.length >= 2 && partes[1]) horaStr = partes[1].substring(0, 5);
          }

          return {
            id: l.id,
            titulo: l.titulo,
            descricao: l.descricao || undefined,
            data: dataStr,
            hora: horaStr,
          };
        });

        setLembretes(formatados);
      }
    } catch (erro: any) {
      console.error('Erro ao carregar lembretes:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const abrirModalCriar = () => {
    const hoje = new Date().toISOString().split('T')[0];
    setTitulo('');
    setDescricao('');
    setData(hoje);
    setHora('08:00');
    setModoModal('criar');
    setLembreteEditandoId(null);
    setMensagemErro('');
    setModalAberto(true);
  };

  const abrirModalEditar = (lembrete: Lembrete) => {
    setTitulo(lembrete.titulo);
    setDescricao(lembrete.descricao ?? '');
    setData(lembrete.data);
    setHora(lembrete.hora);
    setModoModal('editar');
    setLembreteEditandoId(lembrete.id);
    setMensagemErro('');
    setModalAberto(true);
  };

  const excluirLembrete = async (id: number) => {
    try {
      await api(`/lembretes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ situacao: false }),
      });
      setLembretes((atuais) => atuais.filter((l) => l.id !== id));
      if (modalAberto && lembreteEditandoId === id) {
        setModalAberto(false);
      }
    } catch (erro: any) {
      console.error('Erro ao excluir lembrete:', erro);
    }
  };

  const salvarLembrete = async () => {
    if (!titulo.trim()) {
      setMensagemErro('O título é obrigatório.');
      return;
    }

    setSalvando(true);
    setMensagemErro('');

    const dataFinal = data.trim() || new Date().toISOString().split('T')[0];
    const horaFinal = hora.trim() || '08:00';
    const dataHoraIso = `${dataFinal}T${horaFinal}:00`;

    try {
      if (modoModal === 'criar') {
        await api('/lembretes/', {
          method: 'POST',
          body: JSON.stringify({
            titulo: titulo.trim(),
            descricao: descricao.trim() || undefined,
            data_hora: dataHoraIso,
            situacao: true,
          }),
        });
      } else if (lembreteEditandoId) {
        await api(`/lembretes/${lembreteEditandoId}`, {
          method: 'PUT',
          body: JSON.stringify({
            titulo: titulo.trim(),
            descricao: descricao.trim() || undefined,
            data_hora: dataHoraIso,
            situacao: true,
          }),
        });
      }

      await carregarLembretes();
      setModalAberto(false);
    } catch (erro: any) {
      setMensagemErro(erro.message || 'Erro ao salvar lembrete.');
    } finally {
      setSalvando(false);
    }
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

      {carregando ? (
        <View style={estilos.carregandoContainer}>
          <ActivityIndicator size="large" color={cores.primaria} />
        </View>
      ) : lembretes.length === 0 ? (
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
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={estilos.cartaoLembrete}
              onPress={() => abrirModalEditar(item)}
              activeOpacity={0.8}
            >
              <View style={estilos.ladoEsquerdo}>
                <View style={estilos.iconeStatus}>
                  <MaterialIcons name="notifications" size={24} color={cores.primaria} />
                </View>

                <View style={estilos.infoLembrete}>
                  <Text style={estilos.tituloLembrete} numberOfLines={2} ellipsizeMode="tail">
                    {item.titulo}
                  </Text>

                  {item.descricao ? (
                    <Text style={estilos.descricaoLembrete} numberOfLines={2} ellipsizeMode="tail">
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
                </View>
              </View>

              <View style={estilos.ladoDireito}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    excluirLembrete(item.id);
                  }}
                  style={estilos.botaoAcaoRapida}
                  activeOpacity={0.7}
                  accessibilityLabel="Excluir lembrete"
                >
                  <MaterialIcons name="delete-outline" size={22} color={cores.mutedForeground} />
                </TouchableOpacity>
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
                {modoModal === 'criar' ? 'Novo Lembrete' : 'Editar Lembrete'}
              </Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}>
                <MaterialIcons name="close" size={24} color={cores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={estilos.modalScroll}>
              <View style={estilos.modalFormulario}>
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

                <View style={estilos.linhaCamposDuplos}>
                  <View style={estilos.campoModalMetade}>
                    <Text style={estilos.rotuloModal}>Data</Text>
                    <View style={estilos.containerInputIcone}>
                      <TextInput
                        style={estilos.inputComIcone}
                        placeholder="AAAA-MM-DD"
                        placeholderTextColor={cores.mutedForeground}
                        value={data}
                        onChangeText={setData}
                      />
                      <MaterialIcons name="event" size={20} color={cores.textoPrincipal} style={estilos.iconeInput} />
                    </View>
                  </View>

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
                      />
                      <MaterialIcons name="access-time" size={20} color={cores.textoPrincipal} style={estilos.iconeInput} />
                    </View>
                  </View>
                </View>

                {mensagemErro !== '' && (
                  <Text style={estilos.erroTexto}>{mensagemErro}</Text>
                )}

                <Button
                  titulo={modoModal === 'criar' ? 'Adicionar lembrete' : 'Salvar alterações'}
                  variante="primario"
                  carregando={salvando}
                  onPress={salvarLembrete}
                />

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
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
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
  descricaoLembrete: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
    lineHeight: 18,
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
  ladoDireito: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAcaoRapida: {
    padding: 6,
  },
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
  erroTexto: {
    color: cores.destrutivo,
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    textAlign: 'center',
  },
});
