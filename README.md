# To-Do List App (Offline-First)

Este projeto é um aplicativo **To-Do List offline-first**, desenvolvido em **React Native** com suporte a **sincronização automática** quando a conexão com a internet é restabelecida.

---

## 🚀 Tecnologias Utilizadas
- **React Native** (0.80+)
- **TypeScript**
- **SQLite** (armazenamento local)
- **Axios** (requisições HTTP)
- **React Hook Form** (formulários)
- **React Navigation** (navegação)
- **Toast Messages**
- **Lucide Icons**

---

## 📦 Instalação e Configuração

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/todo-app.git
   cd todo-app
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Instale as dependências nativas (iOS):**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Execute o projeto:**
    - Android:
      ```bash
      npm run android
      ```
    - iOS:
      ```bash
      npm run ios
      ```

---

## 📱 Funcionalidades

- Criar, editar e excluir tarefas
- Filtrar por status (**pendente**, **em andamento**, **concluída**)
- Funciona **100% offline** com persistência local
- Sincronização automática quando voltar à internet
- Interface moderna e responsiva

---

## 🛠 Estrutura Offline-First

Utilizamos **SQLite** como banco de dados local para:
- Garantir que o app funcione mesmo sem internet
- Sincronizar as alterações com o servidor quando online
- Evitar perda de dados durante quedas de conexão

**Por que SQLite?**
- É um banco de dados **relacional leve e eficiente**
- Suporte nativo em dispositivos móveis
- Permite **queries complexas** e melhor consistência dos dados do que armazenar tudo em arquivos JSON ou AsyncStorage

---

## 📂 Estrutura de Pastas

```
src/
 ├── components/     # Componentes reutilizáveis
 ├── database/       # Configuração do SQLite e repositórios
 ├── hooks/          # Hooks customizados (ex: useNetworkSync)
 ├── pages/          # Telas do aplicativo
 ├── services/       # Integração com API
 └── types/          # Tipagens TypeScript
```

---

## ✅ Requisitos
- Node.js 18+
- Android Studio ou Xcode configurados
- Emulador ou dispositivo físico

---