import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore';
import Toast from 'react-native-root-toast';

type PCBuildNavigationProp = StackNavigationProp<RootStackParamList, 'PCBuild'>;

interface Props {
  navigation: PCBuildNavigationProp;
}

interface BuildSlot {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  category: string;
  required: boolean;
}

const BUILD_SLOTS: BuildSlot[] = [
  { key: 'cpu',     label: 'Processador',    icon: 'cpu-64-bit',     category: 'Processadores',   required: true  },
  { key: 'mb',      label: 'Placa Mãe',      icon: 'chip',           category: 'Placas Mãe',      required: true  },
  { key: 'ram',     label: 'Memória RAM',    icon: 'memory',         category: 'Memória RAM',     required: true  },
  { key: 'gpu',     label: 'Placa de Vídeo', icon: 'expansion-card', category: 'Placas de Vídeo', required: false },
  { key: 'storage', label: 'Armazenamento',  icon: 'harddisk',       category: 'Armazenamento',   required: true  },
  { key: 'psu',     label: 'Fonte',          icon: 'power-plug',     category: 'Fontes',          required: true  },
  { key: 'case',    label: 'Gabinete',       icon: 'desktop-tower',  category: 'Gabinetes',       required: false },
  { key: 'cooler',  label: 'Cooler',         icon: 'fan',            category: 'Coolers',         required: false },
];

