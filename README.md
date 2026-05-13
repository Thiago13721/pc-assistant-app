# ForgePC 🖥️

Assistente inteligente de montagem e compra de PCs, powered by Gemini AI.

## Sobre o projeto

ForgePC é um aplicativo mobile que auxilia o usuário a montar um computador do zero — comparando preços em lojas, verificando compatibilidade entre peças e oferecendo recomendações personalizadas por perfil (low-end, mid-end, high-end) e orçamento.

A IA funciona como um assistente técnico integrado em todas as telas: sugere builds completos, analisa compatibilidade entre peças, compara preços em tempo real e orienta tanto iniciantes quanto usuários com experiência em hardware.

---

## Funcionalidades

- Login e cadastro de usuário
- Assistente de montagem guiado por IA (Gemini 2.5 Flash + Groq fallback)
- Fluxo guiado: escolha de tier (low/mid/high-end) + orçamento + preferências
- Verificação de compatibilidade entre peças em tempo real
- Comparação de preços em 4 lojas (KaBuM, Pichau, Terabyte, Mercado Livre)
- Catálogo de peças por categoria com busca e filtro
- Tela de montagem (PCBuild) com checklist visual das peças
- Carrinho com controle de quantidade e total em tempo real
- Estado global compartilhado entre telas via Zustand
- Fallback automático Gemini → Groq em caso de erro 503
- Encoding UTF-8 corrigido para acentuação em português

---

## Telas do aplicativo

| Tela | Descrição |
|---|---|
| `Login` | Autenticação do usuário |
| `Home` | Categorias de peças, acesso ao build, carrinho e IA |
| `Category` | Lista de produtos por categoria com busca |
| `ItemDetail` | Detalhe da peça, preços por loja, análise da IA, botões de adicionar ao carrinho e ao build |
| `PCBuild` | Checklist visual das 8 peças, total estimado e análise completa do build pela IA |
| `AIAssistant` | Fluxo guiado de montagem: tier → orçamento → preferências → resultado |
| `Cart` | Carrinho com quantidade, subtotal por item e total geral |
| `Checkout` | Finalização da compra com dados pessoais e resumo |
| `Adresses` | Adição de endereços para entrega |
| `Orders` | Meus pedidos |
| `Profile` | Seu perfil |
| `Register`| Faça o seu cadastro |
| `SaveBuilds`| Salva suas builds que montou |

---

## Arquitetura

```
App Mobile (Expo/React Native)
        ↓ HTTPS
Backend Node.js + Express (Render)
        ↓ HTTP
AI Engine Python + FastAPI (Render)
        ↓
Gemini 2.5 Flash → fallback → Groq Llama 3.3 70B
```

---

## Tecnologias

### Mobile
- React Native + Expo (SDK 54)
- TypeScript
- React Navigation (Stack)
- Zustand (estado global — carrinho e build)
- Expo Vector Icons (MaterialCommunityIcons)
- Axios

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- Supabase (PostgreSQL)
- Axios
- JWT (autenticação)
- CORS

### AI Engine
- Python 3
- FastAPI + Uvicorn (servidor HTTP)
- Gemini 2.5 Flash (Google AI) — modelo principal
- Groq — Llama 3.3 70B — fallback automático
- BeautifulSoup4 (scraping de preços)
- python-dotenv

### Deploy
- Render (backend Node + AI Engine Python — serviços separados)
- Supabase (banco de dados PostgreSQL)

---

## Estrutura do projeto

```
pc-assistant-app/
├── ai_engine/
│   ├── api.py               # FastAPI — expõe endpoint HTTP da IA
│   ├── main.py              # Engine principal (Gemini + Groq fallback)
│   ├── test_models.py       # Script de teste dos modelos
│   └── requirements.txt     # Dependências Python
├── backend/
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco de dados
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── aiController.ts      # Chama AI Engine via HTTP
│   │   │   ├── authController.ts    # Login e cadastro
│   │   │   └── priceController.ts   # Consulta de preços
│   │   ├── routes/
│   │   │   ├── aiRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   └── priceRoutes.ts
│   │   └── services/
│   │       └── db.ts                # Instância do Prisma
│   ├── server.ts
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Category.tsx
│   │   │   ├── ItemDetail.tsx
│   │   │   ├── PCBuild.tsx
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   ├── Addresses.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── SavedBuilds.tsx
│   │   │   ├── Security.tsx
│   │   │   └── Support.tsx
│   │   ├── store/
│   │   │   └── store.ts             # Zustand — estado global (carrinho + build)
│   │   ├── services/
│   │   │   └── cepService.ts        # Auto-preenchimento de CEP (ViaCEP)
│   │   └── utils/
│   │       └── masks.ts             # Máscaras de input (CPF, telefone, CEP)
│   ├── App.tsx
│   └── package.json
├── .gitignore
├── vscode-extensions.txt
└── README.md
```

