import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileNavigationProp;
}

export function Profile({ navigation }: Props) {
  // ACESSA O USUÁRIO E A FUNÇÃO DE LOGOUT NA STORE
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const savedBuilds = useStore(state => state.savedBuilds);
  const buildsCount = savedBuilds.length;
  // Stats dinâmicos (serão alimentados pela API futuramente)
  const ordersCount = useStore(state => state.orders.length);
  const savedBuildsCount = useStore(state => state.savedBuilds.length);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            // LIMPA O USUÁRIO NA STORE E VOLTA PRO LOGIN
            logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        },
      ]
    );
  };

  const renderOption = (
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    title: string,
    subtitle?: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity style={styles.optionBtn} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.optionIconBox}>
        <MaterialCommunityIcons name={icon} size={20} color="#00d4ff" />
      </View>
      <View style={styles.optionBody}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#333" />
    </TouchableOpacity>
  );

  // Gera um avatar automático baseado no nome do usuário
  const avatarUrl = `https://ui-avatars.com/api/?name=${user?.name || 'V'}&background=1e1e1e&color=00d4ff&size=128`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.name}>{user?.name || 'Visitante'}</Text>
          <Text style={styles.email}>{user?.email || 'Entre para ver seus dados'}</Text>
          
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{ordersCount}</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </View>
          
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{buildsCount}</Text>
            <Text style={styles.statLabel}>Builds</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>
          <View style={styles.optionsGroup}>
            {renderOption('history', 'Meus Pedidos', 'Ver histórico de compras', () => navigation.navigate('Orders'))}
            <View style={styles.divider} />
            {renderOption('map-marker-outline', 'Endereços', 'Gerenciar entrega', () => navigation.navigate('Addresses'))}
            <View style={styles.divider} />
            {renderOption('shield-check-outline', 'Segurança', 'Senha e autenticação', () => navigation.navigate('Security'))}
            {renderOption('desktop-tower', 'Meus Builds', 'Montagens salvas', () => navigation.navigate('SavedBuilds'))}
            <View style={styles.divider} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <View style={styles.optionsGroup}>
            {renderOption('bell-outline', 'Notificações', 'Alertas de preços e pedidos')}
            <View style={styles.divider} />
            {renderOption('help-circle-outline', 'Suporte', 'Central de ajuda', () => navigation.navigate('Support'))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versão 1.0.0 Alpha</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  
  profileCard: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#00d4ff', marginBottom: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#a1a1aa', marginBottom: 16 },
  editBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#1e1e1e', borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  editBtnText: { color: '#00d4ff', fontWeight: 'bold', fontSize: 14 },

  statsContainer: { flexDirection: 'row', backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 20, paddingVertical: 20, marginBottom: 30, borderWidth: 1, borderColor: '#2a2a2a' },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#00d4ff', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#a1a1aa' },
  statDivider: { width: 1, backgroundColor: '#2a2a2a' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 12, textTransform: 'uppercase' },
  optionsGroup: { backgroundColor: '#1a1a1a', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden' },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  optionIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  optionBody: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  optionSubtitle: { fontSize: 12, color: '#a1a1aa', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2a2a2a', marginHorizontal: 16 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, marginTop: 10, padding: 16, backgroundColor: '#ff444415', borderRadius: 16, borderWidth: 1, borderColor: '#ff444433' },
  logoutText: { color: '#ff4444', fontWeight: 'bold', fontSize: 15 },
  version: { textAlign: 'center', color: '#333', fontSize: 12, marginVertical: 30 },
});