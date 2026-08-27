import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Badge from './components/Badge';
import BottomNavBar from './components/BottomNavBar';
import Button from './components/Button';
import ComboBox from './components/ComboBox';
import DateInput from './components/DateInput';
import Header from './components/Header';
import SwitchCard from './components/SwitchCard';
import { borda, cores, espacamento, tipografia } from './styles/theme';

const FASES_VIDA = [
  '🌸  Adolescência',
  '🌻  Vida adulta',
  '🤰  Gestação',
  '👶  Pós-parto',
  '🍂  Menopausa',
];

export default function Perfil() {
  const router = useRouter();

  // Estado dos dados do perfil
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('Usuária');
  const [email, setEmail] = useState('email@exemplo.com');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [sexo, setSexo] = useState<string | null>(null);
  const [fasesVida, setFasesVida] = useState<string[]>(['🌻  Vida adulta']);

  // Estado das configurações
  const [notificacoes, setNotificacoes] = useState(true);
  const [compartilharDados, setCompartilharDados] = useState(false);

  const formatarData = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const obterTextoSexo = (valor: string | null) => {
    if (valor === 'F' || valor === 'feminino') return 'Feminino';
    if (valor === 'M' || valor === 'masculino') return 'Masculino';
    return 'Não informado';
  };

  const alternarFaseVida = (fase: string) => {
    setFasesVida((anteriores) =>
      anteriores.includes(fase)
        ? anteriores.filter((f) => f !== fase)
        : [...anteriores, fase]
    );
  };

  const inicialNome = (nome && nome.trim().length > 0)
    ? nome.trim().charAt(0).toUpperCase()
    : 'U';

  const handleSair = () => {
    router.replace('/login');
  };

  return (
    <View style={estilos.container}>
      <Header
        nome="Perfil"
        editando={editando}
        aoClicarIcone={() => setEditando(!editando)}
      />

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
              <Text style={estilos.emailUsuario}>{email || 'email@exemplo.com'}</Text>
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

        {/* Informações do perfil: Modo de Visualização ou Edição */}
        {!editando ? (
          <View style={estilos.secaoInfo}>
            {/* E-mail */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>E-mail</Text>
              <Text style={estilos.valorInfo}>{email || 'email@exemplo.com'}</Text>
            </View>

            {/* Telefone */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>Telefone</Text>
              <Text style={estilos.valorInfo}>{telefone || 'Não informado'}</Text>
            </View>

            {/* Data de nascimento */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>Data de nascimento</Text>
              <Text style={estilos.valorInfo}>
                {dataNascimento ? formatarData(dataNascimento) : 'Não informada'}
              </Text>
            </View>

            {/* Sexo */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>Sexo</Text>
              <Text style={estilos.valorInfo}>{obterTextoSexo(sexo)}</Text>
            </View>

            {/* Fases da vida */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>Fases da vida</Text>
              <View style={estilos.badgeWrapper}>
                {fasesVida.length > 0 ? (
                  fasesVida.map((fase) => (
                    <Badge key={fase} rotulo={fase} variante="destaque" />
                  ))
                ) : (
                  <Text style={estilos.valorInfo}>Não informada</Text>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={estilos.secaoEdicao}>
            {/* E-mail */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>E-mail</Text>
              <Text style={estilos.valorInfo}>{email || 'email@exemplo.com'}</Text>
            </View>

            {/* Telefone */}
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

            {/* Data de nascimento */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>Data de nascimento</Text>
              <DateInput
                valor={dataNascimento}
                aoMudar={setDataNascimento}
              />
            </View>

            {/* Sexo */}
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

            {/* Fases da vida */}
            <View style={estilos.cartaoInfo}>
              <Text style={estilos.rotuloInfo}>Fases da vida</Text>
              <View style={estilos.containerFases}>
                {FASES_VIDA.map((fase) => {
                  const selecionado = fasesVida.includes(fase);
                  return (
                    <TouchableOpacity
                      key={fase}
                      style={[
                        estilos.chipFase,
                        selecionado && estilos.chipFaseSelecionado,
                      ]}
                      onPress={() => alternarFaseVida(fase)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          estilos.chipFaseTexto,
                          selecionado && estilos.chipFaseTextoSelecionado,
                        ]}
                      >
                        {fase}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Botão Salvar alterações */}
            <Button
              titulo="Salvar alterações"
              icone="check"
              variante="primario"
              onPress={() => setEditando(false)}
            />
          </View>
        )}

        {/* Seção Configurações (exibida apenas fora do modo de edição) */}
        {!editando && (
          <View style={estilos.secaoConfiguracoes}>
            <Text style={estilos.tituloConfiguracoes}>Configurações</Text>

            <View style={estilos.listaConfiguracoes}>
              <SwitchCard
                icone="notifications-none"
                titulo="Notificações"
                subtitulo="Receber lembretes e alertas"
                valor={notificacoes}
                aoMudarValor={setNotificacoes}
              />

              <SwitchCard
                icone="share"
                titulo="Compartilhar dados"
                subtitulo="Permitir uso anônimo para pesquisa"
                valor={compartilharDados}
                aoMudarValor={setCompartilharDados}
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

      <BottomNavBar />
    </View>
  );
}

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
    paddingTop: espacamento.md,
    paddingBottom: espacamento.xg,
  },

  // Avatar e cabeçalho do perfil
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

  // Modo de visualização dos dados
  secaoInfo: {
    gap: espacamento.pq,
    marginBottom: espacamento.gd,
  },
  // Modo de edição
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

  // Fases da vida chips
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

  // Seção Configurações
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
});

