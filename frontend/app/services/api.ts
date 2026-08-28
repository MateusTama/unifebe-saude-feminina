import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://unifebe-saude-feminina-api.onrender.com';

export async function api(endpoint: string, options: RequestInit = {}) {
    const token = await AsyncStorage.getItem('@token');
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const resposta = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        const erro: any = new Error(dados.mensagem || 'Erro na requisição');
        erro.status = resposta.status;
        erro.dados = dados;
        throw erro;
    }

    return dados;
}
