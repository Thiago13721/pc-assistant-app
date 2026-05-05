import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, StatusBar, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, CartItem } from '../store/useStore'; // <-- Zustand

type CartNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

interface Props {
  navigation: CartNavigationProp;
}

export function Cart({ navigation }: Props) {
  // Lendo do Zustand
  const cart = useStore(state => state.cart);
  const removeFromCart = useStore(state => state.removeFromCart);
  const updateQuantity = useStore(state => state.updateQuantity);
  const clearCartState = useStore(state => state.clearCart);

  const removeItem = (id: string, name: string) => {
    Alert.alert(
      'Remover item',
      `Deseja remover "${name}" do carrinho?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFromCart(id),
        },
      ]
    );
  };

  const clearCart = () => {
    Alert.alert(
      'Limpar carrinho',
      'Deseja remover todos os itens?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearCartState },
      ]
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      <View style={styles.cardBody}>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardPrice}>R$ {formatPrice(item.price)}</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <MaterialCommunityIcons name="minus" size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, +1)}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardRight}>
        <Text style={styles.subtotal}>
          R$ {formatPrice(item.price * item.quantity)}
        </Text>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeItem(item.id, item.name)}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="cart-off" size={64} color="#333" />
      <Text style={styles.emptyTitle}>Carrinho vazio</Text>
      <Text style={styles.emptySubtitle}>Adicione peças para continuar</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyBtnText}>Explorar peças</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrinho</Text>
        {cart.length > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      {cart.length > 0 && (
        <Text style={styles.countText}>
          {totalItems} {totalItems === 1 ? 'item' : 'itens'} no carrinho
        </Text>
      )}

      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>R$ {formatPrice(total)}</Text>
            <Text style={styles.footerItemCount}>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Checkout')}
          >
            <MaterialCommunityIcons name="credit-card-outline" size={22} color="#000" />
            <Text style={styles.checkoutBtnText}>Finalizar compra</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  clearBtn: { padding: 8, backgroundColor: '#ff444422', borderRadius: 10 },
  countText: { color: '#555', fontSize: 13, paddingHorizontal: 24, marginBottom: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  card: {
    flexDirection: 'row', backgroundColor: '#1a1a1a',
    borderRadius: 16, marginBottom: 12, padding: 14,
    borderWidth: 1, borderColor: '#2a2a2a', gap: 12,
  },
  cardImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#111' },
  cardBody: { flex: 1, justifyContent: 'space-between' },
  cardCategory: { fontSize: 11, color: '#555', marginBottom: 2 },
  cardName: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  cardPrice: { fontSize: 13, color: '#00d4ff', fontWeight: '600', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: 15, fontWeight: 'bold', color: '#fff', minWidth: 20, textAlign: 'center' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  subtotal: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  removeBtn: { padding: 4, backgroundColor: '#ff444422', borderRadius: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  emptySubtitle: { fontSize: 14, color: '#555' },
  emptyBtn: {
    marginTop: 8, backgroundColor: '#00d4ff',
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  emptyBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#171717', borderTopWidth: 1, borderTopColor: '#2a2a2a',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28, gap: 16,
  },
  footerTotal: { flex: 1 },
  footerTotalLabel: { fontSize: 11, color: '#555', marginBottom: 2 },
  footerTotalValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  footerItemCount: { fontSize: 11, color: '#a1a1aa' },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#00d4ff', paddingHorizontal: 20,
    height: 52, borderRadius: 14,
  },
  checkoutBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});