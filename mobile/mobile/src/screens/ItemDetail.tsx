import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore';
import Toast from 'react-native-root-toast';

type ItemDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ItemDetail'>;
type ItemDetailRouteProp = RouteProp<RootStackParamList, 'ItemDetail'>;

interface Props {
  navigation: ItemDetailNavigationProp;
  route: ItemDetailRouteProp;
}

interface StorePrice {
  store: string;
  price: number;
}

const STORE_MULTIPLIERS = [
  { store: 'Mercado Livre', multiplier: 1.00 },
  { store: 'Pichau',        multiplier: 1.03 },
  { store: 'KaBuM',         multiplier: 1.06 },
  { store: 'Terabyte',      multiplier: 1.08 },
];

export function ItemDetail({ navigation, route }: Props) {
  const { product } = route.params;

  const cart = useStore(state => state.cart);
  const pcBuild = useStore(state => state.pcBuild);
  const addToCart = useStore(state => state.addToCart);
  const setBuildItem = useStore(state => state.setBuildItem);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [storePrices, setStorePrices] = useState<StorePrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [mlPrice, setMlPrice] = useState<number | null>(null);

  const isCartAdded = cart.some(item => item.id === product.id);
  const isBuildAdded = pcBuild[product.category]?.id === product.id;

  const lowestPrice = storePrices.length > 0 ? storePrices[0].price : product.price;
  const lowestStore = storePrices.length > 0 ? storePrices[0] : { store: 'Mercado Livre', price: product.price };

  useEffect(() => {
    fetchMLPrice();
  }, []);

  const useMockPrices = () => {
    const base = product.price;
    const generated: StorePrice[] = STORE_MULTIPLIERS.map(s => ({
      store: s.store,
      price: +(base * s.multiplier).toFixed(2),
    }));
    setStorePrices(generated.sort((a, b) => a.price - b.price));
    setPricesLoading(false);
  };

  const fetchMLPrice = async () => {
  setPricesLoading(true);
  try {
    const response = await fetch(
      `https://pc-assistant-app-2.onrender.com/api/price/${encodeURIComponent(product.name)}`
    );

    console.log('📡 Status:', response.status);
    const data = await response.json();
    console.log('✅ Preço ML:', data.price);

    if (!data.price) {
      useMockPrices();
      return;
    }

    setMlPrice(data.price);

    const generated: StorePrice[] = STORE_MULTIPLIERS.map(s => ({
      store: s.store,
      price: +(data.price * s.multiplier).toFixed(2),
    }));
    setStorePrices(generated.sort((a, b) => a.price - b.price));
  } catch (e) {
    console.log('💥 Erro:', e);
    useMockPrices();
  } finally {
    setPricesLoading(false);
  }
};

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    const colors = { success: '#4ade80', info: '#00d4ff', error: '#ff4444' };
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
      const response = await fetch('https://pc-assistant-app-2.onrender.com/api/ai/ask', {
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
          {/* Validação: Só tenta carregar a imagem se a URL existir no banco de dados */}
          {product.image && product.image.length > 5 ? (
            <Image 
              source={{ uri: product.image }} 
              style={styles.productImage} 
              resizeMode="contain" // Isso impede que fotos retangulares fiquem achatadas
            />
          ) : (
            // Fallback: Se não tiver imagem, mostra um ícone de placeholder elegante
            <MaterialCommunityIcons name="image-outline" size={80} color="#333" />
          )}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.bestPriceBadge}>
            <MaterialCommunityIcons name="tag" size={14} color="#4ade80" />
            <Text style={styles.bestPriceText}>
              Menor: R$ {formatPrice(lowestPrice)}
            </Text>
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
          <Text style={styles.sectionSubtitle}>
            {mlPrice ? 'Preço real do Mercado Livre' : 'Estimativa baseada no preço base'}
          </Text>

          {pricesLoading ? (
            <View style={styles.pricesLoadingBox}>
              <ActivityIndicator size="small" color="#00d4ff" />
              <Text style={styles.aiLoadingText}>Buscando preços...</Text>
            </View>
          ) : (
            storePrices.map((item, index) => (
              <View key={item.store} style={[styles.storeRow, index === 0 && styles.storeRowBest]}>
                <View style={styles.storeLeft}>
                  {index === 0 && (
                    <MaterialCommunityIcons name="crown" size={14} color="#4ade80" style={{ marginRight: 6 }} />
                  )}
                  <Text style={[styles.storeName, index === 0 && styles.storeNameBest]}>
                    {item.store}
                  </Text>
                  {index === 0 && mlPrice && (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>AO VIVO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.storePrice, index === 0 && styles.storePriceBest]}>
                  R$ {formatPrice(item.price)}
                </Text>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.refreshPricesBtn} onPress={fetchMLPrice}>
            <MaterialCommunityIcons name="refresh" size={14} color="#07c5ff" />
            <Text style={styles.refreshPricesText}>Atualizar preços</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise da IA</Text>
          {aiResult === '' && !aiLoading ? (
            <TouchableOpacity style={styles.aiTriggerBtn} onPress={checkCompatibility} activeOpacity={0.8}>
              <MaterialCommunityIcons name="robot" size={20} color="#000000" />
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
  container: { flex: 1, backgroundColor: '#354cb3' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center', marginHorizontal: 10 },
  scroll: { paddingBottom: 130 },

  imageContainer: { 
    height: 250, 
    backgroundColor: '#1a1a1a', 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2a2a2a',
    overflow: 'hidden' // Garante que a imagem não saia das bordas arredondadas
  },
  productImage: { 
    width: '90%', 
    height: '90%',
  },

  titleRow: { paddingHorizontal: 20, marginBottom: 10 },
  productName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  bestPriceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#4ade8022', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
  },
  bestPriceText: { color: '#4ade80', fontSize: 13, fontWeight: '600' },
  description: { color: '#ececf0', fontSize: 14, lineHeight: 22, paddingHorizontal: 20, marginBottom: 24 },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: '#fffdfd', marginBottom: 12 },

  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  specItem: {
    backgroundColor: '#1e1e1e', borderRadius: 10, padding: 12,
    minWidth: '45%', flex: 1, borderWidth: 1, borderColor: '#2a2a2a',
  },
  specKey: { fontSize: 10, color: '#f7f6f6', fontWeight: 'bold', marginBottom: 4 },
  specValue: { fontSize: 14, color: '#00d4ff', fontWeight: 'bold' },

  pricesLoadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16, marginBottom: 8,
  },
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
  liveBadge: {
    backgroundColor: '#4ade8022', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8,
  },
  liveBadgeText: { color: '#4ade80', fontSize: 9, fontWeight: 'bold' },
  refreshPricesBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    justifyContent: 'center', marginTop: 4, padding: 8,
  },
  refreshPricesText: { color: '#11f7ff', fontSize: 12 },

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
  footerPriceLabel: { fontSize: 11, color: '#f5f5f5', marginBottom: 2 },
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