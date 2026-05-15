import { useState } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import BottomNavBar from "./components/BottomNavBar";
import Header from "./components/Header";
import Input from "./components/Input";
import ComboBox from "./components/ComboBox";
import DateInput from "./components/DateInput";
import SwitchCard from "./components/SwitchCard";
import tema from "./styles/theme";
import Button from "./components/Button";

export default function Index() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [sexo, setSexo] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [notificacoes, setNotificacoes] = useState(false);
  const [compartilharDados, setCompartilharDados] = useState(false);

  return (
    <View style={estilos.container}>
      <Header
        nome="Cadastro"
        editando={false}
        aoClicarIcone={() => { }}
      />

      <ScrollView style={estilos.conteudo}>
        <View style={estilos.formulario}>
          <Input
            rotulo="Nome Completo"
            valor={nome}
            aoMudar={setNome}
            placeholder="Digite seu nome"
          />

          <Input
            rotulo="Email"
            valor={email}
            aoMudar={setEmail}
            placeholder="seu@email.com"
          />

          <Input
            rotulo="Senha"
            valor={senha}
            aoMudar={setSenha}
            placeholder="Digite sua senha"
            seguro={true}
          />

          <ComboBox
            rotulo="Sexo"
            valor={sexo}
            aoMudar={setSexo}
            placeholder="Selecione seu sexo"
            itens={[
              { rotulo: 'Feminino', valor: 'feminino' },
              { rotulo: 'Masculino', valor: 'masculino' },
              { rotulo: 'Outro', valor: 'outro' },
            ]}
          />

          <DateInput
            rotulo="Data de Nascimento"
            valor={dataNascimento}
            aoMudar={setDataNascimento}
          />

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
            titulo="Cadastrar"
            onPress={() => { }}
          />

          <Button
            titulo="Salvar alterações"
            icone="check"
            onPress={() => { }}
          />

          <Button
            titulo="Lembretes"
            variante="lista"
            icone="notifications-none"
            onPress={() => { }}
          />

          <Button
            titulo="Sair da conta"
            variante="destrutivo"
            icone="logout"
            onPress={() => { }}
          />

          <Button
            titulo="Registrar menstruação"
            variante="tracejado"
            icone="water-drop"
            onPress={() => { }}
          />
        </View>
      </ScrollView>

      <BottomNavBar />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudo: {
    flex: 1,
  },
  formulario: {
    padding: 16,
    gap: 16,
  },
});
