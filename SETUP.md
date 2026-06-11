# Setup Guide — Affiliates Dashboard

## Visão geral

Esta aplicação lê dados de 4 Google Sheets e exibe um dashboard protegido por senha,
onde cada afiliado acessa apenas seus próprios resultados.

---

## Passo 1 — Converter as planilhas para Google Sheets

1. Abra o Google Drive e faça upload dos 4 arquivos `.xlsx`
2. Clique com o botão direito em cada arquivo → **Abrir com → Planilhas Google**
3. Isso cria 4 Google Sheets separados (mantenha a estrutura original intacta)
4. Copie o **ID** de cada planilha da URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_É_O_ID/edit
   ```

---

## Passo 2 — Criar Service Account no Google Cloud

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto (ex: `affiliates-dashboard`)
3. Vá em **APIs & Services → Library** e ative a **Google Sheets API**
4. Vá em **APIs & Services → Credentials → Create Credentials → Service Account**
5. Dê um nome e clique em **Create and Continue**
6. Na seção **Keys**, clique em **Add Key → Create new key → JSON** e salve o arquivo

---

## Passo 3 — Compartilhar as planilhas com a Service Account

1. Abra o arquivo JSON da service account e copie o campo `client_email`
   (parece: `name@project.iam.gserviceaccount.com`)
2. Em cada uma das 4 planilhas, clique em **Compartilhar**
3. Cole o `client_email` e dê permissão de **Leitor (Viewer)**

---

## Passo 4 — Gerar senhas para os afiliados

Para cada afiliado, execute:

```bash
npm install
npm run hash-password
```

Copie o hash gerado. Você vai precisar dele no Passo 6.

---

## Passo 5 — Fazer deploy no Vercel

1. Crie um repositório no GitHub e faça push desta pasta
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
3. Importe o repositório e clique em **Deploy**

---

## Passo 6 — Configurar variáveis de ambiente no Vercel

No Vercel, vá em **Project → Settings → Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `NEXTAUTH_SECRET` | String aleatória (gere com: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL do seu projeto (ex: `https://affiliates.vercel.app`) |
| `SHEETS_SESSIONS_ID` | ID da planilha de Sessões |
| `SHEETS_TRIALS_ID` | ID da planilha de Trials |
| `SHEETS_NP_ID` | ID da planilha de New Payments |
| `SHEETS_NS_ID` | ID da planilha de New Sellers |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Conteúdo do arquivo JSON da service account (em uma linha só) |
| `USERS_JSON` | JSON com os usuários (veja abaixo) |

### Formato do USERS_JSON

```json
[
  {
    "username": "partner-code-do-afiliado",
    "password_hash": "$2b$10$HASH_GERADO_NO_PASSO_4",
    "partner_code": "partner-code-do-afiliado",
    "name": "Nome do Afiliado"
  },
  {
    "username": "outro-afiliado",
    "password_hash": "$2b$10$OUTRO_HASH",
    "partner_code": "outro-afiliado",
    "name": "Nome do Outro Afiliado"
  }
]
```

> **Importante:** o `username` e `partner_code` devem ser iguais ao código que aparece
> na coluna das planilhas (ex: `agencia-moda-web`).

---

## Passo 7 — Rediploiar após configurar as variáveis

No Vercel, após salvar as variáveis, clique em **Redeploy** para aplicar as configurações.

---

## Adicionar novos afiliados

1. Execute `npm run hash-password` e gere a senha
2. Adicione um novo objeto ao `USERS_JSON` no Vercel
3. Clique em **Redeploy**

## Atualizar os dados semanalmente

Apenas continue preenchendo as planilhas como de costume.
O dashboard busca os dados diretamente do Google Sheets a cada acesso
(com cache de 5 minutos).
