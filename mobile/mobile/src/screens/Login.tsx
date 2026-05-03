import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Alert, StatusBar, ActivityIndicator 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props { navigation: LoginScreenNavigationProp; }

export function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>PC Boost</Text>
          <Text style={styles.subtitle}>Sua montagem com Gemini</Text>
        </View>

        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} placeholder="E-mail" placeholderTextColor="#71717a"
            value={email} onChangeText={setEmail} autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} placeholder="Senha" placeholderTextColor="#71717a"
            value={password} onChangeText={setPassword} secureTextEntry
          />
          
          <TouchableOpacity 
            // CORREÇÃO: Usando ternário para evitar enviar 'false' ao invés de {}
            style={[styles.button, { opacity: loading ? 0.7 : 1}]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#00d4ff' },
  subtitle: { fontSize: 14, color: '#a1a1aa' },
  inputGroup: { width: '100%', gap: 16 },
  input: { width: '100%', height: 60, backgroundColor: '#1e1e1e', borderRadius: 12, paddingHorizontal: 20, color: '#fff' },
  button: { width: '100%', height: 60, backgroundColor: '#00d4ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});