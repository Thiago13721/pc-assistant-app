import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore';

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
  // BUSCA O USUÁRIO DA STORE
  const user = useStore(state => state.user);
  const cart = useStore(state => state.cart);

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Category', { categoryName: item.title })}
    >
      <MaterialCommunityIcons name={item.icon} size={40} color="#4a128b" />
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá,</Text>
            {/* EXIBE O NOME DO USUÁRIO OU VISITANTE */}
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Visitante'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => navigation.navigate('Cart')}
            >
              <MaterialCommunityIcons name="cart-outline" size={24} color="#fff" />
              {cart.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cart.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => navigation.navigate('Profile')}
            >
              <MaterialCommunityIcons name="account-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>O que vamos montar hoje?</Text>
            <Text style={styles.heroSubtitle}>Escolha uma categoria para começar</Text>
          </View>
        )}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.buildButton}
          onPress={() => navigation.navigate('PCBuild')}
        >
          <MaterialCommunityIcons name="tools" size={20} color="#000" />
          <Text style={styles.buildButtonText}>Montar PC</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={() => navigation.navigate('AIAssistant')}
        >
          <MaterialCommunityIcons name="robot" size={20} color="#fff" />
          <Text style={styles.aiButtonText}>Assistente IA</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#a1a1aa', fontSize: 14 },
  userName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 12, position: 'relative' },
  badge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: '#00ccff', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  heroSection: { marginVertical: 20 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  heroSubtitle: { color: '#a1a1aa', fontSize: 14 },
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
    gap: 8, backgroundColor: '#cec111', height: 56, borderRadius: 16,
  },
  buildButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  aiButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1f1958', height: 56, borderRadius: 16,
    borderWidth: 1, borderColor: '#333',
  },
  aiButtonText: { color: '#f1f1f1', fontSize: 16, fontWeight: 'bold' },
});