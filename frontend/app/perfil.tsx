import { useState } from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native";
import tema from "./styles/theme";
import Input from "./components/Input";
import Button from "./components/Button";
import BottomNavBar from "./components/BottomNavBar";
import Header from "./components/Header";
import SwitchCard from "./components/SwitchCard";
import { useRouter } from "expo-router";

export default function Perfil() {

    const [editando, setEditando] = useState(false);
    const [notificacoes, setNotificacoes] = useState(false);
    const [compartilharDados, setCompartilharDados] = useState(false);

    const router = useRouter();

    return (
        <View style={estilos.container}>
            <Header
                nome="Perfil"
                editando={editando}
                ocultarIcone={false}
                aoClicarIcone={() => { setEditando(!editando) }}
            />
            <ScrollView style={estilos.conteudo}>
                {!editando ? (
                    <View style={estilos.perfilInfo}>
                        <View style={estilos.avatarContainer}>
                            <Text style={estilos.avatarEmoji}>🌸</Text>
                        </View>
                        <Text style={estilos.nomeUsuario}>Usuária</Text>
                        <Text style={estilos.emailUsuario}>email@exemplo.com</Text>
                    </View>
                ) : (
                    <View style={estilos.formulario}>
                        <Input
                            rotulo="Nome"
                            valor="Usuária"
                            aoMudar={() => { }}
                            placeholder="Digite seu nome"
                        />
                        <Input
                            rotulo="Email"
                            valor="email@exemplo.com"
                            aoMudar={() => { }}
                            placeholder="Digite seu email"
                        />
                        <Input
                            rotulo="Senha"
                            valor="********"
                            aoMudar={() => { }}
                            placeholder="Digite sua senha"
                            seguro={true}
                        />
                    </View>
                )}
                <View style={estilos.secaoConfiguracoes}>
                    <Text style={estilos.tituloSecao}>Configurações</Text>

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
                        onPress={() => { }}
                    />

                    <Button
                        titulo="Sair da conta"
                        variante="destrutivo"
                        icone="logout"
                        onPress={() => { router.replace('/login') }}
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
        backgroundColor: tema.cores.fundo,
    },
    conteudo: {
        flex: 1,
    },
    formulario: {
        padding: tema.espacamento.md,
        gap: tema.espacamento.md,
    },
    secaoConfiguracoes: {
        padding: tema.espacamento.md,
        gap: tema.espacamento.md,
        paddingBottom: tema.espacamento.xxg,
    },
    perfilInfo: {
        alignItems: 'center',
        paddingVertical: tema.espacamento.xg,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: tema.cores.destaque,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: tema.espacamento.md,
    },
    avatarEmoji: {
        fontSize: 50,
    },
    nomeUsuario: {
        fontSize: tema.tipografia.tamanhoXg,
        fontFamily: tema.tipografia.outfit.negrito,
        color: tema.cores.textoPrincipal,
        marginBottom: 4,
    },
    emailUsuario: {
        fontSize: tema.tipografia.tamanhoMd,
        fontFamily: tema.tipografia.inter.regular,
        color: tema.cores.mutedForeground,
    },
    tituloSecao: {
        fontSize: tema.tipografia.tamanhoGd,
        fontFamily: tema.tipografia.outfit.semibold,
        color: tema.cores.textoPrincipal,
        marginBottom: tema.espacamento.pq - tema.espacamento.md, // para compensar o gap se necessário, ou só deixar 0
    },
});


