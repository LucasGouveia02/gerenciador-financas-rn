import 'dotenv/config';

export default ({ config }) => {
    return {
        ...config,
        name: "GerenciadorFinancas",
        slug: "gerenciador-financas-app",
        version: "1.0.0",
        extra: {
            eas: {
                projectId: "4cd3f1d6-d4a5-432f-a054-f2b088048e26"
            },
            ACCESS_IP_API: process.env.EXPO_PUBLIC_ACCESS_IP_API
        },
        android: {
            package: "br.com.senac.foodconnect",
            versionCode: 1
        }
    };
};
