import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator,
  StatusBar, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
 
type AIAssistantNavigationProp = StackNavigationProp<RootStackParamList, 'AIAssistant'>;
 
interface Props {
  navigation: AIAssistantNavigationProp;
}
 
type BuildTier = 'low' | 'mid' | 'high' | null;
type Step = 'tier' | 'budget' | 'custom' | 'result';
 
const TIERS = [
  {
    id: 'low' as BuildTier,
    label: 'Low-End',
    desc: 'Básico e econômico',
    icon: 'desktop-classic' as const,
    color: '#4ade80',
  },
  {
    id: 'mid' as BuildTier,
    label: 'Mid-End',
    desc: 'Custo-benefício',
    icon: 'desktop-tower' as const,
    color: '#00d4ff',
  },
  {
    id: 'high' as BuildTier,
    label: 'High-End',
    desc: 'Máxima performance',
    icon: 'desktop-tower-monitor' as const,
    color: '#f59e0b',
  },
];
 
export function AIAssistant({ navigation }: Props) {
  const [step, setStep] = useState<Step>('tier');
  const [selectedTier, setSelectedTier] = useState<BuildTier>(null);
  const [budget, setBudget] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleTierSelect = (tier: BuildTier) => {
    setSelectedTier(tier);
    setStep('budget');
  };
 
  const handleBudgetNext = () => {
    if (!budget.trim()) {
      Alert.alert('Atenção', 'Informe seu orçamento para continuar.');
      return;
    }
    setStep('custom');
  };
 
  const handleConsult = async () => {
    setLoading(true);
    setStep('result');
 
    const tierLabel = TIERS.find(t => t.id === selectedTier)?.label ?? '';
    const query = customQuery.trim()
      ? customQuery.trim()
      : `Monte um PC ${tierLabel} completo com orçamento de R$ ${budget}. Liste as peças recomendadas com justificativa técnica.`;
 
    try {
      const response = await fetch('http://10.0.2.2:3000/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: `Build ${tierLabel}`,
          query,
          budget,
          tier: tierLabel,
        }),
      });
 
      const data = await response.json();
      if (data?.answer) {
        setResult(data.answer);
      } else {
        setResult('Não foi possível obter uma resposta. Tente novamente.');
      }
    } catch {
      setResult('Erro de conexão. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };
 
  const reset = () => {
    setStep('tier');
    setSelectedTier(null);
    setBudget('');
    setCustomQuery('');
    setResult('');
  };
 
  // ── Render helpers ──────────────────────────────────────────────────────────
 
  const renderStepIndicator = () => {
    const steps: Step[] = ['tier', 'budget', 'custom', 'result'];
    const currentIndex = steps.indexOf(step);
    return (
      <View style={styles.stepRow}>
        {steps.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, i <= currentIndex && styles.stepDotActive]} />
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, i < currentIndex && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };
 
  const renderTierStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Qual o nível do build?</Text>
      <Text style={styles.stepSubtitle}>Selecione o perfil da sua montagem</Text>
      <View style={styles.tierList}>
        {TIERS.map(tier => (
          <TouchableOpacity
            key={tier.id}
            style={[styles.tierCard, { borderColor: tier.color }]}
            activeOpacity={0.75}
            onPress={() => handleTierSelect(tier.id)}
          >
            <MaterialCommunityIcons name={tier.icon} size={36} color={tier.color} />
            <View style={styles.tierTextGroup}>
              <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
              <Text style={styles.tierDesc}>{tier.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#555" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
 
  const renderBudgetStep = () => {
    const tier = TIERS.find(t => t.id === selectedTier);
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.stepContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep('tier')}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#a1a1aa" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
 
          <View style={[styles.selectedBadge, { borderColor: tier?.color }]}>
            <MaterialCommunityIcons name={tier!.icon} size={18} color={tier?.color} />
            <Text style={[styles.selectedBadgeText, { color: tier?.color }]}>{tier?.label}</Text>
          </View>
 
          <Text style={styles.stepTitle}>Qual o seu orçamento?</Text>
          <Text style={styles.stepSubtitle}>Valor total disponível para a montagem</Text>
 
          <View style={styles.budgetInputWrapper}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.budgetInput}
              placeholder="Ex: 3500"
              placeholderTextColor="#555"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              autoFocus
            />
          </View>
 
          <TouchableOpacity style={styles.primaryBtn} onPress={handleBudgetNext} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Continuar</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };
 
  const renderCustomStep = () => {
    const tier = TIERS.find(t => t.id === selectedTier);
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.stepContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep('budget')}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#a1a1aa" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
 
          <View style={styles.summaryRow}>
            <View style={[styles.selectedBadge, { borderColor: tier?.color }]}>
              <MaterialCommunityIcons name={tier!.icon} size={16} color={tier?.color} />
              <Text style={[styles.selectedBadgeText, { color: tier?.color }]}>{tier?.label}</Text>
            </View>
            <View style={styles.selectedBadge}>
              <MaterialCommunityIcons name="currency-brl" size={16} color="#a1a1aa" />
              <Text style={styles.selectedBadgeText}>R$ {budget}</Text>
            </View>
          </View>
 
          <Text style={styles.stepTitle}>Alguma preferência?</Text>
          <Text style={styles.stepSubtitle}>Opcional — deixe em branco para recomendação completa</Text>
 
          <TextInput
            style={styles.customInput}
            placeholder="Ex: prefiro Intel, quero jogar 1440p, preciso de WiFi integrado..."
            placeholderTextColor="#555"
            value={customQuery}
            onChangeText={setCustomQuery}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
 
          <TouchableOpacity style={styles.primaryBtn} onPress={handleConsult} activeOpacity={0.8}>
            <MaterialCommunityIcons name="robot" size={20} color="#000" />
            <Text style={styles.primaryBtnText}>Consultar IA</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };
 
  const renderResultStep = () => {
    const tier = TIERS.find(t => t.id === selectedTier);
    return (
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00d4ff" />
            <Text style={styles.loadingText}>Montando seu build...</Text>
            <Text style={styles.loadingSubText}>A IA está analisando as melhores peças</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.resultScroll}>
            <View style={styles.resultHeader}>
              <MaterialCommunityIcons name="check-circle" size={28} color="#4ade80" />
              <Text style={styles.resultTitle}>Build {tier?.label} — R$ {budget}</Text>
            </View>
            <Text style={styles.resultText}>{result}</Text>
 
            <TouchableOpacity style={styles.resetBtn} onPress={reset} activeOpacity={0.8}>
              <MaterialCommunityIcons name="refresh" size={20} color="#000" />
              <Text style={styles.resetBtnText}>Nova consulta</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    );
  };
 
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
 
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistente IA</Text>
        <View style={{ width: 38 }} />
      </View>
 
      {renderStepIndicator()}
 
      {step === 'tier' && renderTierStep()}
      {step === 'budget' && renderBudgetStep()}
      {step === 'custom' && renderCustomStep()}
      {step === 'result' && renderResultStep()}
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
  headerBack: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
 
  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, marginBottom: 28 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#333' },
  stepDotActive: { backgroundColor: '#00d4ff' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#333', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#00d4ff' },
 
  // Step container
  stepContainer: { flex: 1, paddingHorizontal: 24 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  stepSubtitle: { fontSize: 14, color: '#a1a1aa', marginBottom: 28 },
 
  // Tier cards
  tierList: { gap: 14 },
  tierCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20,
    borderWidth: 1,
  },
  tierTextGroup: { flex: 1 },
  tierLabel: { fontSize: 18, fontWeight: 'bold' },
  tierDesc: { fontSize: 13, color: '#a1a1aa', marginTop: 2 },
 
  // Budget
  budgetInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e1e', borderRadius: 14,
    paddingHorizontal: 20, marginBottom: 28, borderWidth: 1, borderColor: '#333',
  },
  currencySymbol: { fontSize: 22, color: '#00d4ff', fontWeight: 'bold', marginRight: 8 },
  budgetInput: { flex: 1, height: 60, fontSize: 22, color: '#fff', fontWeight: 'bold' },
 
  // Custom query
  customInput: {
    backgroundColor: '#1e1e1e', borderRadius: 14, padding: 16,
    color: '#fff', fontSize: 15, minHeight: 120, marginBottom: 28,
    borderWidth: 1, borderColor: '#333',
  },
 
  // Buttons
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#00d4ff', height: 56, borderRadius: 16,
  },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#a1a1aa', fontSize: 14 },
 
  // Badges
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  selectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#555', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  selectedBadgeText: { color: '#a1a1aa', fontSize: 13, fontWeight: '600' },
 
  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loadingSubText: { color: '#a1a1aa', fontSize: 14 },
 
  // Result
  resultScroll: { padding: 24, paddingBottom: 48 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
  resultText: { fontSize: 15, color: '#e4e4e7', lineHeight: 24 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#00d4ff', height: 56, borderRadius: 16, marginTop: 32,
  },
  resetBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
