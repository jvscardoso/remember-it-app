import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

const schema = yup.object().shape({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email().required('Email obrigatório'),
  password: yup.string().min(6).required('Senha obrigatória'),
});

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post('/users', data);
      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado!',
        position: 'bottom',
      });
      navigation.navigate('Login');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao cadastrar';
      Toast.show({
        type: 'error',
        text1: 'Erro no cadastro',
        text2: message,
        position: 'bottom',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Nome"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            style={styles.input}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Senha"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            style={styles.input}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      <Button title="Cadastrar" onPress={handleSubmit(onSubmit)} />

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10, paddingVertical: 8 },
  error: { color: 'red', marginBottom: 10 },
  link: { marginTop: 20, textAlign: 'center', color: 'blue' },
});
