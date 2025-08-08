# Gestão de Horas de Voo

## 📋 Visão Geral

O módulo de **Gestão de Horas de Voo** permite controlar e acompanhar as horas de voo dos tripulantes, separando os registros por tripulante e fornecendo relatórios detalhados.

## 🎯 Funcionalidades

### ✅ **Funcionalidades Implementadas:**

#### **1. Resumo por Tripulante**
- ✅ **Total de horas** por tripulante
- ✅ **Horas do mês atual** 
- ✅ **Horas do ano atual**
- ✅ **Último voo realizado**
- ✅ **Número de voos realizados**
- ✅ **Busca e filtros** por nome/cargo

#### **2. Registros Detalhados**
- ✅ **Lista completa** de todos os registros
- ✅ **Filtro por tripulante** específico
- ✅ **Busca por origem/destino**
- ✅ **Status dos registros** (Pendente/Aprovado/Rejeitado)
- ✅ **Ações de aprovação/rejeição**

#### **3. Novo Registro de Horas**
- ✅ **Seleção de tripulante** da lista
- ✅ **Data e horários** de partida/chegada
- ✅ **Cálculo automático** de horas voadas
- ✅ **Origem e destino** do voo
- ✅ **Matrícula da aeronave**
- ✅ **Tipo de voo** (Comercial/Treinamento/Manutenção/Outro)
- ✅ **Observações** adicionais

#### **4. Controle de Status**
- ✅ **Aprovação** de registros pendentes
- ✅ **Rejeição** com motivo
- ✅ **Histórico** de aprovações
- ✅ **Data de aprovação** registrada

#### **5. Dashboard e Métricas**
- ✅ **Total de horas** da empresa
- ✅ **Número de tripulantes** ativos
- ✅ **Horas do mês** atual
- ✅ **Registros pendentes** de aprovação

## 🗂️ Estrutura de Dados

