# Sistema de Conciliação Bancária - Portal Share

## Visão Geral

Implementei um sistema completo de conciliação bancária que automatiza o processo de ressarcimento de despesas, separando clientes e colaboradores conforme solicitado.

## Fluxo Automatizado

### 1. **Recibos** → **Despesas de Clientes**
- Ao emitir um recibo, automaticamente cria uma despesa pendente para o cliente
- Status: `Pendente de Envio` → `Enviado` → `Pendente de Pagamento` → `Pago`
- Categoria: **Cliente**

### 2. **Relatórios de Viagem** → **Reembolsos de Colaboradores**  
- Ao criar um relatório de viagem, automaticamente cria uma despesa pendente para reembolso
- Status: `Pendente de Envio` → `Enviado` → `Pendente de Pagamento` → `Pago`
- Categoria: **Colaborador**

### 3. **Lançamentos Manuais**
- Separados por categoria: **Cliente** ou **Colaborador**
- Opção de gerar despesa pendente automaticamente
- Interface dedicada para cada tipo

## Estrutura Implementada

### **Tipos e Interfaces** (`src/types/conciliacao.ts`)
```typescript
interface DespesaPendente {
  tipo: 'recibo' | 'relatorio_viagem' | 'lancamento_manual';
  categoria: 'cliente' | 'colaborador';
  status: 'pendente_envio' | 'enviado' | 'pendente_pagamento' | 'pago' | 'cancelado';
  // ... outros campos
}
```

### **Serviços** (`src/services/conciliacaoService.ts`)
- `criarDespesaPendente()` - Cria nova despesa
- `atualizarStatusDespesa()` - Atualiza status (enviado, pago, etc.)
- `criarLancamentoManual()` - Lançamentos manuais
- `criarDespesaDeRecibo()` - Integração com recibos
- `criarDespesaDeRelatorioViagem()` - Integração com relatórios

## Páginas Atualizadas

### **1. Emissão de Recibo** (`/financeiro/recibo`)
✅ **Funcionalidades Implementadas:**
- Formulário completo para emissão de recibos
- Geração automática de número sequencial
- **Criação automática de despesa pendente** ao salvar
- Histórico de recibos emitidos
- Valor por extenso automático

✅ **Fluxo:**
1. Preenche dados do recibo (cliente, valor, descrição)
2. Salva recibo
3. **Sistema cria automaticamente despesa pendente para o cliente**
4. Despesa aparece na conciliação com status "Pendente de Envio"

### **2. Relatório de Viagem** (`/financeiro/relatorios-viagem`)  
✅ **Funcionalidades Implementadas:**
- Formulário para dados da viagem (colaborador, destino, período)
- **Sistema de despesas por categoria** (Hospedagem, Transporte, etc.)
- Cálculo automático do total das despesas
- **Criação automática de despesa de reembolso** ao salvar
- Histórico de relatórios emitidos

✅ **Fluxo:**
1. Preenche dados da viagem e adiciona despesas
2. Salva relatório
3. **Sistema cria automaticamente despesa de reembolso para o colaborador**
4. Despesa aparece na conciliação com status "Pendente de Envio"

### **3. Conciliação Bancária** (`/financeiro/conciliacao`)

#### **Aba: Conciliação com Clientes**
✅ **Funcionalidades:**
- Dashboard com resumo (Total Pago, Total Pendente)
- Lista de todas as despesas de clientes
- **Lançamento manual** para clientes
- Atualização de status das despesas
- Controle de envio e pagamento

#### **Aba: Conciliação Colaborador**  
✅ **Funcionalidades:**
- Dashboard com resumo de reembolsos
- Lista de todas as despesas de colaboradores
- **Lançamento manual** para colaboradores
- Atualização de status das despesas
- Controle de envio e pagamento

## Status das Despesas

### **Fluxo Completo:**
1. **`pendente_envio`** - Despesa criada, aguardando envio para cliente/colaborador
2. **`enviado`** - Despesa enviada (registra data de envio)
3. **`pendente_pagamento`** - Cliente confirmou, aguardando pagamento
4. **`pago`** - Pagamento realizado (registra data, forma de pagamento)
5. **`cancelado`** - Despesa cancelada

### **Formas de Pagamento:**
- PIX
- TED  
- DOC
- Cheque
- Dinheiro

## Integração Automática

### **Recibo → Despesa de Cliente**
```typescript
// Ao salvar recibo
await conciliacaoService.criarDespesaDeRecibo(reciboId, {
  numero: formData.numero,
  cliente_nome: formData.cliente_nome,
  valor: formData.valor,
  descricao: formData.descricao,
  data: formData.data
});
```

### **Relatório → Despesa de Colaborador**
```typescript
// Ao salvar relatório de viagem  
await conciliacaoService.criarDespesaDeRelatorioViagem(relatorioId, {
  numero: formData.numero,
  colaborador_nome: formData.colaborador_nome,
  valor_total: calcularTotal(),
  descricao: `Viagem para ${formData.destino}`,
  data: formData.data_inicio
});
```

## Funcionalidades por Tela

### **Dashboard de Conciliação**
- **Cards de Resumo**: Total pago, pendente, quantidade de despesas
- **Separação Clara**: Cliente vs Colaborador
- **Filtros**: Por período, status, categoria

### **Lançamentos Manuais**
- **Clientes**: Para despesas avulsas de clientes
- **Colaboradores**: Para reembolsos avulsos de colaboradores
- **Opção**: Gerar ou não despesa pendente automaticamente

### **Controle de Status**
- **Modal de Atualização**: Para cada despesa
- **Campos Condicionais**: Data de envio, data de pagamento, forma de pagamento
- **Observações**: Para cada alteração de status

## Benefícios do Sistema

✅ **Automatização Completa**: Recibos e relatórios geram despesas automaticamente
✅ **Separação Clara**: Cliente e colaborador em abas distintas  
✅ **Controle de Fluxo**: Status claro do processo de ressarcimento
✅ **Rastreabilidade**: Histórico completo de cada despesa
✅ **Flexibilidade**: Lançamentos manuais quando necessário
✅ **Relatórios**: Dashboards com resumos e métricas

## Próximos Passos Sugeridos

1. **Relatórios Gerenciais**: Relatórios consolidados por período
2. **Notificações**: Alertas para despesas vencidas
3. **Integração Bancária**: Import de extratos para conciliação automática
4. **Aprovação de Despesas**: Workflow de aprovação antes do pagamento
5. **Anexos**: Upload de comprovantes e documentos
6. **API de Bancos**: Integração para confirmação de pagamentos

O sistema está funcionalmente completo e pronto para uso! 💰📊