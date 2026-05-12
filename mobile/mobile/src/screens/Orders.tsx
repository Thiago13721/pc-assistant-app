import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, Order } from '../store/useStore';

type OrdersNavigationProp = StackNavigationProp<RootStackParamList, 'Orders'>;

interface Props {
  navigation: OrdersNavigationProp;
}

const STATUS_CONFIG = {
  PENDING:   { label: 'Aguardando Pagamento', color: '#f59e0b', icon: 'clock-outline' },
  PAID:      { label: 'Pagamento Aprovado',   color: '#00d4ff', icon: 'check-circle-outline' },
  DELIVERED: { label: 'Entregue',             color: '#4ade80', icon: 'package-variant-closed' },
  CANCELLED: { label: 'Cancelado',            color: '#ff4444', icon: 'close-circle-outline' },
};

export function Orders({ navigation }: Props) {
  const orders = useStore(state => state.orders);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatPrice = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const renderOrder = ({ item }: { item: Order }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    const shortId = item.id.split('_')[1].slice(0, 6).toUpperCase();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Pedido #{shortId}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.itemCount}>
            {item.itemCount} {item.itemCount === 1 ? 'item' : 'itens'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
        </View>

        <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.7}>
          <Text style={styles.detailsBtnText}>Ver Detalhes</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#00d4ff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={64} color="#333" />
            <Text style={styles.emptyTitle}>Nenhum pedido</Text>
            <Text style={styles.emptySubtitle}>Você ainda não fez nenhuma compra.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#354cb3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    backgroundColor: '#1a1a1a', borderRadius: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#1e1e1e', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  orderId: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  orderDate: { color: '#a1a1aa', fontSize: 13 },

  cardBody: { padding: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
  itemCount: { color: '#a1a1aa', fontSize: 13 },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingBottom: 14,
  },
  totalLabel: { color: '#a1a1aa', fontSize: 14 },
  totalValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  detailsBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#2a2a2a',
    backgroundColor: '#00d4ff11',
  },
  detailsBtnText: { color: '#00d4ff', fontWeight: 'bold', fontSize: 14, marginRight: 4 },

  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  emptySubtitle: { color: '#a1a1aa', fontSize: 14, marginTop: 8 },
});