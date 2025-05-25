import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  categoryText: { fontSize: 16 },
  amountText: { fontSize: 16, fontWeight: '500' },
  totalContainer: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 18, fontWeight: '600' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
});
