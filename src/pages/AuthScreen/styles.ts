import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    textWarning: {
        fontSize: 14,
        marginTop: 10,
        color: 'orange',
    },
    buttonContainer: { // Este estilo não está sendo usado no return atual, mas mantido caso precise
        marginTop: 15,
        width: '80%',
    }
});
