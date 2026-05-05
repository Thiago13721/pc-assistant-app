import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { Product } from './Category';

type PCBuildNavigationProp = StackNavigationProp<RootStackParamList, 'PCBuild'>;

interface Props {
  navigation: PCBuildNavigationProp;
}

// Slots obrigatórios para um PC completo
interface BuildSlot {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  category: string; // qual categoria do app abre ao clicar
  required: boolean;
}

const BUILD_SLOTS: BuildSlot[] = [
  { key: 'cpu',      label: 'Processador',   icon: 'cpu-64-bit',     category: 'Processadores',   required: true  },
  { key: 'mb',       label: 'Placa Mãe',     icon: 'chip',           category: 'Placas Mãe',      required: true  },
  { key: 'ram',      label: 'Memória RAM',   icon: 'memory',         category: 'Memória RAM',     required: true  },
  { key: 'gpu',      label: 'Placa de Vídeo',icon: 'expansion-card', category: 'Placas de Vídeo', required: false },
  { key: 'storage',  label: 'Armazenamento', icon: 'harddisk',       category: 'Armazenamento',   required: true  },
  { key: 'psu',      label: 'Fonte',         icon: 'power-plug',     category: 'Fontes',          required: true  },
  { key: 'case',     label: 'Gabinete',      icon: 'desktop-tower',  category: 'Gabinetes',       required: false },
  { key: 'cooler',   label: 'Cooler',        icon: 'fan',            category: 'Coolers',         required: false },
];

// Simulação de peças já adicionadas via carrinho (futuramente virá do Zustand/Context)
const MOCK_SELECTED: Record<string, Product> = {
  cpu: {
    id: 'cpu-1',
    name: 'AMD Ryzen 5 7600X',
    description: '6 núcleos / 12 threads — Socket AM5.',
    price: 1349.90,
    image: '',
    category: 'Processadores',
    specs: { socket: 'AM5', nucleos: '6', tdp: '105W' },
  },
  mb: {
    id: 'mb-1',
    name: 'ASUS Prime B650M-A',
    description: 'Socket AM5 — DDR5, Micro-ATX.',
    price: 999.90,
    image: '',
    category: 'Placas Mãe',
    specs: { socket: 'AM5', formato: 'Micro-ATX', ram: 'DDR5' },
  },
  ram: {
    id: 'ram-1',
    name: 'Kingston Fury Beast 16GB DDR5',
    description: 'DDR5-5200MHz CL40.',
    price: 549.90,
    image: '',
    category: 'Memória RAM',
    specs: { capacidade: '16GB', tipo: 'DDR5' },
  },
  psu: {
    id: 'psu-2',
    name: 'Seasonic Focus GX-750 750W',
    description: '80 Plus Gold Full Modular.',
    price: 799.90,
    image: '',
    category: 'Fontes',
    specs: { potencia: '750W', certificacao: '80 Plus Gold' },
  },
};

