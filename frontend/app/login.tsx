import { useState } from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import HeroSection from "./components/HeroSection";
import tema from "./styles/theme";
import Input from "./components/Input";
import Button from "./components/Button";

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erros, setErros] = useState<{ [key: string]: string }>({});
    const [loginInvalido, setLoginInvalido] = useState(false);

    const router = useRouter();

    const validarFormulario = () => {
        const novosErros: { [key: string]: string } = {};

        // 1. Verificação se está preenchido
        if (!email) novosErros.email = "Obrigatório";
        if (!senha) novosErros.senha = "Obrigatório";

        // 2. Validações adicionais (apenas se o campo estiver preenchido)
        if (email && email !== 'admin' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            novosErros.email = "Inválido";
        }

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleEntrar = () => {
        if (validarFormulario()) {
            if (email === 'admin' && senha === 'admin') {
                router.replace('/home');
            } else {
                setLoginInvalido(true);
            }
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

                <Button
                    titulo="Entrar"
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
        padding: tema.espacamento.md,
        gap: tema.espacamento.md,
        paddingBottom: tema.espacamento.xxg, // 48, substituindo o antigo 40 para ficar no padrão
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
