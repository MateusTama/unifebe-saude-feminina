import { useState } from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeroSection from "./components/HeroSection";
import tema from "./styles/theme";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "./services/api";

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erros, setErros] = useState<{ [key: string]: string }>({});
    const [loginInvalido, setLoginInvalido] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const router = useRouter();

    const validarFormulario = () => {
        const novosErros: { [key: string]: string } = {};

        if (!email) novosErros.email = "Obrigatório";
        if (!senha) novosErros.senha = "Obrigatório";

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            novosErros.email = "Inválido";
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleEntrar = async () => {
        setLoginInvalido(false);
        setMensagemErro('');

        if (!validarFormulario()) return;

        setCarregando(true);

        try {
            const dados = await api('/usuarios/login', {
                method: 'POST',
                body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
            });

            await AsyncStorage.setItem('@token', dados.token);
            await AsyncStorage.setItem('@usuario', JSON.stringify(dados.usuario));

            router.replace('/home');
        } catch (erro: any) {
            if (erro.status === 401) {
                setLoginInvalido(true);
            } else {
                setMensagemErro(erro.message || 'Não foi possível conectar ao servidor.');
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <View style={estilos.container}>
            <ScrollView style={estilos.conteudo} contentContainerStyle={estilos.formulario}>

                <HeroSection
                    titulo="VidaFem"
                    subtitulo="Entre na sua conta"
                />

                <Input
                    rotulo="E-mail"
                    valor={email}
                    aoMudar={setEmail}
                    placeholder="seu@email.com"
                    erro={erros.email}
                />

                <Input
                    rotulo="Senha"
                    valor={senha}
                    aoMudar={setSenha}
                    placeholder="••••••••"
                    seguro={true}
                    erro={erros.senha}
                />

                {loginInvalido && (
                    <Text style={estilos.erro}>Email ou senha incorretos</Text>
                )}

                {mensagemErro !== '' && (
                    <Text style={estilos.erro}>{mensagemErro}</Text>
                )}

                <Button
                    titulo={carregando ? "Entrando..." : "Entrar"}
                    carregando={carregando}
                    onPress={handleEntrar}
                />

                <View style={estilos.rodape}>
                    <Text style={estilos.textoRodape}>Não tem uma conta? </Text>
                    <TouchableOpacity onPress={() => router.push('/cadastro')}>
                        <Text style={estilos.linkRodape}>Cadastre-se</Text>
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
        marginTop: tema.espacamento.pq,
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
