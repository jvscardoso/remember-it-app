import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth.tsx';

const { height } = Dimensions.get('window');

type LoginFormData = {
  email: string;
  password: string;
};

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Digite um email válido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
});

const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#DBEAFE',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  white: '#FFFFFF',
  black: '#000000',
};

export default function LoginScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (error: any) {
      Alert.alert(
        'Erro no Login',
        error.message || 'Credenciais inválidas. Verifique seu email e senha.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (fieldName: string, hasError: boolean) => [
    styles.textInput,
    focusedField === fieldName && styles.textInputFocused,
    hasError && styles.textInputError,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View>
                  <Text style={styles.title}>RememberIT</Text>
                </View>
              </View>

              <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <Text style={styles.inputIcon}>✉️</Text>
                        </View>
                        <TextInput
                          placeholder="Digite seu email"
                          placeholderTextColor={COLORS.gray400}
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          style={getInputStyle('email', !!errors.email)}
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="email-address"
                          returnKeyType="next"
                          editable={!isLoading}
                        />
                      </View>
                      {errors.email && (
                        <Text style={styles.errorText}>{errors.email.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Senha</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <Text style={styles.inputIcon}>🔒</Text>
                        </View>
                        <TextInput
                          placeholder="Digite sua senha"
                          placeholderTextColor={COLORS.gray400}
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          style={getInputStyle('password', !!errors.password)}
                          secureTextEntry={!showPassword}
                          returnKeyType="done"
                          onSubmitEditing={handleSubmit(onSubmit)}
                          editable={!isLoading}
                        />
                        <TouchableOpacity
                          style={styles.passwordToggle}
                          onPress={() => setShowPassword(!showPassword)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.passwordToggleText}>
                            {showPassword ? '🙈' : '👁️'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text style={styles.errorText}>{errors.password.message}</Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (!isValid || isLoading) && styles.loginButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.loginButtonContent}>
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                      style={styles.loadingIndicator}
                    />
                  )}
                  <Text style={[
                    styles.loginButtonText,
                    (!isValid || isLoading) && styles.loginButtonTextDisabled,
                  ]}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer Section */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },

  keyboardAvoid: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },

  logoContainer: {
    marginBottom: 24,
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  logoText: {
    fontSize: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // Form Section
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },

  fieldContainer: {
    marginBottom: 20,
  },

  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  inputIconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },

  inputIcon: {
    fontSize: 18,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingLeft: 52,
    paddingRight: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
    color: COLORS.gray900,
    minHeight: 52,
  },

  textInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  textInputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },

  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },

  passwordToggleText: {
    fontSize: 18,
  },

  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: 6,
    marginLeft: 4,
  },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },

  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Login Button
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 18,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  loginButtonDisabled: {
    backgroundColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },

  loginButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingIndicator: {
    marginRight: 12,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },

  loginButtonTextDisabled: {
    color: COLORS.gray500,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },

  dividerText: {
    fontSize: 14,
    color: COLORS.gray500,
    marginHorizontal: 16,
    fontWeight: '500',
  },

  // Social Button
  socialButton: {
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },

  socialButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  socialIcon: {
    fontSize: 18,
    marginRight: 12,
  },

  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray700,
  },

  // Footer Section
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  footerText: {
    fontSize: 16,
    color: COLORS.gray600,
  },

  footerLink: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Security Notice
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },

  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  securityText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
});