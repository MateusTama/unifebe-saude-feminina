import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import BottomNavBar from "./components/BottomNavBar";
import Header from "./components/Header";
import Input from "./components/Input";
import ComboBox from "./components/ComboBox";
import DateInput from "./components/DateInput";

export default function Index() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [sexo, setSexo] = useState<string | null>(null);
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);

  return (
    <View style={estilos.container}>
      <Header
        nome="Cadastro"
        editando={false}
        aoClicarIcone={() => {}}
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