export function PCBuild({ navigation }: Props) {
  const [selected, setSelected] = useState<Record<string, Product>>(MOCK_SELECTED);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const totalPrice = Object.values(selected).reduce((sum, p) => sum + p.price, 0);
  const requiredSlots = BUILD_SLOTS.filter(s => s.required);
  const filledRequired = requiredSlots.filter(s => selected[s.key]);
  const isComplete = filledRequired.length === requiredSlots.length;
  const progress = filledRequired.length / requiredSlots.length;

  const removeSlot = (key: string) => {
    Alert.alert(
      'Remover peça',
      `Deseja remover ${selected[key]?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const updated = { ...selected };
            delete updated[key];
            setSelected(updated);
            setAiResult('');
          },
        },
      ]
    );
  };

  const analyzeWithAI = async () => {
    if (Object.keys(selected).length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos uma peça antes de analisar.');
      return;
    }
    setAiLoading(true);
    setAiResult('');

    const buildSummary = Object.entries(selected)
      .map(([key, p]) => `${p.category}: ${p.name} (${JSON.stringify(p.specs)})`)
      .join('\n');

    try {
      const response = await fetch('http://10.0.2.2:3000/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Montagem PC',
          query: `Analise este build de PC:\n${buildSummary}\n\nVerifique: 1) Compatibilidade entre todas as peças 2) Possíveis gargalos 3) O que ainda falta para um PC completo 4) Avalie o custo-benefício geral. Seja direto e técnico.`,
        }),
      });
      const data = await response.json();
      setAiResult(data?.answer ?? 'Não foi possível obter análise.');
    } catch {
      setAiResult('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFinalize = () => {
    if (!isComplete) {
      const missing = requiredSlots
        .filter(s => !selected[s.key])
        .map(s => s.label)
        .join(', ');
      Alert.alert(
        'Build incompleto',
        `Ainda faltam peças obrigatórias:\n${missing}\n\nDeseja finalizar mesmo assim?`,
        [
          { text: 'Continuar montando', style: 'cancel' },
          { text: 'Finalizar assim', onPress: () => navigation.navigate('Cart') },
        ]
      );
    } else {
      navigation.navigate('Cart');
    }
  };

  const formatPrice = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Montagem do PC</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Barra de progresso */}
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

        {/* Checklist de slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peças do Build</Text>
          {BUILD_SLOTS.map((slot) => {
            const product = selected[slot.key];
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
                {/* Ícone + label */}
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

                {/* Ações */}
                <View style={styles.slotActions}>
                  {filled ? (
                    <>
                      <MaterialCommunityIcons name="check-circle" size={20} color="#4ade80" />
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeSlot(slot.key)}
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

        {/* Análise da IA */}
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

      {/* Footer fixo */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total estimado</Text>
          <Text style={styles.footerTotalValue}>R$ {formatPrice(totalPrice)}</Text>
          <Text style={styles.footerPieceCount}>
            {Object.keys(selected).length} peça{Object.keys(selected).length !== 1 ? 's' : ''}
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
            color="#000"
          />
          <Text style={styles.finalizeBtnText}>
            {isComplete ? 'Ir para o carrinho' : 'Finalizar assim'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

  scroll: { paddingBottom: 16 },

  // Progresso
  progressSection: { paddingHorizontal: 20, marginBottom: 24 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: '#a1a1aa', fontSize: 13 },
  completeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completeText: { color: '#4ade80', fontSize: 13, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#1e1e1e', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#4ade80', borderRadius: 3 },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 14 },

  // Slot card
  slotCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a',
  },
  slotCardFilled: { borderColor: '#4ade8033' },
  slotCardOptional: { opacity: 0.6 },
  slotIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  slotIconBoxFilled: { backgroundColor: '#4ade8011', borderColor: '#4ade8033' },
  slotBody: { flex: 1 },
  slotLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  slotLabel: { fontSize: 13, color: '#a1a1aa', fontWeight: '600' },
  optionalTag: {
    fontSize: 10, color: '#555', backgroundColor: '#2a2a2a',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  slotProductName: { fontSize: 14, color: '#fff', fontWeight: 'bold', marginBottom: 2 },
  slotEmpty: { fontSize: 13, color: '#444', fontStyle: 'italic' },
  slotPrice: { fontSize: 13, color: '#00d4ff', fontWeight: '600' },

  // Slot actions
  slotActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeBtn: {
    padding: 4, backgroundColor: '#ff444422',
    borderRadius: 6,
  },
  addSlotBtn: {
    backgroundColor: '#00d4ff', width: 32, height: 32,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },

  // IA
  aiTriggerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#00d4ff', height: 50, borderRadius: 14,
  },
  aiTriggerText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  aiLoadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16,
  },
  aiLoadingText: { color: '#a1a1aa', fontSize: 14 },
  aiResultBox: {
    backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#00d4ff33',
  },
  aiResultHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  aiResultLabel: { flex: 1, color: '#00d4ff', fontWeight: 'bold', fontSize: 14 },
  aiResultText: { color: '#e4e4e7', fontSize: 14, lineHeight: 22 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#171717', borderTopWidth: 1, borderTopColor: '#2a2a2a',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28, gap: 16,
  },
  footerTotal: { flex: 1 },
  footerTotalLabel: { fontSize: 11, color: '#555', marginBottom: 2 },
  footerTotalValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  footerPieceCount: { fontSize: 11, color: '#a1a1aa' },
  finalizeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#00d4ff', paddingHorizontal: 20,
    height: 52, borderRadius: 14,
  },
  finalizeBtnIncomplete: { backgroundColor: '#f59e0b' },
  finalizeBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});