export function PCBuild({ navigation }: Props) {
  const pcBuild = useStore(state => state.pcBuild);
  const removeBuildItem = useStore(state => state.removeBuildItem);
  const addToCart = useStore(state => state.addToCart);
  const saveBuild = useStore(state => state.saveBuild);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [missingItemsText, setMissingItemsText] = useState('');

  const items = Object.values(pcBuild).filter(Boolean);
  const totalPrice = items.reduce((sum, p) => sum + (p?.price || 0), 0);

  const requiredSlots = BUILD_SLOTS.filter(s => s.required);
  const filledRequired = requiredSlots.filter(s => pcBuild[s.category]);
  const isComplete = filledRequired.length === requiredSlots.length;
  const progress = filledRequired.length / requiredSlots.length;

  const removeSlot = (categoryKey: string, itemName: string) => {
    Alert.alert(
      'Remover peça',
      `Deseja remover ${itemName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeBuildItem(categoryKey);
            setAiResult('');
          },
        },
      ]
    );
  };

  const analyzeWithAI = async () => {
    if (items.length === 0) {
      Toast.show('Adicione pelo menos uma peça antes de analisar.', { 
        position: Toast.positions.TOP + 40, 
        backgroundColor: '#1a1a1a', 
        textColor: '#fff', 
        containerStyle: { borderLeftWidth: 4, borderLeftColor: '#ff4444', borderRadius: 8, paddingHorizontal: 20 } 
      });
      return;
    }
    setAiLoading(true);
    setAiResult('');

    const buildSummary = items
      .map(p => `${p?.category}: ${p?.name} (${JSON.stringify(p?.specs)})`)
      .join('\n');

    try {
      const response = await fetch('https://pc-assistant-app-2.onrender.com/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Montagem PC',
          query: `Analise este build de PC:\n${buildSummary}\n\nVerifique: 1) Compatibilidade entre todas as peças 2) Possíveis gargalos 3) O que ainda falta para um PC completo 4) Avalie o custo-benefício geral. Seja direto e técnico.`,
        }),
      });

      const data = await response.json();
      const cleanAnswer = (data?.answer ?? 'Não foi possível obter análise.')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/`/g, '');
      setAiResult(cleanAnswer);
    } catch {
      setAiResult('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setAiLoading(false);
    }
  };

  const goToCart = () => {
    Object.values(pcBuild).forEach(product => {
      if (product) addToCart(product);
    });
    setConfirmModalVisible(false); // Fecha o modal caso esteja aberto
    navigation.navigate('Cart');
  };

  const handleFinalize = () => {
    if (!isComplete) {
      const missing = requiredSlots
        .filter(s => !pcBuild[s.category])
        .map(s => s.label)
        .join(', ');
      
      // Salva o texto das peças faltando e abre o nosso Modal Customizado
      setMissingItemsText(missing);
      setConfirmModalVisible(true);
    } else {
      goToCart();
    }
  };

  const handleSaveBuild = () => {
    if (items.length === 0) {
      Toast.show('Adicione pelo menos uma peça para salvar o build.', { 
        position: Toast.positions.TOP + 40, backgroundColor: '#1a1a1a', textColor: '#fff', containerStyle: { borderLeftWidth: 4, borderLeftColor: '#f59e0b', borderRadius: 8, paddingHorizontal: 20 } 
      });
      return;
    }
    setBuildName(`Build ${new Date().toLocaleDateString('pt-BR')}`);
    setSaveModalVisible(true);
  };

  const confirmSaveBuild = () => {
    if (!buildName.trim()) {
      Toast.show('Informe um nome para o build.', { 
        position: Toast.positions.TOP + 40, backgroundColor: '#1a1a1a', textColor: '#fff', containerStyle: { borderLeftWidth: 4, borderLeftColor: '#ff4444', borderRadius: 8, paddingHorizontal: 20 } 
      });
      return;
    }
  const name = buildName.trim();
    saveBuild(name, pcBuild);
    setSaveModalVisible(false);
    setBuildName('');
    Toast.show(`🖥️ "${name}" salvo no seu perfil!`, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.TOP,
      animation: true,
      backgroundColor: '#1a1a1a',
      textColor: '#4ade80',
      opacity: 1,
      containerStyle: {
        borderWidth: 1,
        borderColor: '#4ade80',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginTop: 50,
      },
    });
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
        <Text style={styles.headerTitle}>Montagem do PC</Text>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveBuild}
          disabled={items.length === 0}
        >
          <MaterialCommunityIcons
            name="content-save-outline"
            size={22}
            color={items.length === 0 ? '#333' : '#00d4ff'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {filledRequired.length}/{requiredSlots.length} peças obrigatórias
            </Text>
            {isComplete && (
              <View style={styles.completeBadge}>
                <MaterialCommunityIcons name="check-circle" size={14} color="#4ade80" />
                <Text style={styles.completeText}>Completo</Text>
              </View>
            )}
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peças do Build</Text>
          {BUILD_SLOTS.map((slot) => {
            const product = pcBuild[slot.category];
            const filled = !!product;

            return (
              <View
                key={slot.key}
                style={[
                  styles.slotCard,
                  filled && styles.slotCardFilled,
                  !filled && !slot.required && styles.slotCardOptional,
                ]}
              >
                <View style={[styles.slotIconBox, filled && styles.slotIconBoxFilled]}>
                  <MaterialCommunityIcons
                    name={slot.icon}
                    size={22}
                    color={filled ? '#4ade80' : slot.required ? '#00d4ff' : '#555'}
                  />
                </View>

                <View style={styles.slotBody}>
                  <View style={styles.slotLabelRow}>
                    <Text style={styles.slotLabel}>{slot.label}</Text>
                    {!slot.required && (
                      <Text style={styles.optionalTag}>opcional</Text>
                    )}
                  </View>
                  {filled ? (
                    <Text style={styles.slotProductName} numberOfLines={1}>
                      {product.name}
                    </Text>
                  ) : (
                    <Text style={styles.slotEmpty}>Nenhuma peça selecionada</Text>
                  )}
                  {filled && (
                    <Text style={styles.slotPrice}>
                      R$ {formatPrice(product.price)}
                    </Text>
                  )}
                </View>

                <View style={styles.slotActions}>
                  {filled ? (
                    <>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#4ade80" />
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeSlot(slot.category, product.name)}
                      >
                        <MaterialCommunityIcons name="close" size={16} color="#ff4444" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.addSlotBtn}
                      onPress={() => navigation.navigate('Category', { categoryName: slot.category })}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Análise da IA</Text>
          {aiResult === '' && !aiLoading ? (
            <TouchableOpacity
              style={styles.aiTriggerBtn}
              onPress={analyzeWithAI}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="robot" size={20} color="#000" />
              <Text style={styles.aiTriggerText}>Verificar compatibilidade</Text>
            </TouchableOpacity>
          ) : aiLoading ? (
            <View style={styles.aiLoadingBox}>
              <ActivityIndicator size="small" color="#00d4ff" />
              <Text style={styles.aiLoadingText}>Analisando seu build...</Text>
            </View>
          ) : (
            <View style={styles.aiResultBox}>
              <View style={styles.aiResultHeader}>
                <MaterialCommunityIcons name="robot" size={18} color="#00d4ff" />
                <Text style={styles.aiResultLabel}>Análise completa</Text>
                <TouchableOpacity onPress={() => setAiResult('')}>
                  <MaterialCommunityIcons name="refresh" size={16} color="#555" />
                </TouchableOpacity>
              </View>
              <Text style={styles.aiResultText}>{aiResult}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total estimado</Text>
          <Text style={styles.footerTotalValue}>R$ {formatPrice(totalPrice)}</Text>
          <Text style={styles.footerPieceCount}>
            {items.length} peça{items.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.finalizeBtn, !isComplete && styles.finalizeBtnIncomplete]}
          onPress={handleFinalize}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isComplete ? 'cart-check' : 'cart-arrow-right'}
            size={22}
            color="#000000"
          />
          <Text style={styles.finalizeBtnText}>
            {isComplete ? 'Ir para o carrinho' : 'Finalizar assim'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={saveModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Salvar Build</Text>
            <Text style={styles.modalSubtitle}>Dê um nome para esta montagem</Text>

            <TextInput
              style={styles.modalInput}
              value={buildName}
              onChangeText={setBuildName}
              placeholder="Ex: Gaming 4K, PC do trabalho..."
              placeholderTextColor="#555"
              autoFocus
              selectTextOnFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSaveModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={confirmSaveBuild}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#ac0707" style={{ alignSelf: 'center', marginBottom: 12 }} />
            
            <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Build Incompleto</Text>
            <Text style={[styles.modalSubtitle, { textAlign: 'center', marginBottom: 8 }]}>Ainda faltam peças obrigatórias:</Text>
            
            <Text style={{ color: '#d41818', fontWeight: 'bold', fontSize: 15, marginBottom: 24, textAlign: 'center' }}>
              {missingItemsText}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setConfirmModalVisible(false)} activeOpacity={0.8}>
                <Text style={styles.modalCancelText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: '#db9a0e' }]} onPress={goToCart} activeOpacity={0.8}>
                <Text style={[styles.modalSaveText, { color: '#1d1b1b' }]}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  saveBtn: { padding: 8, backgroundColor: '#221f1f', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  scroll: { paddingBottom: 16 },
  progressSection: { paddingHorizontal: 20, marginBottom: 24 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: '#ffffff', fontSize: 13 },
  completeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completeText: { color: '#4ade80', fontSize: 13, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#1e1e1e', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#4ade80', borderRadius: 3 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 14 },
  slotCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a',
  },
  slotCardFilled: { borderColor: '#4ade8033' },
  slotCardOptional: { opacity: 0.6 },
  slotIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  slotIconBoxFilled: { backgroundColor: '#4ade8011', borderColor: '#4ade8033' },
  slotBody: { flex: 1 },
  slotLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  slotLabel: { fontSize: 13, color: '#c1c1ce', fontWeight: '600' },
  optionalTag: {
    fontSize: 10, color: '#dbdbdb', backgroundColor: '#2a2a2a',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  slotProductName: { fontSize: 14, color: '#fff', fontWeight: 'bold', marginBottom: 2 },
  slotEmpty: { fontSize: 13, color: '#e4dddd', fontStyle: 'italic' },
  slotPrice: { fontSize: 13, color: '#00d4ff', fontWeight: '600' },
  slotActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeBtn: { padding: 4, backgroundColor: '#ff444422', borderRadius: 6 },
  addSlotBtn: {
    backgroundColor: '#00d4ff', width: 32, height: 32,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  aiTriggerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#00d4ff', height: 50, borderRadius: 14,
  },
  aiTriggerText: { color: '#000000', fontWeight: 'bold', fontSize: 15 },
  aiLoadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16,
  },
  aiLoadingText: { color: '#fafafd', fontSize: 14 },
  aiResultBox: {
    backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#00d4ff33',
  },
  aiResultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  aiResultLabel: { flex: 1, color: '#00d4ff', fontWeight: 'bold', fontSize: 14 },
  aiResultText: { color: '#e4e4e7', fontSize: 14, lineHeight: 22 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0b5166', borderTopWidth: 1, borderTopColor: '#2a2a2a',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28, gap: 16,
  },
  footerTotal: { flex: 1 },
  footerTotalLabel: { fontSize: 11, color: '#f3e8e8', marginBottom: 2 },
  footerTotalValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  footerPieceCount: { fontSize: 11, color: '#dfdfe7' },
  finalizeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#00d4ff', paddingHorizontal: 20,
    height: 52, borderRadius: 14,
  },
  finalizeBtnIncomplete: { backgroundColor: '#f59e0b' },
  finalizeBtnText: { color: '#000000', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: {
    flex: 1, backgroundColor: '#000000aa',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#1a1a1a', borderRadius: 20,
    padding: 24, width: '100%',
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#eaeaf3', marginBottom: 20 },
  modalInput: {
    backgroundColor: '#111111', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15, marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  modalCancelText: { color: '#9e9ea3', fontWeight: 'bold' },
  modalSaveBtn: {
    flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#00d4ff',
  },
  modalSaveText: { color: '#000000', fontWeight: 'bold' },
});