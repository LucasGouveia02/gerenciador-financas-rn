// Home.tsx
import React, { useEffect, useState, useCallback } from "react"; // Adicionado useCallback
import { View, Text, ScrollView, SectionList, Alert, StyleSheet as LocalStyles, ActivityIndicator } from "react-native"; // Adicionado Alert e LocalStyles
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles"; // Seus estilos existentes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MiniDashboard } from "../../components/MiniDashboard";
import { HomeActions } from "../../components/HomeActions";
import { AddExpenseModal } from "../../components/AddExpenseModal"; // Seu componente de modal
import { AddGroupModal } from "../../components/AddGroupModal";   // Seu componente de modal
import { addCategoryToSheet, addExpenseToSheet, getExpensesFromSheet } from "../../api/googleSheets/googleSheets";

// Interface para os dados que o AddExpenseModal vai submeter (precisa ser atualizada)
// Isso precisa corresponder ao que o seu AddExpenseModal realmente coleta e envia.
// A versão que você me mostrou de AddExpenseModal só tem 'name' e 'amount'.
// Você precisará atualizá-lo para coletar 'date' e 'category' também.
interface ExpenseModalSubmitData {
  date: string;       // ex: "2025-06-03" (formato AAAA-MM-DD)
  description: string; // Mapeia para 'DescricaoGasto'
  category: string;    // Mapeia para 'CategoriaGasto'
  amount: number;      // Mapeia para 'ValorGasto'
  name?: string;       // Mapeia para 'NomeGasto' (opcional, se for diferente da descrição)
}


