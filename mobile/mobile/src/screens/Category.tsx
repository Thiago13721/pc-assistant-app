import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, StatusBar, TextInput, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type CategoryNavigationProp = StackNavigationProp<RootStackParamList, 'Category'>;
type CategoryRouteProp = RouteProp<RootStackParamList, 'Category'>;

interface Props {
  navigation: CategoryNavigationProp;
  route: CategoryRouteProp;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  specs: Record<string, string>;
}

// ── Mock data ───────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS: Record<string, Product[]> = {
  Processadores: [
    {
      id: 'cpu-1',
      name: 'AMD Ryzen 5 7600X',
      description: '6 núcleos / 12 threads — 4.7GHz base, 5.3GHz boost. Socket AM5.',
      price: 1349.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_805082-MLA99484774608_112025-F.webp',
      category: 'Processadores',
      specs: { socket: 'AM5', nucleos: '6', threads: '12', tdp: '105W' },
    },
    {
      id: 'cpu-2',
      name: 'AMD Ryzen 7 7700X',
      description: '8 núcleos / 16 threads — 4.5GHz base, 5.4GHz boost. Socket AM5.',
      price: 1899.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_892299-MLB51717285285_092022-F.webp',
      category: 'Processadores',
      specs: { socket: 'AM5', nucleos: '8', threads: '16', tdp: '105W' },
    },
    {
      id: 'cpu-3',
      name: 'Intel Core i5-13600K',
      description: '14 núcleos (6P+8E) / 20 threads — 3.5GHz base, 5.1GHz boost. Socket LGA1700.',
      price: 1599.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_836460-MLA99594506058_122025-F.webp',
      category: 'Processadores',
      specs: { socket: 'LGA1700', nucleos: '14', threads: '20', tdp: '125W' },
    },
    {
      id: 'cpu-4',
      name: 'Intel Core i7-13700K',
      description: '16 núcleos (8P+8E) / 24 threads — 3.4GHz base, 5.4GHz boost. Socket LGA1700.',
      price: 2349.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_746094-MLA99547953918_122025-F.webp',
      category: 'Processadores',
      specs: { socket: 'LGA1700', nucleos: '16', threads: '24', tdp: '125W' },
    },
    {
      id: 'cpu-5',
      name: 'AMD Ryzen 9 7950X',
      description: '16 núcleos / 32 threads — 4.5GHz base, 5.7GHz boost. Top de linha AM5.',
      price: 4199.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_844841-MLB75986236397_042024-F.webp',
      category: 'Processadores',
      specs: { socket: 'AM5', nucleos: '16', threads: '32', tdp: '170W' },
    },
  ],
  'Placas de Vídeo': [
    {
      id: 'gpu-1',
      name: 'MSI RTX 4060 Ventus 2x White OC',
      description: '8GB GDDR6 — Ótima para 1080p. TDP 115W. PCIe 4.0 x8.',
      price: 2199.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_746718-MLA99957267175_112025-F.webp',
      category: 'Placas de Vídeo',
      specs: { vram: '8GB GDDR6', tdp: '115W', interface: 'PCIe 4.0 x8' },
    },
    {
      id: 'gpu-2',
      name: 'Zotac Gaming Geforce Rtx 4070 Twin Edge Oc Dlss 3 12gb',
      description: '12GB GDDR6X — Excelente para 1440p. TDP 200W.',
      price: 3499.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_979338-CBT74327457213_012024-F.webp',
      category: 'Placas de Vídeo',
      specs: { vram: '12GB GDDR6X', tdp: '200W', interface: 'PCIe 4.0 x16' },
    },
    {
      id: 'gpu-3',
      name: 'Asrock Amd Radeon Rx 7700 Xt Challenger 12gb',
      description: '12GB GDDR6 — Competitiva em 1440p. TDP 245W.',
      price: 2799.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_610569-CBT77903235273_072024-F.webp',
      category: 'Placas de Vídeo',
      specs: { vram: '12GB GDDR6', tdp: '245W', interface: 'PCIe 4.0 x16' },
    },
    {
      id: 'gpu-4',
      name: 'Msi Geforce Rtx 4090 Gaming Trio 24gb',
      description: '24GB GDDR6X — Mais poderosa do mercado. TDP 450W.',
      price: 12999.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_808497-MLB92392113183_092025-F.webp',
      category: 'Placas de Vídeo',
      specs: { vram: '24GB GDDR6X', tdp: '450W', interface: 'PCIe 4.0 x16' },
    },
  ],
  'Placas Mãe': [
    {
      id: 'mb-1',
      name: 'ASUS Prime B650M-A',
      description: 'Socket AM5 — DDR5, PCIe 4.0, Micro-ATX. Ideal pra Ryzen 7000.',
      price: 999.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_791454-MLA100053801825_122025-F.webp',
      category: 'Placas Mãe',
      specs: { socket: 'AM5', formato: 'Micro-ATX', ram: 'DDR5', slots: '2' },
    },
    {
      id: 'mb-2',
      name: 'MSI MAG B760M Mortar',
      description: 'Socket LGA1700 — DDR5, PCIe 5.0, Micro-ATX. Para Intel 12ª/13ª/14ª gen.',
      price: 1149.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_691905-CBT104142333777_012026-F.webp',
      category: 'Placas Mãe',
      specs: { socket: 'LGA1700', formato: 'Micro-ATX', ram: 'DDR5', slots: '4' },
    },
    {
      id: 'mb-3',
      name: 'Placa Mãe Gigabyte X670e Aorus Xtreme Wifi',
      description: 'Socket AM5 — DDR5, PCIe 5.0, ATX. Para entusiastas Ryzen.',
      price: 3299.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_941994-MLU74688986193_022024-F.webp',
      category: 'Placas Mãe',
      specs: { socket: 'AM5', formato: 'ATX', ram: 'DDR5', slots: '4' },
    },
  ],
  'Memória RAM': [
    {
      id: 'ram-1',
      name: 'Kingston Fury Beast 16GB DDR5',
      description: '16GB (2x8GB) DDR5-5200MHz CL40. Compatível com Intel e AMD AM5.',
      price: 549.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_642864-MLA108205172029_032026-F.webp',
      category: 'Memória RAM',
      specs: { capacidade: '16GB', tipo: 'DDR5', frequencia: '5200MHz', cl: 'CL40' },
    },
    {
      id: 'ram-2',
      name: 'Corsair Vengeance 32GB DDR5',
      description: '32GB (2x16GB) DDR5-6000MHz CL36. Alto desempenho com XMP.',
      price: 1099.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_980995-MLA99993582355_112025-F.webp',
      category: 'Memória RAM',
      specs: { capacidade: '32GB', tipo: 'DDR5', frequencia: '6000MHz', cl: 'CL36' },
    },
    {
      id: 'ram-3',
      name: 'G.Skill Trident Z5 64GB DDR5',
      description: '64GB (2x32GB) DDR5-6400MHz CL32. Para workstations e edição.',
      price: 2299.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_925510-MLA100030051893_122025-F.webp',
      category: 'Memória RAM',
      specs: { capacidade: '64GB', tipo: 'DDR5', frequencia: '6400MHz', cl: 'CL32' },
    },
  ],
  Fontes: [
    {
      id: 'psu-1',
      name: 'Corsair CV550 550W',
      description: '550W 80 Plus Bronze. Ideal para builds low-end e mid sem GPU pesada.',
      price: 379.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_666621-MLB109912395624_042026-F.webp',
      category: 'Fontes',
      specs: { potencia: '550W', certificacao: '80 Plus Bronze', modular: 'Não' },
    },
    {
      id: 'psu-2',
      name: 'Seasonic Focus GX-750 750W',
      description: '750W 80 Plus Gold Full Modular. Recomendado para RTX 4070 e similares.',
      price: 799.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_689732-CBT110380297511_042026-F-fonte-de-alimentaco-seasonic-focus-v4-gx-750-750w-80-gold.webp',
      category: 'Fontes',
      specs: { potencia: '750W', certificacao: '80 Plus Gold', modular: 'Full' },
    },
    {
      id: 'psu-3',
      name: 'be quiet! Dark Power 1000W',
      description: '1000W 80 Plus Titanium Full Modular. Para RTX 4090 e builds extremas.',
      price: 1799.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_958450-CBT109517584812_042026-F.webp',
      category: 'Fontes',
      specs: { potencia: '1000W', certificacao: '80 Plus Titanium', modular: 'Full' },
    },
  ],
  Armazenamento: [
    {
      id: 'ssd-1',
      name: 'Kingston NV2 500GB NVMe',
      description: 'M.2 PCIe 4.0 — Leitura 3500MB/s. Ótimo custo-benefício.',
      price: 269.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_844368-MLB95836712141_102025-F.webp',
      category: 'Armazenamento',
      specs: { capacidade: '500GB', interface: 'M.2 PCIe 4.0', leitura: '3500MB/s' },
    },
    {
      id: 'ssd-2',
      name: 'Samsung 990 Pro 1TB NVMe',
      description: 'M.2 PCIe 4.0 — Leitura 7450MB/s. Top de linha para games e trabalho.',
      price: 699.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_703113-MLU70496467226_072023-F.webp',
      category: 'Armazenamento',
      specs: { capacidade: '1TB', interface: 'M.2 PCIe 4.0', leitura: '7450MB/s' },
    },
    {
      id: 'ssd-3',
      name: 'Seagate Barracuda 2TB HDD',
      description: 'SATA 3 — 7200RPM. Para armazenamento em massa com bom custo.',
      price: 349.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_2X_679596-MLA91972285447_092025-F.webp',
      category: 'Armazenamento',
      specs: { capacidade: '2TB', interface: 'SATA 3', rpm: '7200RPM' },
    },
  ],
};

