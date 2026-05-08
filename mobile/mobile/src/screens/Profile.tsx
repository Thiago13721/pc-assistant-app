import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileNavigationProp;
}

export function Profile({ navigation }: Props) {

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
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
      <MaterialCommunityIcons name="chevron-right" size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://ui-avatars.com/api/?name=Thiago&background=1e1e1e&color=00d4ff&size=128' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>Thiago</Text>
          <Text style={styles.userEmail}>thiago@email.com</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Pedidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Salvos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Builds</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>
          <View style={styles.optionsGroup}>
            {renderOption('format-list-bulleted', 'Meus Pedidos', 'Acompanhe suas compras', () => navigation.navigate('Orders'))}
            <View style={styles.divider} />
            {renderOption('map-marker-outline', 'Endereços de Entrega', 'Gerencie onde receber', () => navigation.navigate('Addresses'))}
            <View style={styles.divider} />
            {renderOption('heart-outline', 'Itens Salvos', 'Peças que você curtiu')}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <View style={styles.optionsGroup}>
            {renderOption('account-edit-outline', 'Dados Pessoais', undefined, () => navigation.navigate('EditProfile'))}
            <View style={styles.divider} />
            {renderOption('bell-outline', 'Notificações')}
            <View style={styles.divider} />
            {renderOption('shield-check-outline', 'Privacidade e Segurança', undefined, () => navigation.navigate('Security'))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>PC Assistant v1.0.0</Text>

      </ScrollView>
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
  scroll: { paddingBottom: 40 },

  profileHeader: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12, borderWidth: 2, borderColor: '#00d4ff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  userEmail: { fontSize: 14, color: '#a1a1aa' },

  statsContainer: {
    flexDirection: 'row', backgroundColor: '#1a1a1a', marginHorizontal: 20,
    borderRadius: 16, paddingVertical: 16, marginBottom: 32,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#00d4ff', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#a1a1aa' },
  statDivider: { width: 1, backgroundColor: '#2a2a2a' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 12, textTransform: 'uppercase' },
  optionsGroup: {
    backgroundColor: '#1a1a1a', borderRadius: 16,
    borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden'
  },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  optionIconBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a'
  },
  optionBody: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  optionSubtitle: { fontSize: 12, color: '#a1a1aa', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#2a2a2a', marginLeft: 66 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 10, backgroundColor: '#ff444411',
    paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#ff444433'
  },
  logoutText: { color: '#ff4444', fontSize: 15, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#444', fontSize: 12, marginTop: 32, marginBottom: 20 },
});