---

## Pré-requisitos

### 1. Git
Download: https://git-scm.com/download/win

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 2. Node.js (versão 18 ou superior)
Download: https://nodejs.org

```bash
node --version
npm --version
```

### 3. Yarn
```bash
npm install -g yarn
yarn --version
```

### 4. Expo CLI
```bash
npm install -g expo-cli
```

### 5. Python (versão 3.10 ou superior)
Download: https://www.python.org/downloads

> Marque a opção **"Add Python to PATH"** durante a instalação.

```bash
python --version
```

### 6. Java JDK (versão 17 ou superior)
Download: https://www.oracle.com/java/technologies/downloads

```bash
java --version
```

### 7. Android Studio
Download: https://developer.android.com/studio

Após instalar:
1. Abre o Android Studio
2. Vai em **More Actions → Virtual Device Manager**
3. Cria um emulador (recomendado: Pixel 6, API 34)
4. Configura a variável de ambiente `ANDROID_HOME`:
   - Caminho padrão Windows: `C:\Users\SeuUsuario\AppData\Local\Android\Sdk`
   - Adiciona ao PATH: `%ANDROID_HOME%\platform-tools`

```bash
adb --version
```

### 8. VS Code (recomendado)
Download: https://code.visualstudio.com

```powershell
Get-Content vscode-extensions.txt | ForEach-Object { code --install-extension $_ }
```

---

## Instalação do projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Thiago13721/pc-assistant-app.git
cd pc-assistant-app
```

### 2. Backend

```bash
cd backend
yarn install
```

### 3. Mobile

```bash
cd mobile
yarn install
```

### 4. AI Engine

```bash
cd ai_engine

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

---

## Variáveis de ambiente

### `ai_engine/.env`
```env
GOOGLE_API_KEY=sua_chave_google_aqui
GROQ_API_KEY=sua_chave_groq_aqui
```

### `backend/.env`
```env
DATABASE_URL=sua_url_supabase
DIRECT_URL=sua_url_direta_supabase
PORT=3000
JWT_SECRET=seu_jwt_secret
AI_ENGINE_URL=http://localhost:8000
```

> Nunca compartilhe seus arquivos `.env`. Eles estão no `.gitignore`.

Como obter as chaves:
- **Google AI (Gemini):** https://aistudio.google.com/app/apikey
- **Groq:** https://console.groq.com/keys

---

## Como rodar localmente

**Terminal 1 — AI Engine:**
```bash
cd ai_engine
venv\Scripts\activate
uvicorn api:app --reload --port 8000
```

**Terminal 2 — Backend:**
```bash
cd backend
yarn dev  ou  npm run dev
```

**Terminal 3 — Mobile:**
```bash
cd mobile
npx expo start
```

> Para emulador Android Studio, o backend é acessado via `http://10.0.2.2:3000`.
> Para dispositivo físico, use o IP local da máquina (ex: `http://192.168.0.X:3000`).

---

## Deploy (Render)

O projeto usa dois serviços separados no Render:

### Serviço 1 — Backend Node.js
| Campo | Valor |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm start` |

Variáveis de ambiente no Render:
```
DATABASE_URL=...
DIRECT_URL=...
JWT_SECRET=...
AI_ENGINE_URL=https://sua-url-ia.onrender.com
```

### Serviço 2 — AI Engine Python
| Campo | Valor |
|---|---|
| Root Directory | `ai_engine` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn api:app --host 0.0.0.0 --port $PORT` |

Variáveis de ambiente no Render:
```
GOOGLE_API_KEY=...
GROQ_API_KEY=...
```

---

## Commits

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `refactor:` | Melhoria de código |
| `style:` | Mudança visual |
| `docs:` | Documentação |
| `chore:` | Configuração e dependências |

---

## Licença

Projeto pessoal em desenvolvimento. Todos os direitos reservados.