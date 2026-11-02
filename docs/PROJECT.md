# Quiz Primários ACeAm — Documentação do Projeto

> **Versão:** 0.0.0 · **Última atualização:** Novembro 2026

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Funcionalidades](#funcionalidades)
6. [Banco de Dados (Firebase Firestore)](#banco-de-dados-firebase-firestore)
7. [Fluxo de Usuário](#fluxo-de-usuário)
8. [Painel do Administrador](#painel-do-administrador)
9. [Regras de Negócio](#regras-de-negócio)
10. [Segurança](#segurança)
11. [Scripts e Comandos](#scripts-e-comandos)
12. [Variáveis de Ambiente e Configuração](#variáveis-de-ambiente-e-configuração)
13. [Problemas Conhecidos e Melhorias Futuras](#problemas-conhecidos-e-melhorias-futuras)

---

## Visão Geral

O **Quiz Primários ACeAm** é uma aplicação web para realização de quizzes bíblicos na Fase Distrital da Associação Central Amazonas (ACeAm), voltada para crianças do ministério de Primários (faixa etária infantil adventista). 

A aplicação permite que representantes de igrejas distribuídas pelos distritos do Amazonas participem de forma digital de um quiz cronometrado, com gabarito e resultados armazenados em tempo real no Firebase. Um painel administrativo protegido por senha permite ao administrador visualizar, ordenar e revisar os resultados, além de abrir/fechar o acesso ao quiz.

---

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   Navegador                      │
│  ┌──────────────────────────────────────────┐   │
│  │           React 19 SPA (Vite)            │   │
│  │   ┌────────────┐  ┌──────────────────┐  │   │
│  │   │  Registro  │  │   Painel Admin   │  │   │
│  │   ├────────────┤  ├──────────────────┤  │   │
│  │   │    Quiz    │  │ Controle Status  │  │   │
│  │   ├────────────┤  └──────────────────┘  │   │
│  │   │  Sucesso   │                         │   │
│  │   └────────────┘                         │   │
│  └──────────────────────────────────────────┘   │
│                       │                          │
│                  Firebase SDK                    │
└───────────────────────┼──────────────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │     Firebase Firestore      │
          │  ┌──────────┐ ┌─────────┐  │
          │  │ results/ │ │settings/│  │
          │  └──────────┘ └─────────┘  │
          └────────────────────────────┘
```

A aplicação é uma **Single Page Application (SPA)** React pura, sem roteamento explícito — o estado é gerenciado por uma variável `view` que controla qual tela é renderizada. A comunicação com o backend ocorre exclusivamente via **Firebase Firestore** (NoSQL).

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | ^19.3.1 |
| DOM Renderer | React DOM | ^19.3.1 |
| Build Tool | Vite | ^8.3.5 |
| Estilização | Tailwind CSS | ^4.3.3 |
| Ícones | Lucide React | ^1.66.0 |
| Backend/DB | Firebase Firestore | ^13.1.0 |
| Linter | OxLint | ^1.89.0 |
| CSS Processor | PostCSS + Autoprefixer | ^8.x / ^10.x |

---

## Estrutura de Diretórios

```
quiz-aceam/
├── docs/                     # 📚 Documentação do projeto
│   ├── PROJECT.md            # Este arquivo — especificações gerais
│   └── SECURITY.md           # Relatório de segurança
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── App.jsx               # Componente principal (toda a lógica da aplicação)
│   ├── App.css               # Estilos globais da aplicação
│   ├── index.css             # Reset e estilos base
│   └── main.jsx              # Ponto de entrada React
├── dist/                     # Build de produção (gerado pelo Vite)
├── .oxlintrc.json            # Configuração do linter
├── index.html                # HTML base (entry point do Vite)
├── package.json              # Dependências e scripts
├── postcss.config.js         # Configuração do PostCSS
├── tailwind.config.js        # Configuração do Tailwind
└── vite.config.js            # Configuração do Vite
```

---

## Funcionalidades

### Módulo do Participante

| # | Funcionalidade | Descrição |
|---|---|---|
| 1 | **Cadastro** | Coleta nome completo, WhatsApp do responsável, distrito e igreja antes do início |
| 2 | **Seleção de Distrito/Igreja** | Lista hierárquica com +40 distritos e centenas de igrejas do Amazonas |
| 3 | **Quiz Cronometrado** | 20 questões de múltipla escolha com timer de 20 minutos (1.200 segundos) |
| 4 | **Envio Automático** | Quiz enviado automaticamente quando o tempo esgota |
| 5 | **Bloqueio de Status** | Tela de "Quiz Encerrado" exibida se o administrador fechar o acesso |
| 6 | **Tela de Sucesso** | Confirmação visual após envio bem-sucedido |

### Módulo Administrativo

| # | Funcionalidade | Descrição |
|---|---|---|
| 1 | **Autenticação por Senha** | Acesso via `prompt()` nativo do browser com senha estática |
| 2 | **Visualização em Tempo Real** | Resultados atualizam automaticamente via `onSnapshot` do Firestore |
| 3 | **Ranking Automático** | Ordenação: maior nota primeiro; em caso de empate, menor tempo primeiro |
| 4 | **Revisão de Respostas** | Expande linha do participante mostrando acertos/erros questão a questão |
| 5 | **Controle de Acesso** | Botão para abrir/fechar o quiz em tempo real para todos os participantes |

---

## Banco de Dados (Firebase Firestore)

### Projeto Firebase

| Campo | Valor |
|---|---|
| **Project ID** | `quiz-primarios-aceam` |
| **Auth Domain** | `quiz-primarios-aceam.firebaseapp.com` |
| **Storage Bucket** | `quiz-primarios-aceam.firebasestorage.app` |
| **Measurement ID** | `G-8WE3SVK3P1` |

### Coleções

#### `results` — Respostas dos Participantes

Cada documento é criado via `addDoc` (ID automático) quando o participante finaliza o quiz.

```jsonc
{
  "name": "João Silva",           // string — Nome completo
  "phone": "(92) 99999-9999",     // string — WhatsApp do responsável
  "district": "Compensa I",       // string — Distrito selecionado
  "church": "Compensa IV",        // string — Igreja selecionada
  "score": 18,                    // number — Acertos (0–20)
  "timeSpent": 743,               // number — Segundos utilizados (0–1200)
  "answers": {                    // map — Respostas por ID de questão
    "1": "C) Cobrador de impostos",
    "2": "B) Caim e Abel"
    // ...
  },
  "submittedAt": "2026-11-02T..." // timestamp — Data/hora de envio
}
```

#### `settings/status` — Controle Global do Quiz

Documento único com ID fixo `status`.

```jsonc
{
  "isOpen": true  // boolean — true = quiz aberto; false = quiz fechado
}
```

---

## Fluxo de Usuário

```
[Acesso à URL]
      │
      ▼
[Verifica isOpen em settings/status]
      │
   ┌──┴──┐
Fechado  Aberto
   │        │
   ▼        ▼
[Tela de   [Formulário de Cadastro]
 Bloqueio]        │
                  │ Preenche: nome, phone,
                  │ district, church
                  ▼
            [Clica INICIAR QUIZ]
                  │
                  ▼
          [Tela do Quiz — 20 min]
                  │
         ┌────────┴────────┐
      Timer=0         Clica Enviar
         │           (todas respondidas)
         └────────┬────────┘
                  ▼
         [handleSubmitQuiz()]
          Calcula score,
          salva em Firestore
                  │
                  ▼
          [Tela de Sucesso 🎉]
```

---

## Painel do Administrador

O administrador acessa a área clicando em "Acessar Área do Admin" e digitando a senha. O painel exibe:

- **Status atual** do quiz (aberto/fechado)
- **Botão de alternância** para abrir/fechar o quiz
- **Tabela de resultados** em tempo real com:
  - Posição no ranking (Nº)
  - Nome e WhatsApp do participante
  - Distrito e Igreja
  - Nota (X/20)
  - Tempo utilizado
  - Botão "Revisar" para ver respostas individuais

### Lógica de Ordenação (client-side)

```js
data.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score; // Nota decrescente
  return a.timeSpent - b.timeSpent;                  // Tempo crescente (desempate)
});
```

---

## Regras de Negócio

1. **Todos os campos são obrigatórios** no cadastro (nome, telefone, distrito, igreja)
2. **O quiz tem duração máxima de 20 minutos** — ao zerar o timer, o quiz é enviado automaticamente com as respostas marcadas até o momento
3. **O botão "Finalizar e Enviar" só é habilitado** quando todas as 20 questões são respondidas
4. **Não há controle de duplicidade** — o mesmo participante pode submeter múltiplas vezes
5. **A ordenação do ranking ocorre no cliente** (não usa `orderBy` do Firestore para evitar necessidade de índices compostos)
6. **O controle de abertura/fechamento do quiz é global** — afeta todos os usuários em tempo real

---

## Segurança

> ⚠️ Ver [SECURITY.md](./SECURITY.md) para o relatório completo de análise de segurança, vulnerabilidades identificadas e recomendações de correção.

### Resumo de Riscos Identificados

| Severidade | Problema |
|---|---|
| 🔴 Crítico | Chave de API Firebase exposta no código-fonte |
| 🔴 Crítico | Senha do administrador em texto plano no código |
| 🔴 Crítico | Ausência de regras de segurança no Firestore |
| 🟠 Alto | Sem autenticação real — qualquer pessoa pode acessar dados via API |
| 🟡 Médio | Sem validação server-side das respostas |
| 🟡 Médio | Sem limite de submissões por participante |

---

## Scripts e Comandos

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (localhost:5173)
npm run dev

# Build de produção (gera /dist)
npm run build

# Preview do build de produção
npm run preview

# Linting com OxLint
npm run lint
```

---

## Variáveis de Ambiente e Configuração

> ⚠️ **Atenção:** Atualmente a configuração do Firebase está hardcoded no arquivo `src/App.jsx`. O correto é usar variáveis de ambiente do Vite.

### Como deve ser configurado (recomendado)

1. Criar arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ADMIN_PASSWORD=senha_segura_aqui
```

2. Adicionar `.env` ao `.gitignore`
3. Referenciar no código via `import.meta.env.VITE_FIREBASE_API_KEY`

---

## Problemas Conhecidos e Melhorias Futuras

### Bugs Conhecidos
- [ ] Participante pode submeter o quiz múltiplas vezes sem restrição
- [ ] Timer continua rodando após o envio bem-sucedido se o componente for remontado

### Melhorias Planejadas
- [ ] Mover credenciais Firebase para variáveis de ambiente (`.env`)
- [ ] Implementar autenticação Firebase Authentication para o admin
- [ ] Adicionar regras de segurança no Firestore
- [ ] Implementar limite de uma submissão por participante (via regras do Firestore ou hash de telefone)
- [ ] Exportar resultados como CSV/Excel
- [ ] Adicionar confirmação antes do envio final
- [ ] Suporte a múltiplas rodadas/fases do quiz
- [ ] Internacionalização (i18n) para outros idiomas

