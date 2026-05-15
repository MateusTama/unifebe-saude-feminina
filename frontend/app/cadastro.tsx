import { useState } from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import HeroSection from "./components/HeroSection";
import tema from "./styles/theme";
import Input from "./components/Input";
import ComboBox from "./components/ComboBox";
import DateInput from "./components/DateInput";
import SwitchCard from "./components/SwitchCard";
import Button from "./components/Button";

export default function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [sexo, setSexo] = useState<string | null>('feminino');
    const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
    const [notificacoes, setNotificacoes] = useState(false);
    const [compartilharDados, setCompartilharDados] = useState(false);
    const [erros, setErros] = useState<{ [key: string]: string }>({});

    const validarFormulario = () => {
        const novosErros: { [key: string]: string } = {};

        // 1. Verificação se está preenchido
        if (!nome) novosErros.nome = "Obrigatório";
        if (!email) novosErros.email = "Obrigatório";
        if (!telefone) novosErros.telefone = "Obrigatório";
        if (!sexo) novosErros.sexo = "Obrigatório";
        if (!dataNascimento) novosErros.dataNascimento = "Obrigatório";
        if (!senha) novosErros.senha = "Obrigatório";
        if (!confirmarSenha) novosErros.confirmarSenha = "Obrigatório";

        // 2. Validações adicionais (apenas se o campo estiver preenchido)
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            novosErros.email = "Inválido";
        }

        if (dataNascimento && dataNascimento > new Date()) {
            novosErros.dataNascimento = "Inválida";
        }

        if (senha && confirmarSenha && senha !== confirmarSenha) {
            novosErros.confirmarSenha = "Não coincidem";
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleContinuar = () => {
        if (validarFormulario()) {
            console.log("Formulário válido, pode avançar!");
        }
    };

    return (
        <View style={estilos.container}>
            <ScrollView style={estilos.conteudo} contentContainerStyle={estilos.formulario}>

                <HeroSection
                    titulo="VidaFem"
                    subtitulo="Crie sua conta para começar"
                />

                <Input
                    rotulo="Nome"
                    valor={nome}
                    aoMudar={setNome}
                    placeholder="Seu nome"
                    erro={erros.nome}
                />

                <Input
                    rotulo="E-mail"
                    valor={email}
                    aoMudar={setEmail}
                    placeholder="seu@email.com"
                    erro={erros.email}
                />

                <Input
                    rotulo="Telefone"
                    valor={telefone}
                    aoMudar={setTelefone}
                    placeholder="(00) 00000-0000"
                    erro={erros.telefone}
                />

                <DateInput
                    rotulo="Data de nascimento"
                    valor={dataNascimento}
                    aoMudar={setDataNascimento}
                    erro={erros.dataNascimento}
                />

                <ComboBox
                    rotulo="Sexo"
                    valor={sexo}
                    aoMudar={setSexo}
                    placeholder="Selecione seu sexo"
                    itens={[
                        { rotulo: 'Feminino', valor: 'F' },
                        { rotulo: 'Masculino', valor: 'M' },
                    ]}
                    erro={erros.sexo}
                />

                <Input
                    rotulo="Senha"
                    valor={senha}
                    aoMudar={setSenha}
                    placeholder="••••••••"
                    seguro={true}
                    erro={erros.senha}
                />

                <Input
                    rotulo="Confirmar senha"
                    valor={confirmarSenha}
                    aoMudar={setConfirmarSenha}
                    placeholder="••••••••"
                    seguro={true}
                    erro={erros.confirmarSenha}
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
                    titulo="Continuar"
                    onPress={handleContinuar}
                />

                <View style={estilos.rodape}>
                    <Text style={estilos.textoRodape}>Já tem uma conta? </Text>
                    <Link href="/" asChild>
                        <TouchableOpacity>
                            <Text style={estilos.linkRodape}>Entrar</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

            </ScrollView>
        </View>
    );
}

const estilos = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: tema.cores.fundo,
    },
    conteudo: {
        flex: 1,
    },
    formulario: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
    },
    rodape: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    textoRodape: {
        color: tema.cores.mutedForeground,
        fontFamily: tema.tipografia.inter.regular,
        fontSize: tema.tipografia.tamanhoMd,
    },
    linkRodape: {
        color: tema.cores.primaria,
        fontFamily: tema.tipografia.inter.semibold,
        fontSize: tema.tipografia.tamanhoMd,
    },
});
