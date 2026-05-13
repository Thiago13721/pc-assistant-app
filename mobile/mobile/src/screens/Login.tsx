import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
  Alert, Image, Animated, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useStore } from '../store/useStore';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
interface Props { navigation: LoginScreenNavigationProp; }

const { width, height } = Dimensions.get('window');

export function Login({ navigation }: Props) {
  const setUser = useStore(state => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://pc-assistant-app-2.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Erro', data.error || 'Falha ao entrar.');
        return;
      }
      setUser(data.user, data.token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch {
      Alert.alert('Erro de conexão', 'Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background com gradiente */}
      <LinearGradient
        colors={['#0a0a0f', '#0d1117', '#121212']}
        style={StyleSheet.absoluteFill}
      />

      {/* Círculos decorativos de fundo */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoGlow}>
            <Image
              source={require('../../assets/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Card de login */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>Bem-vindo de volta</Text>
          <Text style={styles.welcomeSub}>Entre na sua conta para continuar</Text>

          <View style={styles.form}>
            {/* Email */}
            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={emailFocused ? '#0982a0' : '#555'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#3a3a3a"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Senha */}
            <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={18}
                color={passwordFocused ? '#0982a0' : '#555'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#3a3a3a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            {/* Botão entrar */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading ? ['#129ac465', '#0c10ea66'] : ['#4b17c5', '#1afff460']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtnGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                      <MaterialCommunityIcons name="login" size={18} color="#fff" />
                      <Text style={styles.loginBtnText}>Entrar</Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.registerLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 40 },

  // Círculos decorativos
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#f9731608', top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#f9731605', bottom: 100, left: -60,
  },
  bgCircle3: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#f9731603', top: height * 0.3, left: width * 0.5,
  },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoGlow: {
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  logo: { width: 140, height: 140, borderRadius: 24 },

  // Card
  card: {
    backgroundColor: '#161616',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
  },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: '#555', marginBottom: 24 },

  form: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f0f0f', borderRadius: 12,
    borderWidth: 1, borderColor: '#252525', height: 52,
  },
  inputWrapperFocused: { borderColor: '#16eaf9', backgroundColor: '#f9731608' },
  inputIcon: { marginLeft: 14, marginRight: 8 },
  input: { flex: 1, color: '#fff', fontSize: 14, height: '100%' },
  eyeBtn: { padding: 14 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: '#444', fontSize: 12 },

  loginBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: {
    height: 52, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  // Footer
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6, marginTop: 24,
  },
  footerText: { color: '#444', fontSize: 14 },
  registerLink: { color: '#329afc', fontSize: 14, fontWeight: 'bold' },
});