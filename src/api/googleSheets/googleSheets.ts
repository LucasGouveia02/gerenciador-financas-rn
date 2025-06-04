// src/api/googleSheets.ts
const SPREADSHEET_ID = process.env.EXPO_PUBLIC_SPREADSHEET_ID; // Defina no .env e eas.json

// --- INTERFACE PARA NOVOS GASTOS ---
interface NewExpenseDataForSheet {
  date: string;
  description: string;
  category: string;
  amount: number;
}

// --- FUNÇÃO PARA ADICIONAR GASTO ---
export async function addExpenseToSheet(
  accessToken: string,
  expenseData: NewExpenseDataForSheet,
  sheetName: string = "Gastos" // Aba padrão para gastos
): Promise<any> {
  if (!SPREADSHEET_ID) throw new Error("ID da Planilha (SPREADSHEET_ID) não configurado.");
  if (!accessToken) throw new Error("Token de acesso não fornecido.");

  const range = `${sheetName}!A:D`; // Colunas: Data, Descrição, Categoria, Valor
  const body = {
    values: [
      [
        expenseData.date,
        expenseData.description,
        expenseData.category,
        expenseData.amount,
      ],
    ],
  };

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Erro Sheets API (addExpense):', errorResponse);
      throw new Error(errorResponse.error?.message || 'Falha ao adicionar gasto na planilha.');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro em addExpenseToSheet:', error);
    throw error;
  }
}

// --- FUNÇÃO PARA ADICIONAR GRUPO/CATEGORIA ---
export async function addCategoryToSheet(
  accessToken: string,
  categoryName: string,
  sheetName: string = "Categorias" // Aba padrão para categorias
): Promise<any> {
  if (!SPREADSHEET_ID) throw new Error("ID da Planilha (SPREADSHEET_ID) não configurado.");
  if (!accessToken) throw new Error("Token de acesso não fornecido.");

  const range = `${sheetName}!A:A`; // Adicionar na primeira coluna
  const body = {
    values: [[categoryName]],
  };

  try {
    // Opcional: verificar se a categoria já existe antes de adicionar
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Erro Sheets API (addCategory):', errorResponse);
      throw new Error(errorResponse.error?.message || 'Falha ao adicionar categoria.');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro em addCategoryToSheet:', error);
    throw error;
  }
}

// --- FUNÇÃO PARA LISTAR GASTOS ---
export async function getExpensesFromSheet(
  accessToken: string,
  mesAno: string, // Formato "MM-YYYY"
  gastosSheetName: string = "Gastos"
): Promise<any[]> {
  if (!SPREADSHEET_ID) throw new Error("ID da Planilha (SPREADSHEET_ID) não configurado.");
  if (!accessToken) throw new Error("Token de acesso não fornecido.");

  // O range agora vai até a coluna G. Se a linha 1 for cabeçalho, comece de A2.
  const range = `${gastosSheetName}!A2:G`; // Buscando da linha 2 em diante até a coluna G

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`,
      // Adicionado valueRenderOption e dateTimeRenderOption para melhor consistência dos dados
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      if (errorResponse.error?.status === 'NOT_FOUND' || (errorResponse.error?.message && errorResponse.error.message.includes('Unable to parse range'))) {
        console.warn(`Aba "${gastosSheetName}" ou range ${range} inválido/não encontrado. Retornando lista vazia.`);
        return [];
      }
      console.error('Erro Sheets API (getExpenses):', errorResponse);
      throw new Error(errorResponse.error?.message || 'Falha ao buscar gastos.');
    }

    const result = await response.json();
    const values = result.values;

    if (!values || values.length === 0) {
      console.log(`Nenhum dado encontrado na aba "${gastosSheetName}" para o range ${range}.`);
      return [];
    }

    const [filterMonth, filterYear] = mesAno.split('-'); // "MM", "YYYY"

    const expenses = values
      .map((row: any[], index: number) => {
        // Verificar se a linha tem o número mínimo de colunas esperadas e se o valor é numérico
        if (!row || row.length < 6 || row[0] === undefined || row[0] === null || row[0] === '') { // ID_Gasto não pode ser vazio
          // console.log(`Linha ${index + 2} pulada por dados insuficientes ou ID vazio:`, row);
          return null;
        }

        // Coluna A: ID_Gasto       (row[0])
        // Coluna B: DescricaoGasto (row[1])
        // Coluna C: NomeGasto      (row[2])
        // Coluna D: CategoriaGasto (row[3])
        // Coluna E: ValorGasto     (row[4])
        // Coluna F: DataInicioGasto(row[5])
        // Coluna G: DataFimGasto   (row[6]) (opcional)

        const expenseDateSerial = row[5]; // DataInicioGasto (pode ser número serial do Sheets)
        let formattedDate = '';

        if (typeof expenseDateSerial === 'number') {
          // Converter número serial do Excel/Sheets para data JavaScript
          // Data base do Excel é 30/12/1899. JavaScript é 01/01/1970.
          // Diferença é 25569 dias.
          const jsDate = new Date((expenseDateSerial - 25569) * 86400 * 1000);
          const Y = jsDate.getUTCFullYear();
          const M = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
          const D = String(jsDate.getUTCDate()).padStart(2, '0');
          formattedDate = `${Y}-${M}-${D}`;
        } else if (typeof row[5] === 'string' && row[5].match(/^\d{4}-\d{2}-\d{2}/)) {
            // Se já estiver no formato AAAA-MM-DD (ou AAAA-MM-DD com hora)
            formattedDate = row[5].substring(0, 10);
        } else if (typeof row[5] === 'string' && row[5].match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
            // Se estiver como DD/MM/YYYY ou M/D/YYYY etc.
            const parts = row[5].split('/');
            const D = parts[0].padStart(2, '0');
            const M = parts[1].padStart(2, '0');
            const Y = parts[2];
            formattedDate = `${Y}-${M}-${D}`; // Convertendo para AAAA-MM-DD
        } else {
            // console.log(`Formato de data não reconhecido na linha ${index + 2}:`, row[5]);
            return null; // Pular se a data não for reconhecível
        }


        return {
          id: row[0] ? String(row[0]) : `temp-id-${index}`, // ID_Gasto (Coluna A)
          descricao: row[1] ? String(row[1]) : '',      // DescricaoGasto (Coluna B)
          nomeGasto: row[2] ? String(row[2]) : '',        // NomeGasto (Coluna C)
          grupoGastos: { nome: row[3] ? String(row[3]) : 'Sem categoria' }, // CategoriaGasto (Coluna D)
          valor: parseFloat(String(row[4]).replace(',', '.')) || 0, // ValorGasto (Coluna E)
          data: formattedDate, // DataInicioGasto (Coluna F) - já formatada para AAAA-MM-DD
          dataFim: row[6] ? String(row[6]) : undefined, // DataFimGasto (Coluna G) (opcional)
        };
      })
      .filter((expense: null) => expense !== null) // Remove linhas nulas/inválidas
      .filter((expense: { data: string; }) => { // Filtra pelo mês e ano
        if (!expense || !expense.data) return false;
        // expense.data agora deve estar no formato AAAA-MM-DD
        const partsISO = expense.data.split('-'); // [YYYY, MM, DD]
        if (partsISO.length === 3) {
            const Y = partsISO[0];
            const M = partsISO[1];
            return M === filterMonth && Y === filterYear;
        }
        return false;
      });

    return expenses as any[];
  } catch (error) {
    console.error('Erro em getExpensesFromSheet:', error);
    throw error;
  }
}