// ── Componente ──────────────────────────────────────────────────────────────────
export function Category({ navigation, route }: Props) {
  const { categoryName } = route.params;
  const [search, setSearch] = useState('');

  const products = MOCK_PRODUCTS[categoryName] ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [search, products]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ItemDetail', { product: item })}
    >
      <View style={styles.cardImage}>
          {/* Validação: Só mostra a imagem se houver um link válido (sem ser placeholder) */}
          {item.image && item.image.length > 5 && !item.image.includes('placeholder') ? (
            <Image 
              source={{ uri: item.image }} 
              style={{ width: '100%', height: '100%', padding: 10 }} 
              resizeMode="contain" 
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="image-outline" size={40} color="#333" />
            </View>
          )}
        </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.cardArrow}>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#00d4ff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <MaterialCommunityIcons name="magnify" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {/* Contagem */}
      <Text style={styles.countText}>
        {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'} encontrado{filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* Lista */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="magnify-close" size={48} color="#333" />
          <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#354cb3' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  // Search
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e1e', borderRadius: 12, marginHorizontal: 20,
    paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 46, color: '#fff', fontSize: 15 },

  // Count
  countText: { color: '#ffffff', fontSize: 13, paddingHorizontal: 24, marginBottom: 10 },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 32 },

  // Card
  card: {
    flexDirection: 'row', backgroundColor: '#1a1a1a',
    borderRadius: 16, marginBottom: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  cardImage: {
    width: 110, height: 110,
    backgroundColor: '#111',
  },
  cardBody: {
    flex: 1, padding: 14, justifyContent: 'space-between',
  },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#888', lineHeight: 18, flex: 1 },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 8,
  },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#00d4ff' },
  cardArrow: {
    backgroundColor: '#00d4ff22', borderRadius: 8,
    padding: 4,
  },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#555', fontSize: 16 },
});