export default function Home() {
  const [month, setMonth] = useState<string>(
    new Date().getMonth() + 1 < 10
      ? `0${new Date().getMonth() + 1}`
      : `${new Date().getMonth() + 1}`
  );
  const [year, setYear] = useState<string>(`${new Date().getFullYear()}`);
  const mesAno = `${month}-${year}`; // Formato MM-YYYY

  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [addGroupModalVisible, setAddGroupModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // const [modalVisible, setModalVisible] = useState(false); // Não parece usado

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    return await AsyncStorage.getItem('googleAccessToken');
  }, []);

  useEffect(() => {
    const getUserInfo = async () => {
      const userData = await AsyncStorage.getItem("userInfo");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    getUserInfo();
  }, []);

  // NOVA FUNÇÃO PARA BUSCAR DADOS DA PLANILHA
  const fetchExpensesFromGoogleSheet = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = await getAuthToken();

    if (!token) {
      setError("Não autenticado. Faça login para ver seus gastos.");
      setLoading(false);
      setTasks([]);
      return;
    }

    try {
      console.log(`Buscando gastos para ${mesAno} com token...`);
      const dataFromSheet = await getExpensesFromSheet(token, mesAno);
      console.log("Dados recebidos da planilha:", dataFromSheet);

      if (!dataFromSheet || dataFromSheet.length === 0) {
        setTasks([]); // Define como array vazio se não houver dados
        console.log("Nenhum gasto encontrado para o período.");
        setLoading(false);
        return;
      }

      // Sua lógica existente para agrupar e formatar os dados
      const groupedTasks = dataFromSheet.reduce((acc: any, task: any) => {
        // A função getExpensesFromSheet já retorna task.grupoGastos.nome
        const category = task.grupoGastos?.nome || "Sem categoria";
        if (!acc[category]) acc[category] = [];
        // A função getExpensesFromSheet já retorna 'descricao', 'valor', 'data' e 'nomeGasto'
        acc[category].push(task);
        return acc;
      }, {});

      const formattedTasks = Object.keys(groupedTasks).map((category) => ({
        title: category,
        data: groupedTasks[category], // 'data' aqui é o array de gastos da categoria
      }));

      setTasks(formattedTasks);
    } catch (err: any) {
      console.error("Erro ao buscar gastos da planilha:", err);
      let displayError = "Não foi possível carregar os gastos da planilha.";
      if (err.message.includes('NOT_FOUND') || err.message.includes('Unable to parse range')) {
        displayError = `A aba "Gastos" ou o range para ${mesAno} pode não existir. Verifique sua planilha.`;
        setTasks([]);
      }
      setError(displayError);
    } finally {
      setLoading(false);
    }
  }, [mesAno, getAuthToken]); // Adicionar getAuthToken como dependência

  useEffect(() => {
    if (mesAno) {
      fetchExpensesFromGoogleSheet();
    }
  }, [mesAno, fetchExpensesFromGoogleSheet]); // Adicionar fetchExpensesFromGoogleSheet como dependência

  // --- HANDLER PARA SUBMIT DO MODAL DE DESPESA ---
  const handleAddExpenseSubmit = async (data: ExpenseModalSubmitData) => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert('Erro', 'Não autenticado. Faça login para adicionar um gasto.');
      setAddExpenseModalVisible(false);
      return;
    }
    try {
      setLoading(true);
      // A função addExpenseToSheet espera: date, description, category, amount
      // O 'name' do seu modal original é a descrição. 'NomeGasto' é um campo novo.
      // Você precisará decidir como mapear os campos do seu modal para a planilha.
      // Por enquanto, vou assumir que 'data.description' é DescricaoGasto e não há NomeGasto separado no modal.
      await addExpenseToSheet(token, {
        date: data.date, // Precisa vir do modal
        description: data.description, // 'name' do seu modal atual
        category: data.category, // Precisa vir do modal
        amount: data.amount,
        // Se você adicionar NomeGasto ao modal: nomeGasto: data.name (ou como chamar)
      });
      Alert.alert('Sucesso', 'Gasto adicionado à planilha!');
      setAddExpenseModalVisible(false);
      fetchExpensesFromGoogleSheet(); // Re-busca os dados para atualizar a lista
    } catch (error: any) {
      console.error('Falha ao enviar despesa para a planilha:', error);
      Alert.alert('Erro', `Falha ao adicionar gasto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER PARA SUBMIT DO MODAL DE GRUPO ---
  const handleAddGroupSubmit = async (name: string) => {
    const token = await getAuthToken();
    if (!token) {
      Alert.alert('Erro', 'Não autenticado. Faça login para adicionar um grupo.');
      setAddGroupModalVisible(false);
      return;
    }
    try {
      setLoading(true);
      await addCategoryToSheet(token, name);
      Alert.alert('Sucesso', `Categoria "${name}" adicionada à planilha!`);
      setAddGroupModalVisible(false);
      // Opcional: Re-buscar lista de categorias se você as usa em algum Picker
    } catch (error: any) {
      console.error('Falha ao enviar grupo para a planilha:', error);
      Alert.alert('Erro', `Falha ao adicionar categoria: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para renderizar os selects de mês e ano (seu código existente)
  const renderDateFilter = () => {
    const months = [
        { label: 'Janeiro', value: '01' }, { label: 'Fevereiro', value: '02' }, { label: 'Março', value: '03' },
        { label: 'Abril', value: '04' }, { label: 'Maio', value: '05' }, { label: 'Junho', value: '06' },
        { label: 'Julho', value: '07' }, { label: 'Agosto', value: '08' }, { label: 'Setembro', value: '09' },
        { label: 'Outubro', value: '10' }, { label: 'Novembro', value: '11' }, { label: 'Dezembro', value: '12' },
    ];
    const currentFullYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => `${currentFullYear - i}`);

    return (
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={month}
                style={styles.pickerStyle} // Usando estilos locais ou de styles.js
                onValueChange={(itemValue) => setMonth(itemValue)}
            >
                {months.map(m => (
                    <Picker.Item key={m.value} label={m.label} value={m.value} />
                ))}
            </Picker>
            <Picker
                selectedValue={year}
                style={styles.pickerStyle} // Usando estilos locais ou de styles.js
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
    // Esta função atualmente opera sobre os 'tasks' já carregados.
    // Se você quiser ver "todos" os gastos da planilha, precisaria de uma chamada API diferente
    // ou modificar getExpensesFromSheet para não filtrar por mesAno.
    console.log("Visualizar Despesas (dados atuais):", tasks);
    const allExpensesFlat = tasks.flatMap(category =>
        category.data.map((task: any) => ({
            id: task.id,
            category: category.title, // ou task.grupoGastos.nome
            description: task.descricao,
            name: task.nomeGasto, // Adicionado nomeGasto
            amount: task.valor,
            date: task.data
        }))
    );
    console.log("Todas as despesas formatadas:", allExpensesFlat);
    // Aqui você poderia navegar para uma nova tela ou mostrar um modal com allExpensesFlat
  };

  // Cálculos para MiniDashboard (seu código existente, ajustado para robustez)
  const totalSpent = tasks.reduce((sum, category) => {
      const categoryTotal = category.data.reduce((catSum: number, task: any) => catSum + (Number(task.valor) || 0), 0);
      return sum + categoryTotal;
  }, 0);

  const summaries = tasks.map(category => ({
      category: category.title,
      amount: category.data.reduce((sum: any, task: { valor: any; }) => sum + (Number(task.valor) || 0), 0),
  }));

  return (
    <>
      <SectionList
        sections={tasks}
        keyExtractor={(item, index) => item.id ? item.id.toString() + index : `task-${index}`}
        renderItem={({ item }) => (
          // Exibindo NomeGasto (se houver) e DescricaoGasto
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>
                {item.nomeGasto ? `${item.nomeGasto}: ` : ''}{item.descricao}
            </Text>
            <Text style={styles.itemAmount}>R$ {item.valor ? Number(item.valor).toFixed(2) : '0.00'}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
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
            {loading && <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </>
        }
        ListEmptyComponent={
            !loading && !error ? <Text style={styles.emptyListText}>Nenhum gasto encontrado para {month}/{year}.</Text> : null
        }
        contentContainerStyle={styles.listContentContainer} // Usando estilos locais ou de styles.js
        stickySectionHeadersEnabled={false} // Pode ser útil
      />

      <AddExpenseModal
        visible={addExpenseModalVisible}
        onClose={() => setAddExpenseModalVisible(false)}
        onSubmit={handleAddExpenseSubmit} // Conecta ao novo handler
        // Você precisará atualizar AddExpenseModal para coletar 'date' e 'category'
        // e talvez 'nomeGasto' se for diferente da descrição.
      />

      <AddGroupModal
        visible={addGroupModalVisible}
        onClose={() => setAddGroupModalVisible(false)}
        onSubmit={handleAddGroupSubmit} // Conecta ao novo handler
      />
    </>
  );
}