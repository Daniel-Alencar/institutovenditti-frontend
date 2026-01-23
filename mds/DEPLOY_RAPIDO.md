# ⚡ Deploy Rápido - 3 Comandos

Escolha sua plataforma favorita e siga os 3 passos:

---

## 🔥 VERCEL (RECOMENDADO)

### Via Terminal - 3 comandos:

```bash
# 1. Instalar CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Produção
vercel --prod
```

**✅ Pronto! URL gerada automaticamente!**

### Via Web - Arrasta e solta:

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Arraste a pasta do projeto
4. Configure variável: `VITE_ADMIN_PASSWORD=sua_senha`
5. Deploy automático!

---

## 🚀 NETLIFY

### Via Terminal:

```bash
# 1. Instalar CLI
npm install -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod
```

### Via Web:

1. Acesse: https://netlify.com
2. Faça login
3. Arraste a pasta `dist/` (depois de `npm run build`)
4. Configure variável: `VITE_ADMIN_PASSWORD=sua_senha`

---

## 📦 GITHUB PAGES

```bash
# 1. Instalar
npm install --save-dev gh-pages

# 2. Adicionar ao package.json "scripts":
"deploy": "gh-pages -d dist"

# 3. Deploy
npm run build && npm run deploy
```

Depois habilite Pages em: Settings → Pages → Branch: gh-pages

---

## ⚙️ Variáveis de Ambiente

**Em TODAS as plataformas, configure:**

```env
VITE_ADMIN_PASSWORD=sua_senha_segura_aqui
```

**Como configurar:**

- **Vercel:** Settings → Environment Variables
- **Netlify:** Site settings → Environment variables
- **GitHub Pages:** Não suporta variáveis server-side (use .env.local local)

---

## 🔍 Verificar Deploy

Após deploy, teste:

1. Acesse a URL gerada
2. Teste navegação normal
3. Acesse admin: `?admin=true`
4. Faça login com a senha configurada
5. Teste responsividade mobile

---

## 🆘 Problemas Comuns

### Deploy OK mas página em branco:

**Vercel/Netlify:**
```typescript
// vite.config.ts - use base: '/'
export default defineConfig({
  base: '/',
  // ...
})
```

**GitHub Pages:**
```typescript
// vite.config.ts - use base: '/nome-do-repo/'
export default defineConfig({
  base: '/nome-do-repo/',
  // ...
})
```

### Variáveis não funcionam:

- Certifique-se de usar prefixo `VITE_`
- Após alterar, faça novo deploy
- Verifique no painel da plataforma

### Erro de build:

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Monitorar Deploy

**Vercel:**
- Logs em tempo real no dashboard
- Automatically commits

**Netlify:**
- Deploy logs no painel
- Atomic deploys

---

## 🎯 Checklist Pré-Deploy

- [ ] `npm run build` funciona localmente
- [ ] `npm run check:safe` sem erros
- [ ] `.env.local` NÃO está no Git
- [ ] Variáveis de ambiente configuradas na plataforma
- [ ] Testado com `npm run preview`

---

## 🔄 Atualizar Deploy

### Vercel/Netlify (Auto-deploy):
```bash
git add .
git commit -m "Update"
git push
```

Deploy automático!

### Manual:
```bash
npm run build
vercel --prod
# ou
netlify deploy --prod
```

---

**💡 DICA:** Use Vercel para facilidade máxima e deploys automáticos via Git!
