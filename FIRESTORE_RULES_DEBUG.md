# Debug das Regras do Firestore

## Problema Identificado
O upload da foto do perfil não está funcionando. Possíveis causas:

### 1. Regras do Firestore
Verifique se as regras do Firestore permitem escrita para usuários autenticados:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para usuários autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir leitura e escrita para outras coleções
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Regras do Storage
Verifique se as regras do Firebase Storage permitem upload:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir upload para usuários autenticados
    match /profile-photos/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Permitir upload para outras pastas
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Autenticação Anônima
Certifique-se de que a autenticação anônima está habilitada no Firebase Console:
- Vá para Authentication > Sign-in method
- Habilite "Anonymous"

### 4. Logs de Debug
Os logs adicionados no código vão mostrar:
- Se o usuário está autenticado
- Se o upload está funcionando
- Se o salvamento no Firestore está funcionando

### 5. Teste Manual
Para testar manualmente:
1. Abra o console do navegador
2. Tente fazer upload de uma foto
3. Verifique os logs de erro
4. Verifique se o usuário está autenticado: `auth.currentUser`

### 6. Solução Temporária
Se as regras estiverem muito restritivas, use temporariamente:
```javascript
// Firestore
allow read, write: if true;

// Storage  
allow read, write: if true;
```

**⚠️ IMPORTANTE**: Use essas regras apenas para desenvolvimento! 