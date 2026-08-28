import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Badge from './components/Badge';
import BottomNavBar from './components/BottomNavBar';
import Button from './components/Button';
import ComboBox from './components/ComboBox';
import DateInput from './components/DateInput';
import Header from './components/Header';
import SwitchCard from './components/SwitchCard';
import { borda, cores, espacamento, tipografia } from './styles/theme';
import { api } from './services/api';

interface ItemFaseVida {
  id: number;
  nome: string;
  descricao?: string;
}

export default function Perfil() {
  const router = useRouter();

  const [editando, setEditando] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [sexo, setSexo] = useState<string | null>('F');
  
  const [todasFasesVida, setTodasFasesVida] = useState<ItemFaseVida[]>([]);
  const [fasesVidaIds, setFasesVidaIds] = useState<number[]>([]);
  const [fasesVidaDetalhadas, setFasesVidaDetalhadas] = useState<ItemFaseVida[]>([]);

  const [notificacoes, setNotificacoes] = useState(true);
  const [compartilharDados, setCompartilharDados] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    setCarregandoPerfil(true);
    try {
      const [dadosPerfil, dadosFases] = await Promise.all([
        api('/usuarios/perfil').catch(() => null),
        api('/fases-vida/').catch(() => null),
      ]);

      if (dadosFases?.fases_vida) {
        setTodasFasesVida(dadosFases.fases_vida);
      }

      if (dadosPerfil) {
        setNome(dadosPerfil.nome || '');
        setEmail(dadosPerfil.email || '');
        setTelefone(dadosPerfil.telefone || '');
        setSexo(dadosPerfil.sexo || 'F');
        setNotificacoes(dadosPerfil.permite_notificacao ?? true);
        setCompartilharDados(dadosPerfil.permite_compartilhar_dados ?? false);

        if (dadosPerfil.data_nascimento) {
          const partes = dadosPerfil.data_nascimento.split('-');
          if (partes.length === 3) {
            setDataNascimento(new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2])));
          }
        }

        if (dadosPerfil.fases_vida && Array.isArray(dadosPerfil.fases_vida)) {
          setFasesVidaDetalhadas(dadosPerfil.fases_vida);
          setFasesVidaIds(dadosPerfil.fases_vida.map((f: any) => f.id));
        }
      }
    } catch (erro: any) {
      console.error('Erro ao carregar perfil:', erro);
    } finally {
      setCarregandoPerfil(false);
    }
  };

  const formatarData = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDataISO = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const obterTextoSexo = (valor: string | null) => {
    if (valor === 'F' || valor === 'feminino') return 'Feminino';
    if (valor === 'M' || valor === 'masculino') return 'Masculino';
    return 'Não informado';
  };

  const alternarFaseVidaId = (id: number) => {
    setFasesVidaIds((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((fId) => fId !== id)
        : [...anteriores, id]
    );
  };

  const inicialNome = (nome && nome.trim().length > 0)
    ? nome.trim().charAt(0).toUpperCase()
    : 'U';

  const handleSair = async () => {
    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@usuario');
    router.replace('/login');
  };

  const handleAlternarNotificacoes = async (novoValor: boolean) => {
    setNotificacoes(novoValor);
    try {
      await api('/usuarios/editar', {
        method: 'PUT',
        body: JSON.stringify({ permite_notificacao: novoValor }),
      });
    } catch (erro) {
      setNotificacoes(!novoValor);
    }
  };

  const handleAlternarCompartilharDados = async (novoValor: boolean) => {
    setCompartilharDados(novoValor);
    try {
      await api('/usuarios/editar', {
        method: 'PUT',
        body: JSON.stringify({ permite_compartilhar_dados: novoValor }),
      });
    } catch (erro) {
      setCompartilharDados(!novoValor);
    }
  };

  const handleSalvar = async () => {
    setMensagemErro('');
    setSalvando(true);

    try {
      const dataIso = dataNascimento ? formatarDataISO(dataNascimento) : undefined;

      await api('/usuarios/editar', {
        method: 'PUT',
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          sexo: sexo || 'F',
          data_nascimento: dataIso,
          permite_notificacao: notificacoes,
          permite_compartilhar_dados: compartilharDados,
          fases_vida_ids: fasesVidaIds,
        }),
      });

      // Atualiza o cache local do usuário no AsyncStorage
      const usuarioSalvo = await AsyncStorage.getItem('@usuario');
      if (usuarioSalvo) {
        const parsed = JSON.parse(usuarioSalvo);
        parsed.nome = nome.trim();
        await AsyncStorage.setItem('@usuario', JSON.stringify(parsed));
      }

      await carregarPerfil();
      setEditando(false);
    } catch (erro: any) {
      setMensagemErro(erro.message || 'Erro ao atualizar perfil.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={estilos.container}>
      <Header
        nome="Perfil"
        editando={editando}
        aoClicarIcone={() => setEditando(!editando)}
      />

      {carregandoPerfil ? (
        <View style={estilos.carregandoContainer}>
          <ActivityIndicator size="large" color={cores.primaria} />
        </View>
      ) : (
        <ScrollView
          style={estilos.scroll}
          contentContainerStyle={estilos.conteudo}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho do perfil: Avatar, Nome e E-mail */}
          <View style={estilos.secaoAvatar}>
            <View style={estilos.avatar}>
              <Text style={estilos.avatarTexto}>{inicialNome}</Text>
            </View>
            {!editando ? (
              <>
                <Text style={estilos.nomeUsuario}>{nome || 'Usuária'}</Text>
                <Text style={estilos.emailUsuario}>{email || ''}</Text>
              </>
            ) : (
              <View style={estilos.containerNomeInput}>
                <TextInput
                  style={estilos.inputNome}
                  placeholder="Seu nome"
                  placeholderTextColor={cores.mutedForeground}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>
            )}
          </View>

          {/* Informações do perfil */}
          {!editando ? (
            <View style={estilos.secaoInfo}>
              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>E-mail</Text>
                <Text style={estilos.valorInfo}>{email || ''}</Text>
              </View>

              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>Telefone</Text>
                <Text style={estilos.valorInfo}>{telefone || 'Não informado'}</Text>
              </View>

              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>Data de nascimento</Text>
                <Text style={estilos.valorInfo}>
                  {dataNascimento ? formatarData(dataNascimento) : 'Não informada'}
                </Text>
              </View>

              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>Sexo</Text>
                <Text style={estilos.valorInfo}>{obterTextoSexo(sexo)}</Text>
              </View>

              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>Fases da vida</Text>
                <View style={estilos.badgeWrapper}>
                  {fasesVidaDetalhadas.length > 0 ? (
                    fasesVidaDetalhadas.map((fase) => (
                      <Badge key={fase.id} rotulo={fase.nome} variante="destaque" />
                    ))
                  ) : (
                    <Text style={estilos.valorInfo}>Não informada</Text>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={estilos.secaoEdicao}>
              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>E-mail</Text>
                <Text style={estilos.valorInfo}>{email || ''}</Text>
              </View>

              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>Telefone</Text>
                <TextInput
                  style={estilos.inputInterno}
                  value={telefone}
                  onChangeText={setTelefone}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={cores.mutedForeground}
                />
              </View>

              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>Data de nascimento</Text>
                <DateInput
                  valor={dataNascimento}
                  aoMudar={setDataNascimento}
                />
              </View>

              <View style={[estilos.cartaoInfo, { zIndex: 20 }]}>
                <Text style={estilos.rotuloInfo}>Sexo</Text>
                <ComboBox
                  valor={sexo}
                  aoMudar={setSexo}
                  placeholder="Selecione"
                  itens={[
                    { rotulo: 'Feminino', valor: 'F' },
                    { rotulo: 'Masculino', valor: 'M' },
                  ]}
                  zIndex={20}
                />
              </View>

              <View style={estilos.cartaoInfo}>
                <Text style={estilos.rotuloInfo}>Fases da vida</Text>
                <View style={estilos.containerFases}>
                  {todasFasesVida.map((fase) => {
                    const selecionado = fasesVidaIds.includes(fase.id);
                    return (
                      <TouchableOpacity
                        key={fase.id}
                        style={[
                          estilos.chipFase,
                          selecionado && estilos.chipFaseSelecionado,
                        ]}
                        onPress={() => alternarFaseVidaId(fase.id)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            estilos.chipFaseTexto,
                            selecionado && estilos.chipFaseTextoSelecionado,
                          ]}
                        >
                          {fase.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {mensagemErro !== '' && (
                <Text style={estilos.erroTexto}>{mensagemErro}</Text>
              )}

              <Button
                titulo={salvando ? "Salvando..." : "Salvar alterações"}
                icone="check"
                variante="primario"
                carregando={salvando}
                onPress={handleSalvar}
              />
            </View>
          )}

          {!editando && (
            <View style={estilos.secaoConfiguracoes}>
              <Text style={estilos.tituloConfiguracoes}>Configurações</Text>

              <View style={estilos.listaConfiguracoes}>
                <SwitchCard
                  icone="notifications-none"
                  titulo="Notificações"
                  subtitulo="Receber lembretes e alertas"
                  valor={notificacoes}
                  aoMudarValor={handleAlternarNotificacoes}
                />

                <SwitchCard
                  icone="share"
                  titulo="Compartilhar dados"
                  subtitulo="Permitir uso anônimo para pesquisa"
                  valor={compartilharDados}
                  aoMudarValor={handleAlternarCompartilharDados}
                />

                <Button
                  titulo="Lembretes"
                  variante="lista"
                  icone="notifications-none"
                  onPress={() => router.push('/lembretes' as never)}
                />

                <Button
                  titulo="Sair da conta"
                  variante="destrutivo"
                  icone="logout"
                  onPress={handleSair}
                />
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <BottomNavBar />
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
  scroll: {
    flex: 1,
  },
  conteudo: {
    paddingHorizontal: espacamento.md,
    paddingTop: espacamento.md,
    paddingBottom: espacamento.xg,
  },
  secaoAvatar: {
    alignItems: 'center',
    marginBottom: espacamento.gd,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: cores.destaque,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamento.pq,
  },
  avatarTexto: {
    fontSize: tipografia.tamanho2xg,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoDestaque,
  },
  nomeUsuario: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.negrito,
    color: cores.textoPrincipal,
    marginBottom: 2,
  },
  emailUsuario: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },
  containerNomeInput: {
    width: '100%',
    paddingHorizontal: espacamento.xg,
    marginTop: 4,
  },
  inputNome: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: borda.md,
    backgroundColor: cores.branco,
    paddingHorizontal: espacamento.md,
    paddingVertical: 10,
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.regular,
    color: cores.textoPrincipal,
    textAlign: 'center',
    minHeight: 44,
  },
  secaoInfo: {
    gap: espacamento.pq,
    marginBottom: espacamento.gd,
  },
  secaoEdicao: {
    gap: espacamento.md,
  },
  cartaoInfo: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: borda.md,
    padding: espacamento.md,
    gap: 8,
  },
  rotuloInfo: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    color: cores.mutedForeground,
  },
  valorInfo: {
    fontSize: tipografia.tamanhoMd,
    fontFamily: tipografia.inter.semibold,
    color: cores.textoPrincipal,
  },
  inputInterno: {
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
  badgeWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
    marginTop: 2,
  },
  containerFases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamento.pq,
    marginTop: 4,
  },
  chipFase: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borda.cheia,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipFaseSelecionado: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  chipFaseTexto: {
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.medio,
    color: cores.textoPrincipal,
  },
  chipFaseTextoSelecionado: {
    color: cores.branco,
  },
  secaoConfiguracoes: {
    marginTop: 0,
    marginBottom: 0,
  },
  tituloConfiguracoes: {
    fontSize: tipografia.tamanhoGd,
    fontFamily: tipografia.outfit.semibold,
    color: cores.textoPrincipal,
    marginBottom: espacamento.md,
  },
  listaConfiguracoes: {
    gap: espacamento.pq,
  },
  erroTexto: {
    color: cores.destrutivo,
    fontSize: tipografia.tamanhoPq,
    fontFamily: tipografia.inter.regular,
    textAlign: 'center',
  },
});
