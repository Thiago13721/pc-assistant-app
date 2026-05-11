import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore';
import Toast from 'react-native-root-toast';

type RegisterNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
interface Props { navigation: RegisterNavigationProp; }

// Estilos padronizados para o Root Toast (Dark/Neon)
const toastStyles = {
  success: { backgroundColor: '#1a1a1a', textColor: '#fff', opacity: 1, containerStyle: { borderLeftWidth: 4, borderLeftColor: '#4ade80', borderRadius: 8, paddingHorizontal: 20 } },
  error: { backgroundColor: '#1a1a1a', textColor: '#fff', opacity: 1, containerStyle: { borderLeftWidth: 4, borderLeftColor: '#ff4444', borderRadius: 8, paddingHorizontal: 20 } }
};

export function Register({ navigation }: Props) {
  const setUser = useStore(state => state.setUser);
  const addAddress = useStore(state => state.addAddress);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const fetchCEP = async (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) {
        Toast.show('Não encontramos esse CEP.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
        return;
      }
      setAddress(`${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`);
    } catch {
      Toast.show('Não foi possível buscar o CEP.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
    } finally {
      setCepLoading(false);
    }
  };

  const handleCEPChange = (value: string) => {
    setCep(value);
    if (value.replace(/\D/g, '').length === 8) fetchCEP(value);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Toast.show('Preencha todos os campos obrigatórios.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
      return;
    }
    if (!validateEmail(email)) {
      Toast.show('Digite um e-mail válido.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
      return;
    }
    if (password.length < 6) {
      Toast.show('A senha deve ter pelo menos 6 caracteres.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show('As senhas não coincidem.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          cep: cep.replace(/\D/g, '') || undefined,
          address: address.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.show(data.error || 'Falha ao criar conta.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
        return;
      }

      // Adiciona o usuário e o endereço na Store global (Zustand)
      setUser(data.user, data.token);
      if (cep && address) {
        addAddress({
          label: 'Minha Casa',
          cep: cep.replace(/\D/g, ''),
          street: address,
          number: 'S/N',
          complement: '',
          neighborhood: '',
          city: '',
          state: ''
        });
      }

      Toast.show('Conta criada com sucesso! 🎉', { position: Toast.positions.TOP + 40, ...toastStyles.success });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch {
      Toast.show('Verifique se o servidor está rodando.', { position: Toast.positions.TOP + 40, ...toastStyles.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>DADOS PESSOAIS</Text>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="account-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nome completo *"
            placeholderTextColor="#555"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="E-mail *"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Senha (mín. 6 caracteres) *"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="lock-check-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha *"
            placeholderTextColor="#555"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
            <MaterialCommunityIcons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ENDEREÇO (OPCIONAL)</Text>

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="CEP"
            placeholderTextColor="#555"
            value={cep}
            onChangeText={handleCEPChange}
            keyboardType="numeric"
            maxLength={9}
          />
          {cepLoading && <ActivityIndicator color="#00d4ff" style={{ marginRight: 14 }} />}
        </View>

        <View style={[styles.inputWrapper, { minHeight: 56, height: 'auto', alignItems: 'flex-start', paddingVertical: 14 }]}>
          <MaterialCommunityIcons name="home-outline" size={20} color="#555" style={[styles.icon, { marginTop: 2 }]} />
          <TextInput
            style={[styles.input, { height: 'auto' }]}
            placeholder="Endereço completo"
            placeholderTextColor="#555"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.registerBtnText}>Criar Conta</Text>
          }
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
  },
  backBtn: { padding: 8, backgroundColor: '#1e1e1e', borderRadius: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  scroll: { paddingHorizontal: 24, paddingBottom: 48 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 12, letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e1e', borderRadius: 14,
    borderWidth: 1, borderColor: '#2a2a2a',
    height: 56, marginBottom: 12,
  },
  icon: { marginLeft: 16, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15, height: '100%' },
  eyeBtn: { padding: 14 },
  registerBtn: {
    backgroundColor: '#00d4ff', height: 56, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  registerBtnDisabled: { backgroundColor: '#00d4ff88' },
  registerBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 },
  footerText: { color: '#a1a1aa', fontSize: 14 },
  loginLink: { color: '#00d4ff', fontSize: 14, fontWeight: 'bold' },
});