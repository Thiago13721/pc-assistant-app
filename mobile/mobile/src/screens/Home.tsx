import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore'; // <-- Zustand

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface CategoryItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const CATEGORIES: CategoryItem[] = [
  { id: '1', title: 'Processadores',   icon: 'cpu-64-bit'     },
  { id: '2', title: 'Placas de Vídeo', icon: 'expansion-card' },
  { id: '3', title: 'Placas Mãe',      icon: 'chip'           },
  { id: '4', title: 'Memória RAM',     icon: 'memory'         },
  { id: '5', title: 'Fontes',          icon: 'power-plug'     },
  { id: '6', title: 'Armazenamento',   icon: 'harddisk'       },
];

export function Home({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Lendo do Zustand
  const cart = useStore(state => state.cart);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Category', { categoryName: item.title })}
    >
      <MaterialCommunityIcons name={item.icon} size={40} color="#00d4ff" />
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Olá, Thiago</Text>
          <Text style={styles.subtitle}>O que vamos montar hoje?</Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <MaterialCommunityIcons name="cart-outline" size={24} color="#fff" />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00d4ff" />
          <Text style={styles.loadingText}>A IA está pensando...</Text>
        </View>
      ) : (
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.buildButton, { opacity: loading ? 0.5 : 1 }]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={() => navigation.navigate('PCBuild')}
        >
          <MaterialCommunityIcons name="desktop-tower" size={22} color="#000" />
          <Text style={styles.buildButtonText}>Montar PC</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aiButton, { opacity: loading ? 0.5 : 1 }]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={() => navigation.navigate('AIAssistant')}
        >
          <MaterialCommunityIcons name="robot" size={22} color="#000" />
          <Text style={styles.aiButtonText}>
            {loading ? 'Pensando...' : 'IA'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20,
  },
  welcome: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a1a1aa' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 12, position: 'relative' },
  badge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: '#00d4ff', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  categoryCard: {
    backgroundColor: '#1e1e1e', width: '48%', aspectRatio: 1,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#333',
  },
  categoryTitle: { color: '#fff', marginTop: 12, fontSize: 14, fontWeight: 'bold' },
  buttonContainer: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  buildButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#f59e0b', height: 56, borderRadius: 16,
  },
  buildButtonText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
  aiButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#00d4ff', height: 56, borderRadius: 16,
  },
  aiButtonText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
});