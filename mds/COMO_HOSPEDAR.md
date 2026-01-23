# 🚀 Como Copiar e Hospedar em Outro Local

Este guia mostra como copiar todo o código do projeto e hospedá-lo em diferentes plataformas.

---

## 📦 PASSO 1: Copiar o Código

### Opção A: Copiar Arquivos Manualmente

**Copie TODOS estes arquivos e pastas:**

```
vite-template/
├── src/                    ← Código-fonte principal
├── public/                 ← Arquivos públicos
├── node_modules/          ← (NÃO copiar - será recriado)
├── package.json           ← Lista de dependências
├── package-lock.json      ← Versões exatas
├── tsconfig.json          ← Configuração TypeScript
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts         ← Configuração Vite
├── tailwind.config.ts     ← Configuração Tailwind
├── postcss.config.js      ← Configuração PostCSS
├── components.json        ← Configuração shadcn/ui
├── index.html             ← Página principal
├── .env.local             ← Variáveis de ambiente
└── README.md
```

**⚠️ NÃO COPIE:**
- `node_modules/` (muito pesado - será recriado com `npm install`)
- `dist/` (arquivos compilados - será recriado)
- `.git/` (histórico do Git - opcional)

### Opção B: Criar Repositório Git

```bash
# No diretório do projeto
git init
git add .
git commit -m "Initial commit"

# Criar repositório no GitHub/GitLab e conectar
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

---

## 🌐 PASSO 2: Hospedar Online

### 🔥 OPÇÃO 1: Vercel (RECOMENDADO - Grátis)

**Mais fácil e rápido!**

#### Via Interface Web:
1. Acesse [vercel.com](https://vercel.com)
2. Crie conta gratuita
3. Clique em "Add New Project"
4. Importe do GitHub ou faça upload dos arquivos
5. Configure:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
6. Adicione variáveis de ambiente:
   ```
   VITE_ADMIN_PASSWORD=sua_senha_aqui
   ```
7. Clique em "Deploy"

#### Via CLI:
```bash
# Instalar CLI da Vercel
npm install -g vercel

# No diretório do projeto
vercel

# Seguir instruções interativas
# Build Command: npm run build
# Output Directory: dist

# Para produção
vercel --prod
```

**✅ Pronto! URL gerada automaticamente!**

---

### 🚀 OPÇÃO 2: Netlify (Grátis)

#### Via Interface Web:
1. Acesse [netlify.com](https://netlify.com)
2. Crie conta gratuita
3. Clique em "Add new site" → "Import an existing project"
4. Configure:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. Adicione variáveis de ambiente em "Site settings" → "Environment variables":
   ```
   VITE_ADMIN_PASSWORD=sua_senha_aqui
   ```
6. Clique em "Deploy"

#### Via CLI:
```bash
# Instalar CLI do Netlify
npm install -g netlify-cli

# Build local
npm run build

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

---

### ☁️ OPÇÃO 3: GitHub Pages (Grátis)

**Para hospedagem estática simples:**

1. Edite `vite.config.ts` e adicione:
   ```typescript
   export default defineConfig({
     base: '/nome-do-repositorio/', // Nome do seu repo no GitHub
     // ... resto da config
   })
   ```

2. Instale gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Adicione script em `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Execute:
   ```bash
   npm run deploy
   ```

5. Habilite GitHub Pages:
   - Vá em Settings → Pages
   - Selecione branch `gh-pages`
   - URL: `https://SEU_USUARIO.github.io/SEU_REPO/`

---

### 🐳 OPÇÃO 4: Servidor Próprio (VPS/Hospedagem)

**Para servidor Linux com Node.js:**

#### 1. Fazer build local:
```bash
npm run build
```

#### 2. Copiar pasta `dist/` para servidor via FTP/SFTP

#### 3. No servidor, instalar servidor HTTP:
```bash
# Opção A: Usar serve (simples)
npm install -g serve
serve -s dist -p 3000

# Opção B: Nginx (produção)
# Copiar arquivos de dist/ para /var/www/html/
sudo cp -r dist/* /var/www/html/

# Configurar Nginx
sudo nano /etc/nginx/sites-available/default
```

