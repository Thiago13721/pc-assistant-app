import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore'; // <-- Zustand
import Toast from 'react-native-root-toast';

type ItemDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ItemDetail'>;
type ItemDetailRouteProp = RouteProp<RootStackParamList, 'ItemDetail'>;

interface Props {
  navigation: ItemDetailNavigationProp;
  route: ItemDetailRouteProp;
}

const MOCK_STORE_PRICES = (basePrice: number) => [
  { store: 'KaBuM',         price: basePrice },
  { store: 'Pichau',        price: +(basePrice * 0.97).toFixed(2) },
  { store: 'Terabyte',      price: +(basePrice * 1.03).toFixed(2) },
  { store: 'Mercado Livre', price: +(basePrice * 0.95).toFixed(2) },
];

export function ItemDetail({ navigation, route }: Props) {
  const { product } = route.params;
  
  // Zustand States
  const cart = useStore(state => state.cart);
  const pcBuild = useStore(state => state.pcBuild);
  const addToCart = useStore(state => state.addToCart);
  const setBuildItem = useStore(state => state.setBuildItem);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult]   = useState('');

  // Verifica se já está selecionado
  const isCartAdded = cart.some(item => item.id === product.id);
  const isBuildAdded = pcBuild[product.category]?.id === product.id;

  const storePrices = MOCK_STORE_PRICES(product.price);
  const lowestPrice = Math.min(...storePrices.map(s => s.price));
  const lowestStore = storePrices.find(s => s.price === lowestPrice)!;

