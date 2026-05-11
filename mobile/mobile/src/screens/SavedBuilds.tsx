import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, SavedBuild } from '../store/useStore';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'SavedBuilds'> };

export function SavedBuilds({ navigation }: Props) {
  const savedBuilds = useStore(state => state.savedBuilds);
  const removeSavedBuild = useStore(state => state.removeSavedBuild);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

  const handleRemove = (build: SavedBuild) => {
    Alert.alert(
      'Remover Build',
      `Deseja remover "${build.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeSavedBuild(build.id) },
      ]
    );
  };

  const renderBuild = ({ item }: { item: SavedBuild }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <MaterialCommunityIcons name="desktop-tower" size={20} color="#00d4ff" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item)}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="package-variant" size={14} color="#555" />
          <Text style={styles.statText}>{item.itemCount} peça{item.itemCount !== 1 ? 's' : ''}</Text>
        </View>
        <Text style={styles.cardTotal}>{formatCurrency(item.total)}</Text>
      </View>

      <View style={styles.cardParts}>
        {Object.values(item.items).filter(Boolean).map((product) => (
          <View key={product!.id} style={styles.partTag}>
            <Text style={styles.partTagText} numberOfLines={1}>{product!.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Builds</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={savedBuilds}
        keyExtractor={(item) => item.id}
        renderItem={renderBuild}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="desktop-tower-monitor" size={64} color="#333" />
            <Text style={styles.emptyTitle}>Nenhum build salvo</Text>
            <Text style={styles.emptySubtitle}>Monte um PC e salve para ver aqui.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('PCBuild')}
            >
              <Text style={styles.emptyBtnText}>Montar PC</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    backgroundColor: '#1a1a1a', borderRadius: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 16, padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardIconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#00d4ff11',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00d4ff33',
  },
  cardInfo: { flex: 1 },
  cardName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  cardDate: { color: '#555', fontSize: 12 },
  removeBtn: { padding: 8, backgroundColor: '#ff444422', borderRadius: 8 },

  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: '#a1a1aa', fontSize: 13 },
  cardTotal: { color: '#00d4ff', fontSize: 18, fontWeight: 'bold' },

  cardParts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  partTag: {
    backgroundColor: '#111', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#2a2a2a', maxWidth: '48%',
  },
  partTagText: { color: '#a1a1aa', fontSize: 11 },

  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  emptySubtitle: { color: '#a1a1aa', fontSize: 14 },
  emptyBtn: { backgroundColor: '#00d4ff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});