**Exemplo config Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo systemctl restart nginx
```

---

## 🔧 PASSO 3: Configurar Novo Ambiente

**Após copiar para novo local:**

### 1. Instalar dependências:
```bash
npm install
```

### 2. Configurar variáveis de ambiente:

Crie arquivo `.env.local`:
```env
VITE_ADMIN_PASSWORD=sua_senha_segura_aqui
```

### 3. Testar localmente:
```bash
npm run dev
```

### 4. Build para produção:
```bash
npm run build
```

### 5. Verificar build:
```bash
npm run preview
```

---

## 📋 Checklist de Deploy

Antes de publicar, verifique:

- [ ] `npm install` executado com sucesso
- [ ] `npm run check:safe` sem erros
- [ ] `npm run build` gera pasta `dist/`
- [ ] `.env.local` configurado (NÃO fazer commit!)
- [ ] `index.html` customizado (título, meta description)
- [ ] Senha admin alterada para algo seguro
- [ ] Testado localmente com `npm run preview`

---

## 🔐 Segurança Importante

### ⚠️ NUNCA fazer commit de:
```
.env.local          ← Senhas e secrets
.env               ← Configurações sensíveis
```

### ✅ Adicione ao `.gitignore`:
```gitignore
.env.local
.env
.env*.local
node_modules/
dist/
```

### 🔑 Boas práticas:
- Use senhas fortes diferentes para cada ambiente
- Configure variáveis de ambiente no painel da hospedagem
- Não exponha chaves de API no código-fonte

---

## 📦 Exportar Projeto Completo (ZIP)

**Para enviar/backup completo:**

### Linux/Mac:
```bash
# Excluir node_modules e dist
zip -r projeto.zip . -x "node_modules/*" "dist/*" ".git/*"
```

### Windows:
1. Exclua manualmente: `node_modules/`, `dist/`, `.git/`
2. Selecione todas as pastas/arquivos restantes
3. Clique direito → "Enviar para" → "Pasta compactada"

### Estrutura mínima do ZIP:
```
projeto.zip
├── src/
├── public/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
└── ... demais configs
```

**No novo local:**
1. Extrair ZIP
2. `npm install`
3. `npm run dev`

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro de build
```bash
# Limpar cache
npm run build -- --force
```

### Página em branco após deploy
- Verifique `base` no `vite.config.ts`
- Para subpastas: `base: '/subpasta/'`
- Para domínio raiz: `base: '/'`

### Variáveis de ambiente não funcionam
- Prefixo `VITE_` é obrigatório
- Reinicie o servidor após alterar `.env.local`
- Configure no painel da plataforma de hospedagem

---

## 📞 Plataformas Comparadas

| Plataforma | Grátis? | Facilidade | Domínio Próprio | HTTPS Automático |
|-----------|---------|-----------|----------------|------------------|
| **Vercel** | ✅ Sim | ⭐⭐⭐⭐⭐ | ✅ Sim | ✅ Sim |
| **Netlify** | ✅ Sim | ⭐⭐⭐⭐⭐ | ✅ Sim | ✅ Sim |
| **GitHub Pages** | ✅ Sim | ⭐⭐⭐⭐ | ✅ Sim | ✅ Sim |
| **Servidor Próprio** | ❌ Não | ⭐⭐ | ✅ Sim | Configurar |

**🏆 RECOMENDAÇÃO:** Use **Vercel** ou **Netlify** para facilidade máxima!

---

## 🎯 Resumo Rápido

### Para hospedar AGORA (5 minutos):

1. **Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify:**
   ```bash
   npm install -g netlify-cli
   npm run build
   netlify deploy --prod
   ```

**✅ PRONTO!** URL gerada automaticamente com HTTPS!

---

## 📚 Recursos Adicionais

- [Documentação Vite - Deploy](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [GitHub Pages Guide](https://pages.github.com)

---

**💡 Dica Final:** Depois de hospedar, teste em diferentes dispositivos e navegadores!
