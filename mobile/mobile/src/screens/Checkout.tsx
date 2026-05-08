import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore';

type CheckoutNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

interface Props {
  navigation: CheckoutNavigationProp;
}

type PaymentMethod = 'PIX' | 'CREDIT_CARD';

export function Checkout({ navigation }: Props) {
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const addOrder = useStore(state => state.addOrder);
  const addresses = useStore(state => state.addresses);
  const selectedAddressId = useStore(state => state.selectedAddressId);
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) ?? null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [isProcessing, setIsProcessing] = useState(false);

  const { total, shipping, finalTotal } = useMemo(() => {
    const t = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const s = t > 1000 ? 0 : 45.90;
    return { total: t, shipping: s, finalTotal: t + s };
  }, [cart]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatCEP = (cep: string) => {
    const c = cep.replace(/\D/g, '');
    return c.length > 5 ? `${c.slice(0, 5)}-${c.slice(5, 8)}` : c;
  };

  const handleFinishOrder = () => {
    if (!selectedAddress) {
      Alert.alert('Atenção', 'Selecione um endereço de entrega antes de continuar.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      addOrder(cart, finalTotal, paymentMethod);
      clearCart();
      Alert.alert(
        'Pedido Confirmado! 🎉',
        'Sua compra foi processada com sucesso. Você pode acompanhar o status no seu perfil.',
        [{ text: 'Voltar ao Início', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }]
      );
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#555" />
          <Text style={styles.emptyText}>Não há itens para checkout.</Text>
          <TouchableOpacity style={styles.backBtnAction} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Resumo do Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
              </Text>
              <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frete</Text>
              <Text style={[styles.summaryValue, shipping === 0 && styles.freeShipping]}>
                {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total a Pagar</Text>
              <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Endereço de Entrega */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Entrega</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
              <Text style={styles.editText}>Alterar</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressBox}>
              <MaterialCommunityIcons name="map-marker-outline" size={24} color="#00d4ff" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{selectedAddress.label}</Text>
                <Text style={styles.addressText}>
                  {selectedAddress.street}, {selectedAddress.number}
                  {selectedAddress.complement ? ` - ${selectedAddress.complement}` : ''}
                </Text>
                <Text style={styles.addressText}>
                  {selectedAddress.city}, {selectedAddress.state} - CEP {formatCEP(selectedAddress.cep)}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addressBox, styles.addressBoxEmpty]}
              onPress={() => navigation.navigate('Addresses')}
            >
              <MaterialCommunityIcons name="map-marker-plus-outline" size={24} color="#ff4444" />
              <View style={styles.addressInfo}>
                <Text style={[styles.addressName, { color: '#ff4444' }]}>Nenhum endereço selecionado</Text>
                <Text style={styles.addressText}>Toque para adicionar um endereço de entrega</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Forma de Pagamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>

          <TouchableOpacity
            style={[styles.paymentMethod, paymentMethod === 'PIX' && styles.paymentMethodActive]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('PIX')}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={paymentMethod === 'PIX' ? '#00d4ff' : '#a1a1aa'} />
            <View style={styles.paymentMethodInfo}>
              <Text style={[styles.paymentMethodTitle, paymentMethod === 'PIX' && styles.paymentMethodTitleActive]}>Pix</Text>
              <Text style={styles.paymentMethodDesc}>Aprovação imediata</Text>
            </View>
            {paymentMethod === 'PIX' && <MaterialCommunityIcons name="check-circle" size={20} color="#00d4ff" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentMethod, paymentMethod === 'CREDIT_CARD' && styles.paymentMethodActive]}
            activeOpacity={0.8}
            onPress={() => setPaymentMethod('CREDIT_CARD')}
          >
            <MaterialCommunityIcons name="credit-card-outline" size={24} color={paymentMethod === 'CREDIT_CARD' ? '#00d4ff' : '#a1a1aa'} />
            <View style={styles.paymentMethodInfo}>
              <Text style={[styles.paymentMethodTitle, paymentMethod === 'CREDIT_CARD' && styles.paymentMethodTitleActive]}>Cartão de Crédito</Text>
              <Text style={styles.paymentMethodDesc}>Até 12x sem juros</Text>
            </View>
            {paymentMethod === 'CREDIT_CARD' && <MaterialCommunityIcons name="check-circle" size={20} color="#00d4ff" />}
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutBtn, isProcessing && styles.checkoutBtnProcessing]}
          activeOpacity={0.8}
          disabled={isProcessing}
          onPress={handleFinishOrder}
        >
          {isProcessing
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.checkoutBtnText}>Confirmar Pagamento</Text>
          }
        </TouchableOpacity>
      </View>
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
  scroll: { paddingBottom: 120 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 14 },
  editText: { color: '#00d4ff', fontSize: 13, fontWeight: 'bold', marginBottom: 14 },

  summaryBox: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#a1a1aa', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  freeShipping: { color: '#4ade80', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#2a2a2a', marginVertical: 12 },
  totalLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: '#00d4ff', fontSize: 18, fontWeight: 'bold' },

  addressBox: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  addressBoxEmpty: { borderColor: '#ff4444', borderStyle: 'dashed' },
  addressInfo: { flex: 1 },
  addressName: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  addressText: { color: '#a1a1aa', fontSize: 13, marginBottom: 2 },

  paymentMethod: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 12,
  },
  paymentMethodActive: { borderColor: '#00d4ff', backgroundColor: '#00d4ff11' },
  paymentMethodInfo: { flex: 1 },
  paymentMethodTitle: { color: '#a1a1aa', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  paymentMethodTitleActive: { color: '#fff' },
  paymentMethodDesc: { color: '#555', fontSize: 12 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#171717', borderTopWidth: 1, borderTopColor: '#2a2a2a',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28,
  },
  checkoutBtn: {
    backgroundColor: '#4ade80', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  checkoutBtnProcessing: { backgroundColor: '#4ade8088' },
  checkoutBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyText: { color: '#a1a1aa', fontSize: 16 },
  backBtnAction: { backgroundColor: '#1e1e1e', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold' },
});