const showToast = (message: string, type: 'success' | 'info' | 'error') => {
  const colors = {
    success: '#4ade80',
    info: '#00d4ff',
    error: '#ff4444',
  };
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    position: Toast.positions.TOP,
    shadow: true,
    animation: true,
    backgroundColor: '#1a1a1a',
    textColor: colors[type],
    opacity: 1,
    containerStyle: {
      borderWidth: 1,
      borderColor: colors[type],
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginTop: 50,
    },
  });
};

  const handleAddToCart = () => {
    if (isCartAdded) return;
    addToCart(product);
    showToast(`🛒 ${product.name} adicionado ao carrinho`, 'success');
  };


  const handleAddToBuild = () => {
    setBuildItem(product.category, product);
    showToast(`🖥️ ${product.name} adicionado ao build`, 'info');
  };

  const checkCompatibility = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const response = await fetch('http://10.0.2.2:3000/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: product.category,
          query: `O produto "${product.name}" com as seguintes specs: ${JSON.stringify(product.specs)} é uma boa escolha? Ele é compatível com builds comuns? Dê uma análise técnica rápida e direta.`,
        }),
      });
      const data = await response.json();
      const rawText = data?.answer ?? 'Não foi possível obter análise.';
      const cleanText = rawText
        .replace(/\*\*/g, '')      
        .replace(/\*/g, '')        
        .replace(/#{1,6}\s/g, '')  
        .replace(/`/g, '');        
      setAiResult(cleanText);
      
    } catch {
      setAiResult('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatPrice = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.category}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.bestPriceBadge}>
            <MaterialCommunityIcons name="tag" size={14} color="#4ade80" />
            <Text style={styles.bestPriceText}>Menor: R$ {formatPrice(lowestPrice)}</Text>
          </View>
        </View>

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especificações</Text>
          <View style={styles.specsGrid}>
            {Object.entries(product.specs).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={styles.specKey}>{key.toUpperCase()}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preço nas lojas</Text>
          <Text style={styles.sectionSubtitle}>Atualizado a cada 1 hora</Text>
          {storePrices
            .sort((a, b) => a.price - b.price)
            .map((item, index) => (
              <View key={item.store} style={[styles.storeRow, index === 0 && styles.storeRowBest]}>
                <View style={styles.storeLeft}>
                  {index === 0 && (
                    <MaterialCommunityIcons name="crown" size={14} color="#4ade80" style={{ marginRight: 6 }} />
                  )}
                  <Text style={[styles.storeName, index === 0 && styles.storeNameBest]}>
                    {item.store}
                  </Text>
                </View>
                <Text style={[styles.storePrice, index === 0 && styles.storePriceBest]}>
                  R$ {formatPrice(item.price)}
                </Text>
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise da IA</Text>
          {aiResult === '' && !aiLoading ? (
            <TouchableOpacity style={styles.aiTriggerBtn} onPress={checkCompatibility} activeOpacity={0.8}>
              <MaterialCommunityIcons name="robot" size={20} color="#000" />
              <Text style={styles.aiTriggerText}>Verificar compatibilidade</Text>
            </TouchableOpacity>
          ) : aiLoading ? (
            <View style={styles.aiLoadingBox}>
              <ActivityIndicator size="small" color="#00d4ff" />
              <Text style={styles.aiLoadingText}>Analisando peça...</Text>
            </View>
          ) : (
            <View style={styles.aiResultBox}>
              <View style={styles.aiResultHeader}>
                <MaterialCommunityIcons name="robot" size={18} color="#00d4ff" />
                <Text style={styles.aiResultLabel}>Análise técnica</Text>
                <TouchableOpacity onPress={() => setAiResult('')} style={styles.aiRefreshBtn}>
                  <MaterialCommunityIcons name="refresh" size={16} color="#555" />
                </TouchableOpacity>
              </View>
              <Text style={styles.aiResultText}>{aiResult}</Text>
            </View>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Melhor preço</Text>
          <Text style={styles.footerPriceValue}>R$ {formatPrice(lowestPrice)}</Text>
          <Text style={styles.footerPriceStore}>em {lowestStore.store}</Text>
        </View>

        <TouchableOpacity
          style={[styles.buildBtn, isBuildAdded && styles.btnDone]}
          activeOpacity={0.8}
          onPress={handleAddToBuild}
          disabled={isBuildAdded}
        >
          <MaterialCommunityIcons
            name={isBuildAdded ? 'check' : 'desktop-tower'}
            size={20} color="#000"
          />
          <Text style={styles.btnText}>{isBuildAdded ? 'Build ✓' : 'Build'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cartBtn, isCartAdded && styles.btnDone]}
          activeOpacity={0.8}
          onPress={handleAddToCart}
          disabled={isCartAdded}
        >
          <MaterialCommunityIcons
            name={isCartAdded ? 'check' : 'cart-plus'}
            size={20} color="#000"
          />
          <Text style={styles.btnText}>{isCartAdded ? 'Adicionado' : 'Carrinho'}</Text>
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
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center', marginHorizontal: 10 },
  scroll: { paddingBottom: 130 },
  imageContainer: {
    backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 20,
    padding: 24, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  productImage: { width: 200, height: 200, borderRadius: 12 },
  titleRow: { paddingHorizontal: 20, marginBottom: 10 },
  productName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  bestPriceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#4ade8022', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
  },
  bestPriceText: { color: '#4ade80', fontSize: 13, fontWeight: '600' },
  description: { color: '#a1a1aa', fontSize: 14, lineHeight: 22, paddingHorizontal: 20, marginBottom: 24 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: '#555', marginBottom: 12 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specItem: {
    backgroundColor: '#1e1e1e', borderRadius: 10, padding: 12,
    minWidth: '45%', flex: 1, borderWidth: 1, borderColor: '#2a2a2a',
  },
  specKey: { fontSize: 10, color: '#555', fontWeight: 'bold', marginBottom: 4 },
  specValue: { fontSize: 14, color: '#00d4ff', fontWeight: 'bold' },
  storeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#2a2a2a',
  },
  storeRowBest: { borderColor: '#4ade8055', backgroundColor: '#4ade8011' },
  storeLeft: { flexDirection: 'row', alignItems: 'center' },
  storeName: { fontSize: 14, color: '#a1a1aa', fontWeight: '500' },
  storeNameBest: { color: '#4ade80', fontWeight: 'bold' },
  storePrice: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
  storePriceBest: { color: '#4ade80' },
  aiTriggerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#00d4ff', height: 48, borderRadius: 12,
  },
  aiTriggerText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  aiLoadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16,
  },
  aiLoadingText: { color: '#a1a1aa', fontSize: 14 },
  aiResultBox: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#00d4ff33',
  },
  aiResultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiResultLabel: { flex: 1, color: '#00d4ff', fontWeight: 'bold', fontSize: 14 },
  aiRefreshBtn: { padding: 4 },
  aiResultText: { color: '#e4e4e7', fontSize: 14, lineHeight: 22 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#171717', borderTopWidth: 1, borderTopColor: '#2a2a2a',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28, gap: 10,
  },
  footerPrice: { flex: 1 },
  footerPriceLabel: { fontSize: 11, color: '#555', marginBottom: 2 },
  footerPriceValue: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  footerPriceStore: { fontSize: 11, color: '#4ade80' },
  buildBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f59e0b', paddingHorizontal: 14, height: 50, borderRadius: 13,
  },
  cartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#00d4ff', paddingHorizontal: 14, height: 50, borderRadius: 13,
  },
  btnDone: { backgroundColor: '#4ade80' },
  btnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
});