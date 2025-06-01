import 'dotenv/config';

export default ({ config }) => {
    return {
        ...config,
        name: "GerenciadorGastos",
        slug: "gerenciador-gastos-app",
        version: "1.0.0",
        extra: {
            eas: {
                "projectId": "acb265d2-d6b9-4f81-ad0d-ef04b6610820"
            },
            ACCESS_IP_API: process.env.EXPO_PUBLIC_ACCESS_IP_API,
            ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
        },
        android: {
            package: "br.com.gerenciador.gastos",
            versionCode: 1
        }
    };
};
