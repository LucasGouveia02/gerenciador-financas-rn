import { View, Text, ScrollView, SectionList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniDashboard } from "../../components/MiniDashboard";
import { getTasks } from "../../api/task/task";
import { HomeActions } from "../../components/HomeActions";
import { AddExpenseModal } from "../../components/AddExpenseModal";
import { AddGroupModal } from "../../components/AddGroupModal";
import { useEffect, useState } from "react";

export default function Home() {
    const [month, setMonth] = useState<string>(new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`);
    const [year, setYear] = useState<string>(`${new Date().getFullYear()}`);

    const mesAno = `${month}-${year}`;

    const [tasks, setTasks] = useState<any[]>([]);
    const [user, setUser] = useState<{ email: string; name: string } | null>(null);
    const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
    const [addGroupModalVisible, setAddGroupModalVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const getUserInfo = async () => {
            const userData = await AsyncStorage.getItem("userInfo");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };
        getUserInfo();
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const data = await getTasks(mesAno);

                const groupedTasks = data.reduce((acc: any, task: any) => {
                    const category = task.grupoGastos?.nome || "Sem categoria";
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(task);
                    return acc;
                }, {});

                const formattedTasks = Object.keys(groupedTasks).map((category) => ({
                    title: category,
                    data: groupedTasks[category],
                }));

                setTasks(formattedTasks);
                setError(null);
            } catch (error) {
                console.error("Erro ao buscar gastos:", error);
                setError("Não foi possível carregar os gastos. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [mesAno]); // disparar fetch toda vez que mesAno mudar

    // Função para renderizar os selects de mês e ano
    const renderDateFilter = () => {
        const months = [
            { label: 'Janeiro', value: '01' }, { label: 'Fevereiro', value: '02' }, { label: 'Março', value: '03' },
            { label: 'Abril', value: '04' }, { label: 'Maio', value: '05' }, { label: 'Junho', value: '06' },
            { label: 'Julho', value: '07' }, { label: 'Agosto', value: '08' }, { label: 'Setembro', value: '09' },
            { label: 'Outubro', value: '10' }, { label: 'Novembro', value: '11' }, { label: 'Dezembro', value: '12' },
        ];

        // Exemplo simples de anos - últimos 5 anos até ano atual
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 6 }, (_, i) => `${currentYear - i}`);

        return (
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={month}
                    style={{ width: '48%', backgroundColor: '#f0f0f0', borderRadius: 8 }}
                    onValueChange={(itemValue) => setMonth(itemValue)}
                >
                    {months.map(m => (
                        <Picker.Item key={m.value} label={m.label} value={m.value} />
                    ))}
                </Picker>

                <Picker
                    selectedValue={year}
                    style={{ width: '48%', backgroundColor: '#f0f0f0', borderRadius: 8 }}
                    onValueChange={(itemValue) => setYear(itemValue)}
                >
                    {years.map(y => (
                        <Picker.Item key={y} label={y} value={y} />
                    ))}
                </Picker>
            </View>

        );
    };

    const handleViewExpenses = () => {
        const expenses = tasks.flatMap(category =>
            category.data.map((task: { id: any; valor: any; data: any; }) => ({
                id: task.id,
                category: category.title,
                amount: task.valor,
                date: task.data
            }))
        );
    };

    const totalSpent = tasks.reduce((sum, category) => {
        const categoryTotal = category.data.reduce((catSum: number, task: any) => catSum + task.valor, 0);
        return sum + categoryTotal;
    }, 0);

    const summaries = tasks.map(category => ({
        category: category.title,
        amount: category.data.reduce((sum: any, task: { valor: any; }) => sum + task.valor, 0),
    }));

    return (
        <>
            <SectionList
                sections={tasks}
                keyExtractor={(item, index) => item.id + index}
                renderItem={({ item }) => (
                    <Text>{item.descricao} - {item.valor}</Text>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>{title}</Text>
                )}
                ListHeaderComponent={
                    <>
                        {renderDateFilter()}
                        <MiniDashboard summaries={summaries} total={totalSpent} />
                        <HomeActions
                            onAddExpense={() => setAddExpenseModalVisible(true)}
                            onAddGroup={() => setAddGroupModalVisible(true)}
                            onViewExpenses={handleViewExpenses}
                        />
                        {loading && <Text style={{ textAlign: 'center', marginTop: 10 }}>Carregando...</Text>}
                        {error && <Text style={{ textAlign: 'center', marginTop: 10, color: 'red' }}>{error}</Text>}
                    </>
                }
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
            />


            <AddExpenseModal
                visible={addExpenseModalVisible}
                onClose={() => setAddExpenseModalVisible(false)}
                onSubmit={(data: any) => {
                    console.log('Nova despesa:', data);
                    setAddExpenseModalVisible(false);
                }}
            />

            <AddGroupModal
                visible={addGroupModalVisible}
                onClose={() => setAddGroupModalVisible(false)}
                onSubmit={(name: any) => {
                    console.log('Novo grupo:', name);
                    setAddGroupModalVisible(false);
                }}
            />
        </>
    );
}
