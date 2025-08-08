# Sistema de Gestão de Tripulação - Conexão UNK

## Visão Geral

O sistema de gestão de tripulação foi adaptado e integrado ao projeto **Conexão UNK** para gerenciar dados completos dos tripulantes, incluindo suas habilitações, certificados e vencimentos.

## Funcionalidades Principais

### 📊 Dashboard de Resumo
- **Total de Tripulantes**: Contagem geral de tripulantes cadastrados
- **Documentos Vencidos**: Alertas de documentos com vencimento expirado
- **Próximos Vencimentos**: Documentos que vencem em breve
- **CHT Vencidos**: Certificado de Habilitação Técnica vencido
- **CMA Vencidos**: Certificado Médico Aeronáutico vencido

### 👥 Gestão de Tripulantes
- **Cadastro Completo**: Dados pessoais, profissionais e de contato
- **Fotografia**: Upload e visualização de fotos dos tripulantes
- **Código ANAC**: Registro do código da Agência Nacional de Aviação Civil
- **Categorias**: AB (Piloto de Linha Aérea), PC (Piloto Comercial), CP (Copiloto), PP (Piloto Privado)

### 🎯 Habilitações e Certificados
- **CHT**: Certificado de Habilitação Técnica
- **CMA**: Certificado Médico Aeronáutico
- **Habilitações de Tipo**: Certificações específicas por aeronave
- **Inglês**: Certificação de proficiência em inglês
- **Status Automático**: Validação automática de vencimentos

### 🔍 Sistema de Busca
- Busca por nome, cargo, email ou código ANAC
- Filtros dinâmicos
- Visualização em cards responsivos

### ⚠️ Alertas de Vencimento
- **Documentos Vencidos**: Lista detalhada de documentos expirados
- **Próximos Vencimentos**: Alertas preventivos
- **Cores Indicativas**: Verde (válido), Amarelo (próximo vencimento), Vermelho (vencido)

### 📈 Estatísticas Detalhadas
- **Distribuição por Cargo**: Quantidade de tripulantes por função
- **Status das Habilitações**: Contagem por status de validade

## Dados de Exemplo Incluídos

### Tripulantes Cadastrados:
1. **WENDELL MUNIZ CANEDO SANTOS**
   - Cargo: Piloto Comandante
   - Código ANAC: 191100
   - Categoria: AB
   - Horas de Voo: 3.500h

2. **RODRIGO DE MORAIS TOSCANO**
   - Cargo: Piloto Comercial
   - Código ANAC: 113374
   - Categoria: PC
   - Horas de Voo: 2.800h

3. **MARINA COSTA SILVA**
   - Cargo: Copiloto
   - Código ANAC: 200455
   - Categoria: CP
   - Horas de Voo: 1.200h

## Estrutura de Arquivos

```
src/
├── components/
│   ├── tripulacao/
│   │   ├── GestaoTripulacao.tsx    # Componente principal
│   │   ├── TripulacaoCard.tsx      # Card de tripulante
│   │   ├── TripulanteModal.tsx     # Modal de cadastro
│   │   └── index.ts                # Exportações
│   └── ui/
│       ├── textarea.tsx            # Componente textarea
│       ├── tooltip.tsx             # Componente tooltip
│       ├── toaster.tsx             # Componente toaster
│       └── sonner.tsx              # Componente sonner
├── hooks/
│   └── useTheme.ts                 # Hook de tema
└── pages/
    └── GestaoTripulacao.tsx        # Página principal
```

## Tecnologias Utilizadas

- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **Lucide React** para ícones
- **Radix UI** para componentes base
- **React Router** para navegação

## Como Usar

1. **Acessar a página**: Navegue para `/tripulacao`
2. **Visualizar tripulantes**: Os cards mostram informações completas
3. **Adicionar novo tripulante**: Clique em "Novo Tripulante"
4. **Buscar tripulantes**: Use a barra de busca
5. **Verificar vencimentos**: Observe os alertas coloridos

## Status dos Documentos

- 🟢 **Válido**: Documento dentro do prazo
- 🟡 **Próximo Vencimento**: Documento próximo de vencer
- 🔴 **Vencido**: Documento com prazo expirado

## Responsividade

O sistema é totalmente responsivo e funciona em:
- 📱 Dispositivos móveis
- 💻 Tablets
- 🖥️ Desktops

## Integração com o Projeto

O sistema foi completamente integrado ao projeto **Conexão UNK** e utiliza:
- Layout consistente com o resto da aplicação
- Componentes UI padronizados
- Sistema de navegação existente
- Autenticação e proteção de rotas

## Próximas Melhorias

- [ ] Integração com banco de dados
- [ ] Notificações automáticas de vencimento
- [ ] Relatórios em PDF
- [ ] Histórico de alterações
- [ ] Backup automático de dados 