# 🔧 Índices do Firebase Necessários

## ❌ **Problema Atual**
O sistema está apresentando erros de índices compostos necessários no Firestore.

## ✅ **Solução: Criar Índices**

### **1. Acesse o Firebase Console**
- URL: https://console.firebase.google.com
- Projeto: `aeroportal-brasil`
- Vá para: **Firestore Database > Índices**

### **2. Índices Necessários**

#### **Índice 1: Voos por Aeronave**
```
Coleção: voos
Campos:
- aeronave_id (Ascending)
- data (Descending)
```

#### **Índice 2: Notificações por Tipo**
```
Coleção: notificacoes
Campos:
- tipo (Ascending)
- createdAt (Descending)
```

#### **Índice 3: Voos por Período**
```
Coleção: voos
Campos:
- data (Ascending)
- aeronave_id (Ascending)
```

### **3. Como Criar**

1. **Clique em "Adicionar Índice"**
2. **Selecione a coleção** (voos ou notificacoes)
3. **Adicione os campos** na ordem especificada
4. **Clique em "Criar"**

### **4. Tempo de Criação**
- ⏱️ **2-5 minutos** para índices pequenos
- ⏱️ **5-15 minutos** para índices grandes

### **5. Verificação**
Após criar os índices:
1. Aguarde a mensagem "Índice criado com sucesso"
2. Teste o upload da foto novamente
3. Verifique se os erros desapareceram

### **6. Solução Temporária**
Enquanto os índices são criados, as consultas problemáticas foram desabilitadas temporariamente:
- ✅ Notificações: retornam lista vazia
- ✅ Voos por aeronave: retornam lista vazia

### **7. Reativar Após Índices**
Após criar os índices, reative as consultas removendo os comentários em:
- `src/components/shared/NotificacaoVoos.tsx`
- `src/services/firestore.ts`

---

**⚠️ IMPORTANTE**: Os índices são necessários para consultas compostas no Firestore. Sem eles, as consultas falham. 