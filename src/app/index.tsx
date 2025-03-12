import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";

import { Button } from "../components/button";
import { Input } from "@/components/input";

export default function Index() {
    const [name, setName] = useState("");

    function handleNext() {
        router.navigate("/dashboard")
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Olá, {name}</Text>
            <Input onChangeText={setName} placeholder="Digite seu e-mail"/>
            <Button title="Logar" onPress={handleNext}/>
            <Button title="Sair"/>
        </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        gap: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#453467'
    }
});