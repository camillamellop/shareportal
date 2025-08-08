# Controle de Abastecimento

## Visão Geral

O módulo de Controle de Abastecimento permite gerenciar todos os registros de abastecimento das aeronaves da empresa, baseado no sistema Excel existente.

## Funcionalidades

### 📊 Dashboard
- **Estatísticas em tempo real**: Total de registros, litros, valores e pendências
- **Filtros avançados**: Por aeronave, cotista, período e status
- **Busca inteligente**: Pesquisa por qualquer campo relevante

### 📝 Gestão de Registros
- **Criar novo abastecimento**: Formulário completo com validação
- **Editar registros existentes**: Modificação de qualquer campo
- **Excluir registros**: Com confirmação de segurança
- **Visualização em tabela**: Layout similar ao Excel original

### 📋 Campos do Sistema

| Campo | Tipo | Descrição |
|-------|------|-----------|
| ACFT | Texto | Matrícula da aeronave |
| COTISTA | Texto | Nome do cotista responsável |
| DATA ABASTECIMENTO | Data | Data do abastecimento |
| ABASTECEDOR | Texto | Nome do posto de abastecimento |
| Nº COMANDA | Texto | Número da comanda |
| LITROS | Número | Quantidade de combustível |
| VALOR UNIT | Moeda | Valor por litro |
| TOTAL | Moeda | Valor total (calculado automaticamente) |
| Nº FISCAL | Texto | Número da nota fiscal |
| Nº BOLETO | Texto | Número do boleto |
| VENCIMENTO | Data | Data de vencimento |
| EMAIL | Boolean | Status do envio de email |
| RATEIO | Boolean | Status do rateio |
| OBSERVAÇÕES | Texto | Observações adicionais |

### 🔍 Filtros Disponíveis

1. **Por Aeronave**: PR-MDL, PT-OPC, PS-AVE
2. **Por Cotista**: Todos os cotistas cadastrados
3. **Por Período**: Data início e fim
4. **Por Status**: Email enviado, Rateio pendente
5. **Busca Geral**: Qualquer termo nos campos

### 📈 Estatísticas

- **Total de Registros**: Contagem geral
- **Total em Litros**: Soma de todos os litros
- **Valor Total**: Soma de todos os valores
- **Pendências**: Email não enviado + Rateio pendente

## Como Usar

### 1. Acessar o Módulo
- Clique em "Controle de Abastecimento" no RightSidebar
- Ou navegue diretamente para `/abastecimento`

### 2. Visualizar Dados
- Os dados são carregados automaticamente do Firestore
- Use os filtros para encontrar registros específicos
- A tabela é responsiva e funciona em dispositivos móveis

### 3. Adicionar Novo Registro
1. Clique em "Novo Abastecimento"
2. Preencha todos os campos obrigatórios
3. O valor total é calculado automaticamente
4. Clique em "Salvar"

### 4. Editar Registro
1. Clique em "Editar" na linha desejada
2. Modifique os campos necessários
3. Clique em "Atualizar"

### 5. Excluir Registro
1. Clique em "Excluir" na linha desejada
2. Confirme a exclusão

### 6. Popular Dados de Teste
- Clique em "Popular Dados" para inserir registros de exemplo
- Útil para demonstração e testes

## Integração com Firebase

### Estrutura do Firestore
```javascript
Collection: 'abastecimentos'
Document: {
  id: string,
  acft: string,
  cotista: string,
  dataAbastecimento: string,
  abastecedor: string,
  numeroComanda: string,
  litros: number,
  valorUnitario: number,
  total: number,
  numeroFiscal: string,
  numeroBoleto: string,
  vencimento: string,
  email: boolean,
  rateio: boolean,
  observacoes: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Serviços Disponíveis
- `getAll()`: Buscar todos os registros
- `getById(id)`: Buscar por ID
- `create(data)`: Criar novo registro
- `update(id, data)`: Atualizar registro
- `delete(id)`: Excluir registro
- `getByAircraft(acft)`: Buscar por aeronave
- `getByCotista(cotista)`: Buscar por cotista
- `getByDateRange(inicio, fim)`: Buscar por período
- `getPendentesEmail()`: Buscar pendentes de email
- `getPendentesRateio()`: Buscar pendentes de rateio
- `getEstatisticas()`: Calcular estatísticas

## Melhorias Implementadas

### ✅ Performance
- **Lazy Loading**: Componentes carregados sob demanda
- **Memoização**: Evita re-renders desnecessários
- **Debounce**: Busca otimizada
- **Virtualização**: Para grandes listas

### ✅ UX/UI
- **Design Responsivo**: Funciona em todos os dispositivos
- **Loading States**: Feedback visual durante operações
- **Toast Notifications**: Confirmações de ações
- **Error Handling**: Tratamento de erros amigável

### ✅ Funcionalidades
- **Cálculo Automático**: Total baseado em litros × valor unitário
- **Validação**: Campos obrigatórios e formatos
- **Filtros Avançados**: Múltiplas opções de busca
- **Exportação**: Preparado para futuras funcionalidades

### ✅ Logging
- **Sistema Centralizado**: Logs estruturados
- **Níveis de Log**: Debug, Info, Warn, Error
- **Performance Monitoring**: Rastreamento de operações

## Próximas Funcionalidades

### 🔮 Roadmap
- [ ] **Exportação para Excel**: Download dos dados
- [ ] **Relatórios**: Gráficos e análises
- [ ] **Notificações**: Alertas de vencimento
- [ ] **Integração com Email**: Envio automático
- [ ] **Backup Automático**: Sincronização com Google Sheets
- [ ] **Auditoria**: Histórico de alterações

### 🚀 Melhorias Técnicas
- [ ] **Cache Inteligente**: Otimização de consultas
- [ ] **Offline Support**: Funcionamento sem internet
- [ ] **Real-time Updates**: Sincronização em tempo real
- [ ] **Bulk Operations**: Operações em lote

## Troubleshooting

### Problemas Comuns

1. **Dados não carregam**
   - Verificar conexão com Firebase
   - Verificar regras de segurança do Firestore
   - Verificar console para erros

2. **Erro ao salvar**
   - Verificar campos obrigatórios
   - Verificar formato de datas
   - Verificar permissões do usuário

3. **Performance lenta**
   - Verificar quantidade de registros
   - Usar filtros para reduzir dados
   - Verificar conexão de internet

### Comandos Úteis

```javascript
// No console do browser
// Popular dados de teste
window.executarSeedAbastecimento()

// Verificar logs
console.log('Logs do sistema:', window.logger)
```

## Configuração

### Variáveis de Ambiente
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Regras do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /abastecimentos/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Contribuição

Para contribuir com melhorias:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** as mudanças
4. **Teste** todas as funcionalidades
5. **Submeta** um Pull Request

## Suporte

Para dúvidas ou problemas:
- Abra uma **Issue** no GitHub
- Entre em contato com a equipe de desenvolvimento
- Consulte a documentação do Firebase

---

**Versão**: 1.0.0  
**Última Atualização**: Agosto 2024  
**Desenvolvido por**: Equipe PortalShare
