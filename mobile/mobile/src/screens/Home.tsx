import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  FlatList, StatusBar, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
 
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
 
interface Props {
  navigation: HomeScreenNavigationProp;
}
 
interface Category {
  id: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}
 
const CATEGORIES: Category[] = [
  { id: '1', title: 'Processadores',  icon: 'cpu-64-bit',     color: '#00d4ff' },
  { id: '2', title: 'Placas de Vídeo', icon: 'expansion-card', color: '#00d4ff' },
  { id: '3', title: 'Placas Mãe',     icon: 'chip',           color: '#00d4ff' },
  { id: '4', title: 'Memória RAM',    icon: 'memory',         color: '#00d4ff' },
  { id: '5', title: 'Fontes',         icon: 'power-plug',     color: '#00d4ff' },
  { id: '6', title: 'Armazenamento',  icon: 'harddisk',       color: '#00d4ff' },
];
 
export function Home({ navigation }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
 
  // Consulta rápida por categoria (mantida para os cards)
  const consultarCategoria = async (categoria: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:3000/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoria,
          query: 'Recomendação custo-benefício atual.',
        }),
      });
 
      const data = await response.json();
      if (data?.answer) {
        Alert.alert(`Sugestão: ${categoria}`, data.answer);
      }
    } catch {
      Alert.alert('Erro', 'Certifique-se que o server.js está rodando.');
    } finally {
      setLoading(false);
    }
  };
 
  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.7}
      onPress={() => consultarCategoria(item.title)}
    >
      <MaterialCommunityIcons name={item.icon} size={40} color={item.color} />
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
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#ff4444" />
        </TouchableOpacity>
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
 
      {/* Botão principal — navega para o fluxo guiado */}
      <View style={styles.aiButtonContainer}>
        <TouchableOpacity
          style={[styles.aiButton, { opacity: loading ? 0.5 : 1 }]}
          activeOpacity={0.8}
          disabled={loading}
          onPress={() => navigation.navigate('AIAssistant')}
        >
          <MaterialCommunityIcons name="robot" size={24} color="#000" />
          <Text style={styles.aiButtonText}>
            {loading ? 'Pensando...' : 'Montar PC com IA'}
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
  logoutButton: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 12 },
  listContent: { paddingHorizontal: 20 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  categoryCard: {
    backgroundColor: '#1e1e1e', width: '48%', aspectRatio: 1,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#333',
  },
  categoryTitle: { color: '#fff', marginTop: 12, fontSize: 14, fontWeight: 'bold' },
  aiButtonContainer: { padding: 24 },
  aiButton: {
    backgroundColor: '#00d4ff', flexDirection: 'row', height: 56,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  aiButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
});