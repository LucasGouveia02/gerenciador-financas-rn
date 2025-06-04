import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    categoryContainer: {
        marginVertical: 15,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
        marginLeft: 10,
        paddingLeft: "5%",
    },
    itemSeparator: {
        width: 10,
        backgroundColor: "transparent",
    },
    pickerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        marginVertical: 5,
        marginTop: 20,
    },
    pickerStyle: {
        height: 50,
        width: '48%',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        // Adicione outros estilos se necessário
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 16,
        flex: 1, // Para o texto poder quebrar linha e empurrar o valor para a direita
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    sectionHeader: {
        fontWeight: 'bold',
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 5,
        backgroundColor: '#e0e0e0',
        marginTop: 10,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 10,
        color: 'red',
        fontSize: 16,
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    listContentContainer: {
        paddingHorizontal: 15, // Ajustado de 20 para 15
        paddingTop: 10,      // Ajustado de 20 para 10
        paddingBottom: 50,
    }
});
