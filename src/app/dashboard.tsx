import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

import { Button } from "@/components/button";

export default function Dashboard() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            <Button title="Voltar" onPress={router.back}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#453467'
    }
});