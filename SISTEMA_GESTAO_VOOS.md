# Sistema de Gestão de Voos - Portal Share

## Visão Geral

Implementei um sistema completo de gestão de voos que segue o fluxo solicitado:

**Cotista → Solicita Voo → Coordenador Recebe Notificação → Programa Voo → Executa Voo → Registra no Diário**

## Estrutura do Sistema

### 1. **Solicitação de Voo** (`/agendamento`)
- **Usuário**: Cotistas
- **Funcionalidade**: Formulário para solicitar voos
- **Campos**:
  - Aeronave
  - Data e horário desejado
  - Origem/Destino
  - Número de passageiros
  - Prioridade (baixa, média, alta, urgente)
  - Observações
- **Status**: `solicitado` → Cria notificação para coordenador

### 2. **Coordenação de Voos** (`/coordenacao`)
- **Usuário**: Coordenador de voo
- **Funcionalidades**:
  - Dashboard com estatísticas
  - Visualizar solicitações pendentes
  - Aprovar/Rejeitar solicitações
  - Programar voos (designar piloto, horários, etc.)
  - Acompanhar voos em andamento
  - Histórico de voos concluídos

### 3. **Notificações em Tempo Real**
- **Componente**: `NotificacaoVoos` no Header
- **Funcionalidade**: 
  - Alertas para coordenadores sobre novas solicitações
  - Notificações para cotistas sobre status dos voos
  - Polling automático a cada 30 segundos

### 4. **Diário de Bordo** (`/diario`)
- **Integração Automática**: Voos concluídos aparecem automaticamente
- **Registro Manual**: Possibilidade de registrar voos extras
- **Funcionalidades**:
  - Registro detalhado de voos
  - Controle de horas totais das aeronaves
  - Histórico completo por aeronave

## Fluxo Completo

### Passo 1: Solicitação
1. Cotista acessa `/agendamento`
2. Preenche formulário de solicitação
3. Sistema cria registro com status `solicitado`
4. Notificação é enviada para coordenador

### Passo 2: Coordenação
1. Coordenador recebe notificação no Header
2. Acessa `/coordenacao` para ver solicitações
3. Pode aprovar, rejeitar ou programar o voo
4. Ao programar: designa piloto, define horários finais
5. Status muda para `programado`

### Passo 3: Execução
1. Voo aparece na aba "Programação" do coordenador
2. Status pode ser alterado para `em_andamento`
3. Coordenador pode clicar "Registrar no Diário" para ir direto ao formulário

### Passo 4: Registro no Diário
1. Sistema abre `/diario/adicionar-voo/{matricula}?plano_id={id}`
2. Formulário já vem preenchido com dados do plano
3. Piloto/coordenador completa dados técnicos (horas, combustível, etc.)
4. Ao salvar: voo vai para diário E plano é marcado como `concluido`

## Arquivos Principais

### Tipos e Interfaces
- `src/types/voo.ts` - Definições de tipos para todo o sistema

### Serviços
- `src/services/vooService.ts` - Lógica de negócio para voos
- `src/services/firestore.ts` - Integração com Firebase (existente)

### Páginas
- `src/pages/AgendamentoVoo.tsx` - Interface do cotista
- `src/pages/CoordenacaoVoos.tsx` - Interface do coordenador
- `src/pages/AdicionarVoo.tsx` - Registro no diário (modificado)

### Componentes
- `src/components/shared/NotificacaoVoos.tsx` - Sistema de notificações
- `src/components/dashboard/StatusVoos.tsx` - Dashboard na página inicial
- `src/components/layout/Header.tsx` - Notificações no header
- `src/components/layout/RightSidebar.tsx` - Menu de operações

## Funcionalidades Implementadas

✅ **Solicitação de Voo por Cotistas**
✅ **Notificações para Coordenador**
✅ **Dashboard de Coordenação**
✅ **Programação de Voos**
✅ **Status de Acompanhamento**
✅ **Integração com Diário de Bordo**
✅ **Fluxo Automático de Status**
✅ **Interface Responsiva**
✅ **Persistência no Firebase**

## Status dos Voos

- `solicitado` - Voo solicitado pelo cotista
- `aprovado` - Aprovado pelo coordenador
- `programado` - Voo programado com piloto designado
- `em_andamento` - Voo em execução
- `concluido` - Voo finalizado e no diário
- `cancelado` - Voo cancelado

## Dashboard na Página Inicial

A página inicial agora mostra:
- Cards com estatísticas de voos
- Lista de solicitações recentes
- Voos programados
- Acesso direto às funcionalidades principais

## Menu de Navegação

**RightSidebar** → **Operações de Voo**:
- Solicitar Voo
- Coordenação Voos  
- Diário de Bordo
- Controle de Abastecimento
- Gestão de Tripulação
- Documentos

## Próximos Passos Sugeridos

1. **Autenticação Real**: Integrar com sistema de usuários do Firebase
2. **Permissões**: Controlar acesso por perfil (cotista/coordenador/piloto)
3. **Calendário Visual**: Interface de calendário para visualizar voos
4. **Relatórios**: Relatórios de utilização por cotista/aeronave
5. **Notificações Push**: Notificações via email/SMS
6. **API de Meteorologia**: Integração com dados meteorológicos
7. **Backup Automático**: Sistema de backup dos dados críticos

O sistema está funcional e pronto para uso! 🚁✈️