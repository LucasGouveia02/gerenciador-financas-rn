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
    errorText: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
        marginHorizontal: 20,
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
});
