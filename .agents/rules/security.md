---
trigger: always_on
---

# Diretrizes de Segurança — Quiz Primários ACeAm

## Credenciais e Segredos

- **NUNCA** commitar arquivos `.env` ou qualquer arquivo com credenciais reais no Git
- **NUNCA** sugerir hardcoding de API keys, senhas ou tokens no código-fonte
- Ao modificar `src/App.jsx`, verificar se `firebaseConfig` ainda usa `import.meta.env.*`
- A senha do admin (`@aceam2026`) está comprometida — sempre alertar o usuário sobre isso

## Firestore

- Qualquer escrita no Firestore deve ser acompanhada de validação de dados
- Lembrar sempre que as regras de segurança do Firestore precisam ser configuradas no Console
- O gabarito (`QUESTIONS[].answer`) não deve estar exposto no bundle de produção

## Dados Sensíveis

- Este projeto armazena **nomes e telefones de responsáveis por crianças** — tratar com cuidado extra
- Não logar dados pessoais no console em produção
- Não exibir dados de outros participantes para usuários não-admin

## Ao Modificar Arquivos Críticos

Antes de modificar `src/App.jsx`, `index.html` ou `vite.config.js`, considerar:
1. A mudança expõe algum dado ou credencial?
2. A mudança bypasseia algum controle de acesso existente?
3. O `docs/SECURITY.md` precisa ser atualizado?

