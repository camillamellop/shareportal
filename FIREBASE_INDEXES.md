# Índices do Firestore - Portal Share Brasil

## Problema Identificado

O Firestore requer índices compostos para queries que combinam filtros com ordenação. O erro encontrado foi:

```
The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/aeroportal-brasil/firestore/indexes?create_composite=Clxwcm9qZWN0cy9hZXJvcG9ydGFsLWJyYXNpbC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZGVzcGVzYXNfcGVuZGVudGVzL2luZGV4ZXMvXxABGg0KCWNhdGVnb3JpYRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

## Solução Temporária

Removemos a ordenação do servidor e implementamos ordenação no cliente para evitar o erro de índice.

**✅ ATUALIZAÇÃO: Os índices foram criados e a ordenação no servidor foi reativada!**

## Solução Permanente - Criar Índices

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione o projeto: `aeroportal-brasil`
- Navegue para: Firestore Database > Índices

### 2. Índices Necessários

#### Índice para Despesas Pendentes
- **Coleção**: `despesas_pendentes`
- **Campos**:
  - `categoria` (Ascending)
  - `createdAt` (Descending)
- **Tipo**: Composto

#### Índice para Despesas Pendentes com Status
- **Coleção**: `despesas_pendentes`
- **Campos**:
  - `categoria` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)
- **Tipo**: Composto

### 3. Como Criar

1. Clique em "Criar índice"
2. Selecione a coleção: `despesas_pendentes`
3. Adicione os campos na ordem correta
4. Defina a direção (Ascending/Descending)
5. Clique em "Criar"

### 4. Aguardar Criação

Os índices podem levar alguns minutos para serem criados. Você pode verificar o status na aba "Índices".

### 5. Após Criação dos Índices

✅ **CONCLUÍDO**: Os índices foram criados e a ordenação no servidor foi reativada no arquivo `src/services/conciliacaoService.ts`:

```typescript
let q = query(
  collection(db, this.despesasCollection),
  orderBy('createdAt', 'desc')
);
```

## Outros Índices que podem ser necessários

### Movimentações Bancárias
- **Coleção**: `movimentacoes_bancarias`
- **Campos**:
  - `categoria` (Ascending)
  - `createdAt` (Descending)

### Lançamentos Manuais
- **Coleção**: `lancamentos_manuais`
- **Campos**:
  - `categoria` (Ascending)
  - `createdAt` (Descending)

## Nota Importante

Sempre que você adicionar novos filtros ou ordenações em queries do Firestore, verifique se os índices necessários existem. O Firebase Console mostrará links diretos para criar os índices necessários quando ocorrerem erros. 