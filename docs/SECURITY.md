# Relatório de Segurança — Quiz Primários ACeAm

> **Gerado por:** Agente de Segurança Automatizado  
> **Data:** Novembro 2026  
> **Versão analisada:** 0.0.0  
> **Escopo:** Análise estática de código, dependências e configurações

---

## Índice

1. [Sumário Executivo](#sumário-executivo)
2. [Vulnerabilidades Críticas](#vulnerabilidades-críticas)
3. [Vulnerabilidades Altas](#vulnerabilidades-altas)
4. [Vulnerabilidades Médias](#vulnerabilidades-médias)
5. [Vulnerabilidades Baixas](#vulnerabilidades-baixas)
6. [Recomendações de Correção](#recomendações-de-correção)
7. [Checklist de Segurança](#checklist-de-segurança)

---

## Sumário Executivo

| Severidade | Qtd | Status |
|---|---|---|
| 🔴 Crítico | 3 | Requer ação imediata |
| 🟠 Alto | 2 | Requer ação em curto prazo |
| 🟡 Médio | 3 | Planejar correção |
| 🔵 Baixo | 2 | Monitorar |
| **Total** | **10** | |

---

## Vulnerabilidades Críticas

### [SEC-001] 🔴 API Key Firebase exposta no código-fonte

**Arquivo:** `src/App.jsx` — linhas 8–16  
**Severidade:** Crítica  
**CWE:** CWE-798 (Hard-coded Credentials)

**Descrição:**  
A configuração completa do Firebase, incluindo `apiKey`, `appId` e `messagingSenderId`, está hardcoded diretamente no código-fonte. Qualquer pessoa com acesso ao repositório ou ao bundle JavaScript gerado pelo build tem acesso a essas credenciais.

```js
// ❌ VULNERÁVEL — Credenciais em texto plano no código
const firebaseConfig = {
  apiKey: "AIzaSyA4wFtEl0PfN8zPSyr6mUpXqgJSA56CDrI",
  authDomain: "quiz-primarios-aceam.firebaseapp.com",
  projectId: "quiz-primarios-aceam",
  ...
};
```

**Impacto:**
- Abuso da API key para uso excessivo gerando custos
- Acesso não autorizado ao projeto Firebase
- Manipulação ou exclusão de dados do Firestore
- Criação de documentos falsos no banco de dados

**Correção:**
```env
# .env (nunca comitar no Git)
VITE_FIREBASE_API_KEY=AIzaSy...
```
```js
// ✅ SEGURO — Via variável de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  ...
};
```

---

### [SEC-002] 🔴 Senha do administrador em texto plano

**Arquivo:** `src/App.jsx` — linha 368  
**Severidade:** Crítica  
**CWE:** CWE-259 (Use of Hard-coded Password)

**Descrição:**  
A senha do administrador (`@aceam2026`) está hardcoded no código-fonte e é comparada diretamente via `prompt()` do browser.

```js
// ❌ VULNERÁVEL
const pwd = prompt("Senha do administrador:");
if (pwd === "@aceam2026") { ... }
```

**Impacto:**
- Qualquer pessoa com acesso ao código-fonte (incluindo o bundle minificado) pode extrair a senha
- Sem proteção contra força bruta
- Sem logs de tentativas de acesso
- Sem expiração de sessão

**Correção recomendada:**  
Usar Firebase Authentication com conta de administrador real, ou ao menos hashear a senha e validar server-side via Firebase Functions.

---

### [SEC-003] 🔴 Ausência de Regras de Segurança no Firestore

**Arquivo:** Configuração do Firebase (não está no repositório)  
**Severidade:** Crítica  
**CWE:** CWE-284 (Improper Access Control)

**Descrição:**  
Sem regras de segurança configuradas no Firestore, qualquer pessoa com a `apiKey` (que está exposta — ver SEC-001) pode:
- Ler **todos** os dados de todos os participantes
- Criar documentos falsos simulando participantes
- Modificar ou deletar resultados existentes
- Alterar o status do quiz (`settings/status`)

**Regras mínimas recomendadas para o Firestore:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Participantes podem criar resultados, mas não ler/editar
    match /results/{docId} {
      allow create: if request.resource.data.keys().hasAll(['name','phone','district','church','score','timeSpent','answers','submittedAt'])
                    && request.resource.data.score is int
                    && request.resource.data.score >= 0
                    && request.resource.data.score <= 20;
      allow read, update, delete: if false; // Somente admin autenticado via Functions
    }

    // Todos podem ler o status (saber se o quiz está aberto)
    match /settings/status {
      allow read: if true;
      allow write: if false; // Somente via Firebase Functions com admin auth
    }
  }
}
```

---

## Vulnerabilidades Altas

### [SEC-004] 🟠 Ausência de validação server-side das respostas

**Arquivo:** `src/App.jsx` — linhas 177–195  
**Severidade:** Alta  
**CWE:** CWE-602 (Client-Side Enforcement of Server-Side Security)

**Descrição:**  
O cálculo da pontuação (`score`) é realizado inteiramente no cliente (browser). O gabarito completo está exposto no código-fonte. Um participante mal-intencionado pode:
1. Inspecionar o código-fonte e ver todas as respostas corretas
2. Manipular o estado da aplicação via DevTools para enviar um score adulterado

```js
// ❌ VULNERÁVEL — Gabarito e cálculo expostos no cliente
const QUESTIONS = [
  { id: 1, ..., answer: "C) Cobrador de impostos" }, // gabarito visível!
  ...
];

// O score é calculado no browser e enviado direto ao Firestore
await addDoc(collection(db, 'results'), {
  ...formData,
  score, // ← valor calculado localmente, pode ser alterado
  ...
});
```

**Correção:**  
Mover o gabarito para uma Firebase Cloud Function. O cliente envia apenas as respostas brutas e a Function calcula o score server-side.

---

### [SEC-005] 🟠 Sem limite de submissões por participante

**Arquivo:** `src/App.jsx` — linhas 161–170, 176–195  
**Severidade:** Alta  
**CWE:** CWE-770 (Allocation of Resources Without Limits)

**Descrição:**  
Não existe nenhum mecanismo que impeça um participante de submeter o quiz múltiplas vezes. O formulário de registro não valida duplicatas. Isso permite:
- Múltiplas submissões do mesmo participante para melhorar o ranking
- Ataque de flood (DoD) no Firestore gerando documentos infinitos

**Correção:**  
```js
// Opção 1: Regra no Firestore (verificar por telefone)
// Opção 2: Verificar existência antes de salvar
const existing = await getDocs(
  query(collection(db, 'results'), where('phone', '==', formData.phone))
);
if (!existing.empty) {
  alert("Este número já realizou o quiz!");
  return;
}
```

---

## Vulnerabilidades Médias

### [SEC-006] 🟡 Uso de `prompt()` para coleta de senha

**Arquivo:** `src/App.jsx` — linha 367  
**Severidade:** Média  
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)

**Descrição:**  
O uso de `window.prompt()` para coletar a senha do admin é inadequado pois a senha fica visível em texto plano na caixa de diálogo do browser e pode ser capturada por extensões maliciosas.

---

### [SEC-007] 🟡 Ausência de Content Security Policy (CSP)

**Arquivo:** `index.html`  
**Severidade:** Média  
**CWE:** CWE-116 (Improper Encoding or Escaping of Output)

**Descrição:**  
O arquivo `index.html` não define um header ou meta tag de Content Security Policy. Isso aumenta o risco de ataques XSS (Cross-Site Scripting).

**Correção:**
```html
<!-- Adicionar ao <head> do index.html -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://*.firebaseio.com;
           connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com;
           style-src 'self' 'unsafe-inline';">
```

---

### [SEC-008] 🟡 Tailwind CSS carregado via CDN externo

**Arquivo:** `index.html` — linha 11  
**Severidade:** Média  
**CWE:** CWE-829 (Inclusion of Functionality from Untrusted Control Sphere)

**Descrição:**  
O Tailwind CSS é carregado de `https://cdn.tailwindcss.com` em vez de ser bundled pelo Vite. Isso cria dependência de terceiro externo e pode introduzir scripts maliciosos se o CDN for comprometido (Supply Chain Attack).

**Correção:**  
Remover o `<script>` do CDN e usar o Tailwind via PostCSS (já está nas dependências do projeto como `@tailwindcss/postcss`). Importar em `src/index.css`:
```css
@import "tailwindcss";
```

---

## Vulnerabilidades Baixas

### [SEC-009] 🔵 Informações de debug expostas no console

**Arquivo:** `src/App.jsx` — linhas 118, 156  
**Severidade:** Baixa  
**CWE:** CWE-532 (Insertion of Sensitive Information into Log File)

**Descrição:**  
Mensagens de `console.log` com detalhes de erros internos ficam visíveis no DevTools do browser, podendo revelar estrutura interna da aplicação.

**Correção:**  
Remover logs de debug em produção ou usar variável de ambiente para condicioná-los:
```js
if (import.meta.env.DEV) console.log("Debug:", error);
```

---

### [SEC-010] 🔵 Favicon referência ao Vite (vite.svg)

**Arquivo:** `index.html` — linha 6  
**Severidade:** Baixa  

**Descrição:**  
O favicon ainda aponta para `vite.svg`, revelando o framework de build utilizado. Embora seja baixo risco, contribui para fingerprinting do sistema.

**Correção:**  
Substituir por um favicon próprio do projeto (já existe `public/favicon.svg`):
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

---

## Recomendações de Correção

### Prioridade Imediata (antes do próximo evento)

1. **Configurar regras no Firestore** (SEC-003) — pode ser feito no Console do Firebase sem alterar código
2. **Remover a senha do código** e usar Firebase Authentication (SEC-002)
3. **Mover credenciais para `.env`** e adicionar `.env` ao `.gitignore` (SEC-001)

### Curto Prazo (próxima versão)

4. Implementar verificação de duplicidade por número de telefone (SEC-005)
5. Mover cálculo de score para Firebase Cloud Function (SEC-004)
6. Remover CDN do Tailwind e usar bundle local (SEC-008)

### Médio Prazo

7. Adicionar Content Security Policy (SEC-007)
8. Remover `console.log` em produção (SEC-009)
9. Atualizar favicon (SEC-010)

---

## Checklist de Segurança

### Configuração e Credenciais
- [ ] Credenciais Firebase em variáveis de ambiente (`.env`)
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Senha do admin removida do código
- [ ] Firebase Authentication configurado para admin

### Banco de Dados
- [ ] Regras de segurança do Firestore configuradas e testadas
- [ ] Validação de dados no lado do servidor
- [ ] Limite de taxa de criação de documentos

### Aplicação
- [ ] Content Security Policy configurada
- [ ] Tailwind carregado localmente (sem CDN)
- [ ] Logs de debug removidos do build de produção
- [ ] Verificação de duplicidade de participantes

### Infraestrutura
- [ ] HTTPS habilitado no host de produção
- [ ] Domínio autorizado no Firebase Authentication
- [ ] Revisão periódica de acessos ao Firebase Console

