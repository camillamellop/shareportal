# Configuração de Autenticação Firebase - Portal Share Brasil

## Problema Identificado

Se as edições não estão sendo salvas, pode ser um problema com a autenticação. O app está configurado para usar autenticação anônima.

## Configuração Necessária

### 1. Habilitar Autenticação Anônima

1. **Acesse o Firebase Console**: https://console.firebase.google.com/
2. **Selecione o projeto**: `aeroportal-brasil`
3. **Navegue para**: Authentication > Sign-in method
4. **Habilite "Anonymous"**: Clique em "Anonymous" e habilite

### 2. Verificar Regras do Firestore

As regras do Firestore devem permitir acesso para usuários autenticados:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Teste de Autenticação

A página de conciliação bancária agora mostra:
- **Status da Conexão**: Se o Firebase está conectado
- **Status da Autenticação**: Se o usuário está logado
- **ID do Usuário**: O ID do usuário anônimo (se logado)

## Fluxo de Autenticação

1. **Login Anônimo**: O usuário faz login anônimo na página de login
2. **Redirecionamento**: Após login, é redirecionado para a página principal
3. **Acesso Protegido**: Todas as rotas protegidas verificam se o usuário está logado

## Solução de Problemas

### Se o usuário não está logado:

1. **Verificar console**: Abra F12 e veja se há erros de autenticação
2. **Verificar Firebase Console**: Confirme que autenticação anônima está habilitada
3. **Verificar regras**: Confirme que as regras permitem acesso para usuários autenticados

### Se há erro de permissão:

1. **Verificar autenticação**: Certifique-se de que o usuário está logado
2. **Verificar regras**: As regras devem ser `allow read, write: if request.auth != null;`
3. **Verificar projeto**: Confirme que está usando o projeto correto

## Logs de Debug

O console do navegador mostrará:
- "Status da autenticação: Logado/Não logado"
- "Usuário: [objeto do usuário]"
- "Conexão com Firebase OK" (se funcionar)
- "Erro na conexão com Firebase: [mensagem]" (se houver erro)

## Configuração Alternativa

Se preferir usar autenticação com email/senha:

1. **Habilitar Email/Password** no Firebase Console
2. **Modificar a página de login** para usar `signInWithEmailAndPassword`
3. **Criar usuários** no Firebase Console ou implementar registro

## Nota Importante

Para desenvolvimento, a autenticação anônima é mais simples. Para produção, considere implementar autenticação com email/senha ou outros provedores. 