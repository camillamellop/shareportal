# Portal Share Brasil

Portal do Colaborador - Sistema de gerenciamento para empresa de aviação.

## 🚀 Tecnologias

- **React 18** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Shadcn/ui** - Componentes UI
- **Firebase** - Backend (Firestore, Storage, Auth)
- **React Router** - Roteamento
- **Lucide React** - Ícones

## 📋 Funcionalidades

### 🛩️ Diário de Bordo
- Gerenciamento de aeronaves
- Registro de voos
- Estatísticas de voo
- Navegação mensal

### 👥 Gestão de Contatos
- Agenda de contatos
- Clientes e fornecedores
- Hotéis e postos de combustível
- Sistema de aniversários

### 📊 Dashboard
- Widget de clima (Meteoblue API)
- Estatísticas em tempo real
- Navegação rápida

### 👤 Perfil do Usuário
- Upload de foto de perfil
- Informações pessoais
- Configurações

### 🔧 Recursos Técnicos
- Autenticação anônima (Firebase)
- Upload de arquivos (Firebase Storage)
- Banco de dados em tempo real (Firestore)
- Interface responsiva
- PWA (Progressive Web App)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/camillamellop/portalshare.git
cd portalshare
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_METEOBLUE_API_KEY=sua_meteoblue_api_key
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse o projeto**
Abra [http://localhost:8085](http://localhost:8085) no seu navegador.

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── layout/         # Layout principal
│   ├── ui/            # Componentes UI (shadcn)
│   ├── weather/       # Widget de clima
│   └── shared/        # Componentes compartilhados
├── pages/             # Páginas da aplicação
├── services/          # Serviços (Firebase, APIs)
├── hooks/             # Custom hooks
├── utils/             # Utilitários
├── data/              # Dados estáticos
└── integrations/      # Configurações de integração
```

## 🔥 Firebase Setup

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative os serviços:
   - **Authentication** (Anonymous)
   - **Firestore Database**
   - **Storage**
3. Configure as regras de segurança
4. Adicione as credenciais no arquivo `.env.local`

## 📱 PWA

O projeto está configurado como PWA com:
- Manifest.json
- Service Worker
- Ícones responsivos
- Instalação offline

## 🎨 Design System

- **Cores**: Sistema de cores consistente
- **Tipografia**: Inter font
- **Componentes**: Shadcn/ui
- **Ícones**: Lucide React
- **Responsividade**: Mobile-first

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 📄 Licença

Este projeto é privado e pertence à Portal Share Brasil.

## 👥 Desenvolvimento

- **Desenvolvedor**: Camilla Mello
- **Empresa**: Portal Share Brasil
- **Versão**: 1.0.0

---

© 2024 Portal Share Brasil. Todos os direitos reservados.
