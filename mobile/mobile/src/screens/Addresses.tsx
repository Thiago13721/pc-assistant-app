import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList,
  TextInput, StatusBar, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore, Address } from '../store/useStore';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Addresses'> };

interface AddressForm {
  label: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const EMPTY_FORM: AddressForm = {
  label: '', cep: '', street: '', number: '',
  complement: '', neighborhood: '', city: '', state: '',
};

export function Addresses({ navigation }: Props) {
  const addresses = useStore(state => state.addresses);
  const selectedAddressId = useStore(state => state.selectedAddressId);
  const addAddress = useStore(state => state.addAddress);
  const removeAddress = useStore(state => state.removeAddress);
  const selectAddress = useStore(state => state.selectAddress);

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [cepLoading, setCepLoading] = useState(false);

  const updateForm = (field: keyof AddressForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const fetchCEP = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();

      if (data.erro) {
        Alert.alert('CEP inválido', 'Não encontramos esse CEP. Verifique e tente novamente.');
        return;
      }

      setForm(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));
    } catch {
      Alert.alert('Erro', 'Não foi possível buscar o CEP. Verifique sua conexão.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleCEPChange = (value: string) => {
    updateForm('cep', value);
    if (value.replace(/\D/g, '').length === 8) {
      fetchCEP(value);
    }
  };

  const handleSave = () => {
    if (!form.label.trim()) return Alert.alert('Atenção', 'Informe um nome para o endereço (ex: Casa, Trabalho).');
    if (form.cep.replace(/\D/g, '').length !== 8) return Alert.alert('Atenção', 'CEP inválido.');
    if (!form.street.trim()) return Alert.alert('Atenção', 'Informe a rua.');
    if (!form.number.trim()) return Alert.alert('Atenção', 'Informe o número.');

    addAddress({
      label: form.label.trim(),
      cep: form.cep.replace(/\D/g, ''),
      street: form.street.trim(),
      number: form.number.trim(),
      complement: form.complement.trim() || undefined,
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
    });

    setForm(EMPTY_FORM);
    setModalVisible(false);
  };

  const handleRemove = (address: Address) => {
    Alert.alert(
      'Remover endereço',
      `Deseja remover "${address.label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeAddress(address.id) },
      ]
    );
  };

  const formatCEP = (cep: string) => {
    const c = cep.replace(/\D/g, '');
    return c.length > 5 ? `${c.slice(0, 5)}-${c.slice(5, 8)}` : c;
  };

  const getAddressIcon = (label: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const l = label.toLowerCase();
    if (l.includes('casa') || l.includes('home')) return 'home-outline';
    if (l.includes('trabalho') || l.includes('empresa') || l.includes('escritório')) return 'briefcase-outline';
    return 'map-marker-outline';
  };

  const renderAddress = ({ item }: { item: Address }) => {
    const isSelected = item.id === selectedAddressId;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        activeOpacity={0.8}
        onPress={() => selectAddress(item.id)}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.cardIconBox, isSelected && styles.cardIconBoxSelected]}>
            <MaterialCommunityIcons
              name={getAddressIcon(item.label)}
              size={20}
              color={isSelected ? '#00d4ff' : '#a1a1aa'}
            />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{item.label}</Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selecionado</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardText}>{item.street}, {item.number}{item.complement ? ` - ${item.complement}` : ''}</Text>
            <Text style={styles.cardText}>{item.neighborhood} - {item.city}, {item.state}</Text>
            <Text style={styles.cardCEP}>CEP: {formatCEP(item.cep)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const openModal = () => { setForm(EMPTY_FORM); setModalVisible(true); };
  const closeModal = () => { setModalVisible(false); setForm(EMPTY_FORM); };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Endereços de Entrega</Text>
        <TouchableOpacity onPress={openModal} style={styles.addBtnHeader}>
          <MaterialCommunityIcons name="plus" size={24} color="#00d4ff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={64} color="#333" />
            <Text style={styles.emptyTitle}>Nenhum endereço</Text>
            <Text style={styles.emptySubtitle}>Adicione um endereço de entrega.</Text>
          </View>
        }
      />

      {/* Footer fixo com botão de adicionar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addBtn} onPress={openModal} activeOpacity={0.8}>
          <MaterialCommunityIcons name="plus" size={20} color="#000" />
          <Text style={styles.addBtnText}>Adicionar Novo Endereço</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de adicionar endereço */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Endereço</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <Text style={styles.inputLabel}>Nome do endereço *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Casa, Trabalho..."
                placeholderTextColor="#555"
                value={form.label}
                onChangeText={(v) => updateForm('label', v)}
              />

              <Text style={styles.inputLabel}>CEP *</Text>
              <View style={styles.cepRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="00000-000"
                  placeholderTextColor="#555"
                  keyboardType="numeric"
                  maxLength={9}
                  value={form.cep}
                  onChangeText={handleCEPChange}
                />
                {cepLoading && <ActivityIndicator color="#00d4ff" style={{ marginLeft: 12 }} />}
              </View>

              <Text style={styles.inputLabel}>Rua *</Text>
              <TextInput
                style={styles.input}
                placeholder="Preenchido automaticamente"
                placeholderTextColor="#555"
                value={form.street}
                onChangeText={(v) => updateForm('street', v)}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Número *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={form.number}
                    onChangeText={(v) => updateForm('number', v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Apto, Bloco..."
                    placeholderTextColor="#555"
                    value={form.complement}
                    onChangeText={(v) => updateForm('complement', v)}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Bairro</Text>
              <TextInput
                style={styles.input}
                placeholder="Preenchido automaticamente"
                placeholderTextColor="#555"
                value={form.neighborhood}
                onChangeText={(v) => updateForm('neighborhood', v)}
              />

              <View style={styles.row}>
                <View style={{ flex: 2, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Cidade</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Preenchido automaticamente"
                    placeholderTextColor="#555"
                    value={form.city}
                    onChangeText={(v) => updateForm('city', v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>UF</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="SP"
                    placeholderTextColor="#555"
                    maxLength={2}
                    autoCapitalize="characters"
                    value={form.state}
                    onChangeText={(v) => updateForm('state', v)}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Salvar Endereço</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  addBtnHeader: { padding: 8, backgroundColor: '#00d4ff22', borderRadius: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 12,
  },
  cardSelected: { borderColor: '#00d4ff', backgroundColor: '#00d4ff0a' },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a',
  },
  cardIconBoxSelected: { borderColor: '#00d4ff', backgroundColor: '#00d4ff11' },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardLabel: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cardLabelSelected: { color: '#00d4ff' },
  selectedBadge: { backgroundColor: '#00d4ff22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  selectedBadgeText: { color: '#00d4ff', fontSize: 11, fontWeight: 'bold' },
  cardText: { color: '#a1a1aa', fontSize: 13, marginBottom: 2 },
  cardCEP: { color: '#555', fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 8, backgroundColor: '#ff444422', borderRadius: 8 },

  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  emptySubtitle: { color: '#a1a1aa', fontSize: 14 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#171717', borderTopWidth: 1, borderTopColor: '#2a2a2a',
    padding: 20,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#00d4ff', height: 52, borderRadius: 14, gap: 8,
  },
  addBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#000000aa' },
  modalContainer: {
    backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '92%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  closeBtn: { padding: 6, backgroundColor: '#2a2a2a', borderRadius: 10 },
  formScroll: { paddingBottom: 32 },

  inputLabel: { color: '#a1a1aa', fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#111', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15, marginBottom: 0,
  },
  cepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
  row: { flexDirection: 'row' },

  saveBtn: {
    backgroundColor: '#00d4ff', borderRadius: 14, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});