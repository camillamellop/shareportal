# Configuração da Empresa - Portal Share

## ✅ **Sistema de Configuração Implementado**

### **Dados da Share Brasil Configurados:**
- **Razão Social:** SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI
- **CNPJ:** 30.898.549/0001-06
- **Inscrição Municipal:** 102832
- **Endereço:** Av. Presidente Artur Bernardes, 1457 - Vila Ipase, Várzea Grande - MT, 78125-100

## **Funcionalidades Implementadas**

### **1. Página de Configuração** (`/financeiro/config`)

#### **📄 Interface Completa:**
- **Seção Logo:** Upload de logo da empresa (PNG, JPG, JPEG - máx 2MB)
- **Dados Principais:** Razão social, CNPJ, inscrição municipal, endereço completo
- **Contatos:** Telefone, e-mail, website (opcionais)
- **Pré-visualização:** Como aparecerá nos documentos

#### **🔧 Funcionalidades:**
✅ **Upload de Logo:** Integrado com Firebase Storage
✅ **Validação:** Campos obrigatórios e formatos de arquivo
✅ **Persistência:** Dados salvos no Firestore
✅ **Preview em Tempo Real:** Visualização do cabeçalho dos documentos

### **2. Serviço de Empresa** (`src/services/empresaService.ts`)

#### **🚀 Métodos Implementados:**
- `getConfig()` - Busca configuração da empresa
- `saveConfig()` - Salva configuração 
- `uploadLogo()` - Upload da logo para Firebase Storage
- `generateDocumentHeader()` - Gera cabeçalho para documentos texto
- `generateHTMLHeader()` - Gera cabeçalho HTML para documentos

#### **🔒 Segurança:**
- Validação de tamanho de arquivo (máx 2MB)
- Validação de tipo de arquivo (apenas imagens)
- Tratamento de erros completo

### **3. Integração com Documentos**

#### **📋 Recibo com Cabeçalho da Empresa:**
✅ **Pré-visualização Completa:** Modal com layout profissional
✅ **Cabeçalho Dinâmico:** Usa dados da configuração da empresa
✅ **Logo Integrada:** Exibe logo da empresa no cabeçalho
✅ **Layout Profissional:** Design padronizado para impressão

#### **📊 Estrutura do Cabeçalho nos Documentos:**
```
[LOGO]                    SHARE BRASIL SERVIÇOS AEROPORTUARIOS EIRELI
                          CNPJ: 30.898.549/0001-06 • Inscrição Municipal: 102832
                          Endereço: Av. Presidente Artur Bernardes, 1457 - Vila Ipase
                          Várzea Grande - MT, 78125-100
                          Tel: (xx) xxxx-xxxx • E-mail: contato@empresa.com.br
```

## **Configuração Firebase**

### **Storage:**
- **Pasta:** `empresa/` para logos
- **Nomeação:** `logo_empresa_{timestamp}.{extensao}`
- **URL Pública:** Gerada automaticamente

### **Firestore:**
- **Documento:** `config/empresa`
- **Campos:** Todos os dados da empresa
- **Timestamp:** `updatedAt` para controle de versão

## **Páginas que Usarão o Cabeçalho**

### **✅ Já Implementado:**
- **Recibos** - Pré-visualização com cabeçalho completo

### **🔄 Próximas Implementações:**
- **Relatórios de Viagem** - Cabeçalho nos relatórios
- **Documentos Oficiais** - Contratos, propostas, etc.
- **Relatórios Gerenciais** - Relatórios de conciliação
- **Comprovantes** - Comprovantes de pagamento

## **Benefícios do Sistema**

✅ **Padronização:** Todos os documentos com identidade visual única
✅ **Profissionalismo:** Layout consistente e profissional
✅ **Flexibilidade:** Fácil alteração de dados da empresa
✅ **Branding:** Logo da empresa em todos os documentos
✅ **Automatização:** Cabeçalho gerado automaticamente
✅ **Backup:** Dados seguros no Firebase

## **Como Usar**

### **1. Configurar Empresa:**
1. Acesse `/financeiro/config`
2. Preencha dados da empresa
3. Faça upload da logo
4. Visualize no preview
5. Salve as configurações

### **2. Nos Documentos:**
- O cabeçalho aparece automaticamente
- Logo e dados sempre atualizados
- Layout responsivo e profissional

### **3. Alterações:**
- Mudanças na configuração refletem em todos os documentos
- Histórico de versões no Firebase
- Backup automático da logo

## **Estrutura de Arquivos**

```
src/
├── services/
│   └── empresaService.ts          # Serviço principal
├── pages/financeiro/
│   ├── ConfigEmpresa.tsx          # Página de configuração
│   └── EmissaoRecibo.tsx          # Recibo com cabeçalho
└── types/
    └── conciliacao.ts             # Tipos relacionados
```

## **Próximos Passos Sugeridos**

1. **Relatórios de Viagem:** Adicionar cabeçalho nos relatórios
2. **Templates:** Criar templates para diferentes documentos  
3. **Assinatura Digital:** Integração com certificado digital
4. **Múltiplas Logos:** Suporte a logo colorida e monocromática
5. **Temas:** Diferentes layouts de cabeçalho
6. **Exportação PDF:** Geração automática de PDFs com cabeçalho

A configuração da empresa está **100% funcional** e pronta para uso! 🏢✨