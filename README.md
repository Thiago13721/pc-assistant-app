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

---

## Pré-requisitos

Instale as ferramentas abaixo antes de configurar o projeto.

### 1. Git
Download: https://git-scm.com/download/win

Após instalar, configure seu usuário:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 2. Node.js (versão 18 ou superior)
Download: https://nodejs.org

Verificar instalação:
```bash
node --version
npm --version
```

### 3. Yarn
```bash
npm install -g yarn
```

Verificar instalação:
```bash
yarn --version
```

### 4. Expo CLI
```bash
npm install -g expo-cli
```

### 5. Python (versão 3.10 ou superior)
Download: https://www.python.org/downloads

> Marque a opção **"Add Python to PATH"** durante a instalação.

Verificar instalação:
```bash
python --version
```

### 6. Java JDK (versão 17 ou superior)
Download: https://www.oracle.com/java/technologies/downloads

> Necessário para o Android Studio funcionar.

Verificar instalação:
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
   - Adiciona ao PATH do sistema: `%ANDROID_HOME%\platform-tools`

Verificar instalação:
```bash
adb --version
```

### 8. VS Code (recomendado)
Download: https://code.visualstudio.com

Para instalar todas as extensões usadas no projeto:
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

Como obter as chaves:
- **Google AI (Gemini):** https://aistudio.google.com/app/apikey
- **Groq:** https://console.groq.com/keys

---

## Como rodar

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Mobile:**
```bash
cd mobile
npx expo start
```

> Para emulador Android Studio, o backend é acessado via `http://10.0.2.2:3000`.  
> Para dispositivo físico, use o IP local da máquina (ex: `http://192.168.0.X:3000`).

---

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

---

## Licença

Projeto pessoal em desenvolvimento. Todos os direitos reservados.