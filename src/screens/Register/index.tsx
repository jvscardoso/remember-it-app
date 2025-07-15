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
import api from '../../services/api';

const { height } = Dimensions.get('window');

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .required('Nome é obrigatório'),
  email: yup
    .string()
    .email('Digite um email válido')
    .required('Email é obrigatório'),
  password: yup
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
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

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await api.post('/users', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      Alert.alert(
        'Cadastro realizado!',
        'Sua conta foi criada com sucesso. Faça login para continuar.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.';
      Alert.alert('Erro no Cadastro', message, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (fieldName: string, hasError: boolean) => [
    styles.textInput,
    focusedField === fieldName && styles.textInputFocused,
    hasError && styles.textInputError,
  ];

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: COLORS.gray300 };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      0: { label: 'Muito fraca', color: COLORS.error },
      1: { label: 'Fraca', color: COLORS.error },
      2: { label: 'Regular', color: COLORS.warning },
      3: { label: 'Boa', color: COLORS.primary },
      4: { label: 'Forte', color: COLORS.success },
      5: { label: 'Muito forte', color: COLORS.success },
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

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
                <View style={styles.logo}>
                  <Text style={styles.logoText}>📝</Text>
                </View>
              </View>

              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>
                Preencha os dados abaixo para criar sua conta e começar a
                gerenciar suas tarefas
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Nome completo</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <Text style={styles.inputIcon}>👤</Text>
                        </View>
                        <TextInput
                          placeholder="Digite seu nome completo"
                          placeholderTextColor={COLORS.gray400}
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          style={getInputStyle('name', !!errors.name)}
                          autoCapitalize="words"
                          autoCorrect={false}
                          returnKeyType="next"
                          editable={!isLoading}
                        />
                      </View>
                      {errors.name && (
                        <Text style={styles.errorText}>
                          {errors.name.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

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
                        <Text style={styles.errorText}>
                          {errors.email.message}
                        </Text>
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
                  render={({ field: { onChange, value } }) => {
                    const passwordStrength = getPasswordStrength(value || '');
                    return (
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
                            returnKeyType="next"
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

                        {value && (
                          <View style={styles.passwordStrengthContainer}>
                            <View style={styles.passwordStrengthBar}>
                              <View
                                style={[
                                  styles.passwordStrengthFill,
                                  {
                                    width: `${
                                      (passwordStrength.strength / 5) * 100
                                    }%`,
                                    backgroundColor: passwordStrength.color,
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.passwordStrengthText,
                                { color: passwordStrength.color },
                              ]}
                            >
                              {passwordStrength.label}
                            </Text>
                          </View>
                        )}

                        {errors.password && (
                          <Text style={styles.errorText}>
                            {errors.password.message}
                          </Text>
                        )}
                      </View>
                    );
                  }}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Confirmar senha</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                          <Text style={styles.inputIcon}>🔐</Text>
                        </View>
                        <TextInput
                          placeholder="Confirme sua senha"
                          placeholderTextColor={COLORS.gray400}
                          value={value}
                          onChangeText={onChange}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                          style={getInputStyle(
                            'confirmPassword',
                            !!errors.confirmPassword,
                          )}
                          secureTextEntry={!showConfirmPassword}
                          returnKeyType="done"
                          onSubmitEditing={handleSubmit(onSubmit)}
                          editable={!isLoading}
                        />
                        <TouchableOpacity
                          style={styles.passwordToggle}
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          activeOpacity={0.7}
                        >
                          <Text style={styles.passwordToggleText}>
                            {showConfirmPassword ? '🙈' : '👁️'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {errors.confirmPassword && (
                        <Text style={styles.errorText}>
                          {errors.confirmPassword.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (!isValid || isLoading) && styles.registerButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                activeOpacity={0.8}
              >
                <View style={styles.registerButtonContent}>
                  {isLoading && (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                      style={styles.loadingIndicator}
                    />
                  )}
                  <Text
                    style={[
                      styles.registerButtonText,
                      (!isValid || isLoading) &&
                        styles.registerButtonTextDisabled,
                    ]}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  Ao criar uma conta, você concorda com nossos{' '}
                  <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
                  <Text style={styles.termsLink}>Política de Privacidade</Text>
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Fazer login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityNotice}>
              <Text style={styles.securityIcon}>🔐</Text>
              <Text style={styles.securityText}>
                Seus dados estão protegidos com criptografia de ponta a ponta
              </Text>
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

  // Password Strength
  passwordStrengthContainer: {
    marginTop: 8,
  },

  passwordStrengthBar: {
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },

  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },

  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Register Button
  registerButton: {
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

  registerButtonDisabled: {
    backgroundColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },

  registerButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingIndicator: {
    marginRight: 12,
  },

  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },

  registerButtonTextDisabled: {
    color: COLORS.gray500,
  },

  // Terms
  termsContainer: {
    marginTop: 16,
  },

  termsText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },

  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
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
