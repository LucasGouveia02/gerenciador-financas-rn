import { View, Button, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri, revokeAsync as sessionRevokeAsync } from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles } from './styles';
import { useEffect, useState } from 'react';

type RootStackParamList = {
    Home: undefined;
    Auth: undefined;
};

interface UserInfo {
    name: string;
    email: string;
    picture?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Para estado de carregamento inicial
    const [isAuthenticating, setIsAuthenticating] = useState(false); // Para estado de autenticação
    const navigation = useNavigation<NavigationProp>();

    const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;

    const redirectUri = makeRedirectUri({
        scheme: 'br.com.gerenciador.gastos',
    });

    // Para depuração:
    console.log("Native Redirect URI a ser usado:", redirectUri);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: ANDROID_CLIENT_ID,
        redirectUri: redirectUri, // Usar o redirectUri nativo
        scopes: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/spreadsheets'
        ],
        // useProxy: false, // Não é necessário para fluxos nativos ou omitir (padrão é false)
    });

    useEffect(() => {
        if (request) {
            console.log("Auth Request Object (Nativo):", JSON.stringify(request, null, 2));
        }
    }, [request]);

    useEffect(() => {
        const loadStoredAuth = async () => {
            setIsLoading(true);
            try {
                const storedToken = await AsyncStorage.getItem('googleAccessToken');
                const storedUserInfo = await AsyncStorage.getItem('userInfo');
                if (storedToken) {
                    setAccessToken(storedToken);
                    if (storedUserInfo) {
                        const parsedUserInfo = JSON.parse(storedUserInfo) as UserInfo;
                        setUserInfo(parsedUserInfo);
                        // Se temos token e info, consideramos o usuário logado e navegamos
                        console.log("Usuário já logado, navegando para Home (loadStoredAuth).");
                        navigation.replace('Home');
                    } else {
                        // Tem token mas não userInfo, tenta buscar.
                        // Isso pode acontecer se o app fechou antes de fetchUserInfo completar.
                        await fetchUserInfo(storedToken);
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar dados de autenticação do AsyncStorage:", e);
                // Limpar em caso de erro de parse ou similar
                await AsyncStorage.multiRemove(['googleAccessToken', 'userInfo', 'googleRefreshToken']);
            } finally {
                setIsLoading(false);
            }
        };
        loadStoredAuth();
    }, []); // Executa apenas uma vez ao montar o componente

    useEffect(() => {
        if (response) {
            setIsAuthenticating(false); // Terminou a tentativa de autenticação
            if (response.type === 'success' && response.authentication) {
                const { accessToken: newAccessToken, refreshToken } = response.authentication;
                console.log("Autenticação bem-sucedida, obtendo accessToken.");
                setAccessToken(newAccessToken);
                AsyncStorage.setItem('googleAccessToken', newAccessToken);
                if (refreshToken) {
                    AsyncStorage.setItem('googleRefreshToken', refreshToken);
                    console.log("Refresh Token salvo:", refreshToken);
                }
                fetchUserInfo(newAccessToken);
            } else if (response.type === 'error') {
                console.error("Erro de autenticação do Google (response.type === 'error'):", response.error);
                // Poderia mostrar uma mensagem mais amigável para o usuário
            } else if (response.type === 'dismiss') {
                console.log("Usuário dispensou o login do Google.");
            }
        }
    }, [response]);

    const fetchUserInfo = async (token: string) => {
        console.log("Buscando informações do usuário com token:", token ? "SIM" : "NÃO");
        if (!token) return; // Não prosseguir se não houver token

        setIsLoading(true); // Pode usar um loading específico para fetchUserInfo se preferir
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erro na API ao buscar informações do usuário. Status:", res.status, "Data:", errorData);
                await handleSignOut(false); // Força o logout se o token for inválido, sem tentar revogar
                return;
            }
            const user = await res.json() as UserInfo;
            setUserInfo(user);
            AsyncStorage.setItem('userInfo', JSON.stringify(user));
            console.log('User Info obtido:', user.name, user.email);
            console.log("Navegando para Home (fetchUserInfo).");
            navigation.replace('Home');
        } catch (error) {
            console.error("Erro de rede/catch ao buscar informações do usuário:", error);
            // Lidar com erros de rede, etc.
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = () => {
        if (request) {
            setIsAuthenticating(true); // Inicia a tentativa de autenticação
            promptAsync();
        } else {
            console.error("Requisição de autenticação (request) não está pronta.");
            // Mostrar mensagem para o usuário
        }
    };

    const handleSignOut = async (attemptRevoke = true) => {
        console.log("Iniciando processo de logout.");
        if (attemptRevoke && accessToken) {
            try {
                if (!ANDROID_CLIENT_ID) {
                    console.warn("Client ID para revogação não encontrado para a plataforma atual.");
                } else {
                    await sessionRevokeAsync(
                        { token: accessToken, clientId: ANDROID_CLIENT_ID },
                        { revocationEndpoint: 'https://oauth2.googleapis.com/revoke' }
                    );
                    console.log("Token revogado com sucesso no Google.");
                }
            } catch (e: any) {
                console.error("Erro ao revogar token do Google:", e.message);
            }
        }
        await AsyncStorage.removeItem('googleAccessToken');
        await AsyncStorage.removeItem('googleRefreshToken');
        await AsyncStorage.removeItem('userInfo');
        setAccessToken(null);
        setUserInfo(null);
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.text}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* O estado de `userInfo` agora é gerenciado pelo `loadStoredAuth` e `fetchUserInfo` para navegação */}
            {/* A tela de Auth só será mostrada se o usuário não estiver logado e não estiver carregando */}
            <Button
                disabled={!request || isAuthenticating} // Desabilita o botão se a requisição não estiver pronta ou autenticando
                title={isAuthenticating ? "Autenticando..." : "Login com Google"}
                onPress={handleSignIn}
            />
            {!request && !isAuthenticating && <Text style={styles.textWarning}>Configurando login...</Text>}
        </View>
    );
}
