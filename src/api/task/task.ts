import order from '../clients/taskClient';

export async function getTasks(mesAno: string) {
    try {
        const response = await order.get(`/gastos/listar/${mesAno}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar gastos:', error);
        throw error;
    }
}
