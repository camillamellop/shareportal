# Configuração do Firebase - Aeroportal Brasil

## 🔥 Configuração do Firebase

### 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome: **Aeroportal Brasil**
4. Siga os passos de configuração

### 2. Configurar Firestore Database

1. No console do Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Modo de teste" para desenvolvimento
4. Selecione a localização mais próxima (ex: us-central1)

### 3. Configurar Storage

1. No console do Firebase, vá para "Storage"
2. Clique em "Começar"
3. Escolha as mesmas regras de segurança do Firestore

### 4. Obter Credenciais

1. No console do Firebase, vá para "Configurações do projeto"
2. Role até "Seus aplicativos"
3. Clique em "Adicionar app" e escolha "Web"
4. Copie as credenciais de configuração

### 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=aeroportal-brasil.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aeroportal-brasil
VITE_FIREBASE_STORAGE_BUCKET=aeroportal-brasil.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=136549004745
VITE_FIREBASE_APP_ID=1:136549004745:web:e78ee54833482bdcfde418
```

### 6. Regras de Segurança do Firestore

Configure as regras do Firestore em `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita na coleção tripulacao
    match /tripulacao/{document} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

### 7. Regras de Segurança do Storage

Configure as regras do Storage em `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir upload de fotos de tripulantes
    match /tripulacao/{tripulanteId}/{fileName} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

## 🚀 Enviar Dados para o Firebase

### Executar o Script de Envio

```bash
npm run enviar-dados
```

Este comando irá:
- Conectar ao Firebase
- Enviar 4 tripulantes de exemplo
- Mostrar estatísticas após o envio

### Dados que serão Enviados

1. **WENDELL MUNIZ CANEDO SANTOS** - Piloto Comandante
2. **RODRIGO DE MORAIS TOSCANO** - Piloto Comercial  
3. **MARINA COSTA SILVA** - Copiloto
4. **CARLOS EDUARDO LIMA** - Piloto Privado

## 📊 Estrutura dos Dados

### Coleção: `tripulacao`

Cada documento contém:

```typescript
{
  id: string,
  nome: string,
  cargo: string,
  cpf: string,
  telefone: string,
  email: string,
  codigoANAC: string,
  categoria: string,
  dataNascimento: string,
  localNascimento: string,
  status: 'ativo' | 'inativo',
  observacoes: string,
  foto: string,
  horasVoo: number,
  
  // Certificados
  cht: {
    numero: string,
    validade: string,
    status: 'valido' | 'proximo_vencimento' | 'vencido'
  },
  cma: {
    numero: string,
    validade: string,
    status: 'valido' | 'proximo_vencimento' | 'vencido'
  },
  habilitacoes: Array<{
    tipo: string,
    validade: string,
    status: 'valido' | 'proximo_vencimento' | 'vencido'
  }>,
  ingles: {
    nivel: string,
    validade: string,
    status: 'valido' | 'proximo_vencimento' | 'vencido'
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔧 Serviços Disponíveis

### TripulacaoService

- `adicionarTripulante()` - Adicionar novo tripulante
- `buscarTripulantes()` - Buscar todos os tripulantes
- `buscarTripulantePorId()` - Buscar por ID
- `atualizarTripulante()` - Atualizar dados
- `excluirTripulante()` - Excluir tripulante
- `uploadFoto()` - Upload de fotos
- `buscarEstatisticas()` - Estatísticas gerais

### Hook useTripulacao

- Gerencia estado dos dados
- Carregamento automático
- Tratamento de erros
- Filtros e buscas

## 🛡️ Segurança

Para produção, configure regras de segurança adequadas:

```javascript
// Firestore Rules
match /tripulacao/{document} {
  allow read, write: if request.auth != null;
}

// Storage Rules  
match /tripulacao/{tripulanteId}/{fileName} {
  allow read, write: if request.auth != null;
}
```

## 📱 Uso no React

```typescript
import { useTripulacao } from '../hooks/useTripulacao';

function GestaoTripulacao() {
  const { 
    tripulantes, 
    loading, 
    error, 
    estatisticas,
    adicionarTripulante 
  } = useTripulacao();

  // Usar os dados...
}
```

## 🎯 Próximos Passos

1. ✅ Configurar Firebase
2. ✅ Criar serviços de dados
3. ✅ Implementar hook personalizado
4. ✅ Enviar dados de exemplo
5. 🔄 Integrar com componentes React
6. 🔄 Implementar autenticação
7. 🔄 Configurar notificações
8. 🔄 Deploy para produção 