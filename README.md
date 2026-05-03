# VisionPC 🖥️

Assistente inteligente de montagem e compra de PCs, powered by Gemini AI.

## Sobre o projeto

VisionPC é um aplicativo mobile que auxilia o usuário a montar um computador do zero — comparando preços em lojas, verificando compatibilidade entre peças e oferecendo recomendações personalizadas por perfil (low-end, mid-end, high-end) e orçamento.

## Funcionalidades

- Assistente de montagem guiado por IA (Gemini 2.5 Flash)
- Verificação de compatibilidade entre peças em tempo real
- Comparação de preços em múltiplas lojas
- Recomendações por perfil: low-end, mid-end e high-end
- Fallback automático para Groq (Llama 3.3 70B) em caso de indisponibilidade
- Suporte a categorias: Processadores, Placas de Vídeo, Placas Mãe, Memória RAM, Fontes e Armazenamento

## Tecnologias

### Mobile
- React Native + Expo (SDK 54)
- TypeScript
- React Navigation (Stack)
- Expo Vector Icons

### Backend
- Node.js + Express
- Axios
- CORS

### AI Engine
- Python 3
- Gemini 2.5 Flash (Google AI)
- Groq — Llama 3.3 70B (fallback)
- BeautifulSoup4 (scraping de preços)
- python-dotenv

## Estrutura do projeto

```
pc-assistant-app/
├── ai_engine/
│   ├── main.py              # Engine principal de IA
│   ├── test_models.py       # Script de teste dos modelos
│   └── requirements.txt     # Dependências Python
├── backend/
│   ├── server.js            # Servidor Node.js + Express
│   └── package.json
├── mobile/
│   ├── src/
│   │   └── screens/
│   │       ├── Home.tsx         # Tela inicial com categorias
│   │       ├── Login.tsx        # Tela de login
│   │       └── AIAssistant.tsx  # Fluxo guiado de montagem
│   ├── App.tsx
│   └── package.json
├── .gitignore
├── vscode-extensions.txt
└── README.md
```

## Pré-requisitos

- Node.js 18+
- Python 3.10+
- Expo CLI
- Android Studio (emulador) ou dispositivo físico
- Chaves de API: Google AI e Groq

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/Thiago13721/pc-assistant-app.git
cd pc-assistant-app
```

### 2. Backend

```bash
cd backend
npm install
```

### 3. Mobile

```bash
cd mobile
npm install
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

### 5. Variáveis de ambiente

Cria o arquivo `.env` dentro da pasta `ai_engine`:

```env
GOOGLE_API_KEY=sua_chave_google_aqui
GROQ_API_KEY=sua_chave_groq_aqui
```

> Nunca compartilhe suas chaves de API. O arquivo `.env` está no `.gitignore`.

## Como rodar

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Mobile:**
```bash
cd mobile
npx expo start
```

> Para emulador Android Studio, o backend é acessado via `http://10.0.2.2:3000`.  
> Para dispositivo físico, use o IP local da máquina (ex: `http://192.168.0.X:3000`).

## Extensões VS Code recomendadas

As extensões utilizadas no desenvolvimento estão listadas em `vscode-extensions.txt`.

Para instalar todas de uma vez no PowerShell:

```powershell
Get-Content vscode-extensions.txt | ForEach-Object { code --install-extension $_ }
```

## Commits

Este projeto segue o padrão de commits:

| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `refactor:` | Melhoria de código |
| `style:` | Mudança visual |
| `docs:` | Documentação |
| `chore:` | Configuração e dependências |

## Licença

Projeto pessoal em desenvolvimento. Todos os direitos reservados.