# Regras de Segurança do Firestore - Portal Share Brasil

## Problema Identificado

Se as edições não estão sendo salvas, pode ser um problema com as regras de segurança do Firestore.

## Regras Necessárias

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione o projeto: `aeroportal-brasil`
- Navegue para: Firestore Database > Regras

### 2. Regras Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todas as coleções (desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // OU regras mais específicas para produção:
    /*
    // Usuários autenticados podem ler e escrever
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Regras específicas por coleção
    match /despesas_pendentes/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /movimentacoes_bancarias/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /lancamentos_manuais/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /aeronaves/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /voos/{document} {
      allow read, write: if request.auth != null;
    }
    */
  }
}
```

### 3. Como Aplicar

1. Copie as regras acima
2. Cole no editor de regras do Firebase Console
3. Clique em "Publicar"

### 4. Verificar Status

Após publicar, aguarde alguns segundos para as regras serem aplicadas.

## Teste de Conexão

A página de conciliação bancária agora inclui um teste de conexão que mostrará:
- ✅ "Conectado" - se a conexão estiver funcionando
- ❌ "Erro na conexão" - se houver problemas

## Solução de Problemas

### Se as regras estão corretas mas ainda não funciona:

1. **Verificar autenticação**: Certifique-se de que o usuário está logado
2. **Verificar console**: Abra o console do navegador (F12) e veja se há erros
3. **Verificar rede**: Certifique-se de que não há bloqueios de firewall
4. **Verificar projeto**: Confirme que está usando o projeto correto

### Logs de Debug

O console do navegador mostrará:
- "Testando conexão com Firebase..."
- "Conexão com Firebase OK" (se funcionar)
- "Erro na conexão com Firebase: [mensagem]" (se houver erro)

## Configuração de Ambiente

Se você quiser usar variáveis de ambiente, crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=aeroportal-brasil.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aeroportal-brasil
VITE_FIREBASE_STORAGE_BUCKET=aeroportal-brasil.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=136549004745
VITE_FIREBASE_APP_ID=1:136549004745:web:e78ee54833482bdcfde418
```

## Nota Importante

Para desenvolvimento, as regras `allow read, write: if true;` permitem acesso total. Para produção, use regras mais restritivas baseadas em autenticação. 