### **Interface HorasVoo**
```typescript
interface HorasVoo {
  id: string;
  tripulante_id: string;
  tripulante_nome: string;
  cargo: string;
  data_voo: string;
  hora_partida: string;
  hora_chegada: string;
  horas_voadas: number;
  origem: string;
  destino: string;
  aeronave_matricula: string;
  tipo_voo: 'comercial' | 'treinamento' | 'manutencao' | 'outro';
  observacoes?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  aprovado_por?: string;
  data_aprovacao?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### **Interface ResumoHorasVoo**
```typescript
interface ResumoHorasVoo {
  tripulante_id: string;
  tripulante_nome: string;
  cargo: string;
  total_horas: number;
  horas_mes_atual: number;
  horas_ano_atual: number;
  ultimo_voo: string;
  voos_realizados: number;
}
```

## 🔧 Serviços

### **HorasVooService**
- ✅ `criarRegistroHoras()` - Criar novo registro
- ✅ `obterHorasVoo()` - Buscar registros com filtros
- ✅ `obterResumoHorasVoo()` - Gerar resumo por tripulante
- ✅ `aprovarHoras()` - Aprovar registro
- ✅ `rejeitarHoras()` - Rejeitar registro

## 📱 Interface do Usuário

### **1. Aba "Tripulantes"**
- ✅ **Cards de resumo** com métricas gerais
- ✅ **Lista de tripulantes** com busca
- ✅ **Cards individuais** com informações de cada tripulante

### **2. Aba "Horas de Voo"**
- ✅ **Dashboard** com métricas de horas
- ✅ **Tabs** para Resumo e Registros Detalhados
- ✅ **Modal** para novo registro
- ✅ **Modal** para detalhes por tripulante

### **3. Aba "Valores/Hora"**
- ✅ **Dashboard** com métricas de valores
- ✅ **Tabela** de valores por aeronave
- ✅ **Modal** para adicionar/editar valores
- ✅ **Busca** e filtros por aeronave

### **4. Responsividade**
- ✅ **Mobile-first** design
- ✅ **Tabelas responsivas** com scroll horizontal
- ✅ **Modais adaptativos** para diferentes telas
- ✅ **Grids flexíveis** para formulários

## 🚀 Como Usar

### **1. Acessar o Módulo**
1. Navegue para **"Gestão de Tripulação"** no menu lateral (dentro de Operações de Voo)
2. Clique na aba **"Horas de Voo"** ou **"Valores/Hora"**

### **2. Visualizar Resumo**
- Veja o **dashboard** com métricas gerais
- Acesse a aba **"Resumo por Tripulante"** para ver estatísticas individuais
- Use a **busca** para filtrar tripulantes

### **3. Criar Novo Registro**
1. Clique em **"Novo Registro"**
2. Preencha os campos obrigatórios:
   - Tripulante
   - Data do voo
   - Hora de partida
   - Hora de chegada
3. Adicione informações opcionais (origem, destino, aeronave, etc.)
4. Clique em **"Criar Registro"**

### **4. Aprovar/Rejeitar Registros**
1. Acesse a aba **"Registros Detalhados"**
2. Para registros pendentes, use os botões:
   - ✅ **Aprovar** (ícone verde)
   - ❌ **Rejeitar** (ícone vermelho)

### **5. Ver Detalhes por Tripulante**
1. No resumo, clique no ícone 📄 ao lado do tripulante
2. Veja todos os registros detalhados daquele tripulante

### **6. Gerenciar Valores por Aeronave**
1. Acesse a aba **"Valores/Hora"**
2. Clique em **"Adicionar Aeronave"** para criar novo valor
3. Use os botões de **editar** ou **excluir** para gerenciar valores existentes
4. Use a **busca** para filtrar aeronaves

## 📊 Relatórios Disponíveis

### **1. Resumo Geral**
- Total de horas voadas
- Número de tripulantes ativos
- Horas do mês atual
- Registros pendentes de aprovação

### **2. Resumo por Tripulante**
- Total de horas por pessoa
- Horas do mês/ano atual
- Último voo realizado
- Número de voos realizados

### **3. Registros Detalhados**
- Lista completa de todos os voos
- Filtros por tripulante e período
- Status de cada registro
- Ações de aprovação/rejeição

### **4. Valores por Aeronave**
- Tabela de valores por hora de cada aeronave
- Status ativo/inativo das aeronaves
- Métricas de valores totais e médios
- Ações de edição e exclusão

## 🔄 Integração com Diário de Bordo

O módulo está preparado para integração futura com o **Diário de Bordo**, onde:

- ✅ **Registros automáticos** podem ser criados a partir do diário
- ✅ **Sincronização** de dados entre os módulos
- ✅ **Validação** de horas registradas
- ✅ **Relatórios consolidados** de voos

## 🛠️ Configuração

### **1. Dados de Exemplo**
Para popular dados de exemplo, execute no console do navegador:
```javascript
// Para horas de voo
window.seedHorasVoo()

// Para valores das horas de voo
window.seedValoresHoras()
```

### **2. Permissões**
- ✅ **Visualização** - Todos os usuários autenticados
- ✅ **Criação** - Coordenadores e administradores
- ✅ **Aprovação** - Coordenadores e administradores

## 📈 Próximas Melhorias

### **Planejadas:**
- 🔄 **Integração** com Diário de Bordo
- 📊 **Relatórios PDF** de horas por tripulante
- 📅 **Filtros avançados** por período
- 📱 **Notificações** de registros pendentes
- 🔗 **Exportação** para Excel/CSV

### **Técnicas:**
- ⚡ **Cache** de dados para melhor performance
- 🔍 **Busca avançada** com múltiplos critérios
- 📊 **Gráficos** de evolução de horas
- 🔔 **Alertas** de vencimento de horas mínimas

## 🎨 Design System

### **Cores Utilizadas:**
- 🟦 **Primary** - Azul para elementos principais
- 🟢 **Success** - Verde para aprovações
- 🔴 **Danger** - Vermelho para rejeições
- 🟡 **Warning** - Amarelo para pendentes

### **Ícones:**
- ⏰ **Clock** - Horas de voo
- 👥 **Users** - Tripulantes
- 📈 **TrendingUp** - Métricas
- ✈️ **Plane** - Voos
- ✅ **CheckCircle** - Aprovar
- ❌ **XCircle** - Rejeitar

---

**Desenvolvido para Conexão UNK** 🚀
