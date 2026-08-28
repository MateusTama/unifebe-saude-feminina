import { useState } from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeroSection from "./components/HeroSection";
import tema from "./styles/theme";
import Input from "./components/Input";
import ComboBox from "./components/ComboBox";
import DateInput from "./components/DateInput";
import SwitchCard from "./components/SwitchCard";
import Button from "./components/Button";
import { api } from "./services/api";

export default function Cadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [sexo, setSexo] = useState<string | null>('F');
    const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
    const [notificacoes, setNotificacoes] = useState(true);
    const [compartilharDados, setCompartilharDados] = useState(false);
    const [erros, setErros] = useState<{ [key: string]: string }>({});
    const [mensagemErro, setMensagemErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const router = useRouter();

    const formatarTelefone = (texto: string) => {
        const digitos = texto.replace(/\D/g, '').slice(0, 11);
        if (digitos.length <= 2) return digitos;
        if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
        if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    };

    const validarFormulario = () => {
        const novosErros: { [key: string]: string } = {};

        if (!nome) novosErros.nome = "Obrigatório";
        if (!email) novosErros.email = "Obrigatório";
        if (!telefone) novosErros.telefone = "Obrigatório";
        if (!sexo) novosErros.sexo = "Obrigatório";
        if (!dataNascimento) novosErros.dataNascimento = "Obrigatório";
        if (!senha) novosErros.senha = "Obrigatório";
        if (!confirmarSenha) novosErros.confirmarSenha = "Obrigatório";

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            novosErros.email = "Inválido";
        }

        if (telefone) {
            const digitos = telefone.replace(/\D/g, '');
            if (digitos.length < 10 || digitos.length > 11) {
                novosErros.telefone = "Inválido (10 ou 11 dígitos)";
            }
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

    const formatarDataISO = (d: Date): string => {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    };

    const handleContinuar = async () => {
        setMensagemErro('');

        if (!validarFormulario()) return;

        setCarregando(true);

        try {
            const dataFormatada = dataNascimento ? formatarDataISO(dataNascimento) : undefined;
            const emailLimpo = email.trim().toLowerCase();

            await api('/usuarios/cadastro', {
                method: 'POST',
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: emailLimpo,
                    senha,
                    telefone: telefone.trim(),
                    sexo: sexo || 'F',
                    data_nascimento: dataFormatada,
                    permite_notificacao: notificacoes,
                    permite_compartilhar_dados: compartilharDados,
                }),
            });

            const loginDados = await api('/usuarios/login', {
                method: 'POST',
                body: JSON.stringify({ email: emailLimpo, senha }),
            });

            await AsyncStorage.setItem('@token', loginDados.token);
            await AsyncStorage.setItem('@usuario', JSON.stringify(loginDados.usuario));

            router.replace('/home');
        } catch (erro: any) {
            setMensagemErro(erro.message || 'Não foi possível realizar o cadastro.');
        } finally {
            setCarregando(false);
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
                    aoMudar={(t) => setTelefone(formatarTelefone(t))}
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

                {mensagemErro !== '' && (
                    <Text style={estilos.erro}>{mensagemErro}</Text>
                )}

                <Button
                    titulo={carregando ? "Cadastrando..." : "Continuar"}
                    carregando={carregando}
                    onPress={handleContinuar}
                />

                <View style={estilos.rodape}>
                    <Text style={estilos.textoRodape}>Já tem uma conta? </Text>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={estilos.linkRodape}>Entrar</Text>
                    </TouchableOpacity>
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
        paddingHorizontal: tema.espacamento.md,
        paddingTop: tema.espacamento.md,
        paddingBottom: tema.espacamento.xg,
        gap: tema.espacamento.md,
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
    erro: {
        color: tema.cores.destrutivo,
        fontSize: tema.tipografia.tamanhoPq,
        fontFamily: tema.tipografia.inter.regular,
        textAlign: 'center',
    },
    linkRodape: {
        color: tema.cores.primaria,
        fontFamily: tema.tipografia.inter.semibold,
        fontSize: tema.tipografia.tamanhoMd,
    },
});
