# 🚀 Quick Start - Projeto com Supabase

## ⚡ Início Rápido (3 passos)

### 1. Instalar dependências
```bash
npm install
```

### 2. Verificar configuração
Confirme que o arquivo `.env` existe com:
```env
VITE_SUPABASE_URL=https://dguyabubrktpeqimxdvi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZapQg9eUIJFQfW9acD00LQ_KpzopaiW
```

### 3. Executar o projeto
```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## ✅ O que já está funcionando

- ✅ Banco de dados Supabase configurado
- ✅ Schema SQL executado
- ✅ Todos os componentes atualizados
- ✅ Build funcionando perfeitamente
- ✅ Dados de exemplo inseridos

---

## 🎯 Principais mudanças

### Antes (localStorage)
```javascript
const users = usersService.getAll(); // síncrono
```

### Agora (Supabase)
```javascript
const users = await usersService.getAll(); // assíncrono
```

**Importante**: Todos os serviços agora são **assíncronos** (usam `async/await`).

---

## 📁 Arquivos importantes

- **`.env`** - Credenciais do Supabase
- **`supabase-schema.sql`** - Schema do banco (já executado)
- **`src/lib/supabase.ts`** - Cliente Supabase
- **`src/lib/data-service.ts`** - Serviços de dados
- **`SUPABASE_MIGRATION_GUIDE.md`** - Guia completo

---

## 🔍 Verificar se está funcionando

1. Execute o projeto: `npm run dev`
2. Abra o navegador em: http://localhost:3000
3. Preencha um questionário
4. Acesse o painel admin (se configurado)
5. Verifique os dados no Supabase: https://dguyabubrktpeqimxdvi.supabase.co

---

## 🐛 Problemas comuns

### "Module not found: @supabase/supabase-js"
```bash
npm install @supabase/supabase-js
```

### "Missing environment variables"
Verifique se o arquivo `.env` existe na raiz do projeto.

### Dados não aparecem
1. Abra o console do navegador (F12)
2. Veja se há erros
3. Verifique se o schema SQL foi executado no Supabase

---

## 📚 Documentação completa

Leia o arquivo **`SUPABASE_MIGRATION_GUIDE.md`** para informações detalhadas sobre:
- Estrutura de dados
- Serviços disponíveis
- Segurança (RLS)
- Troubleshooting
- Próximos passos

---

## 🎉 Pronto!

Seu projeto está funcionando com Supabase! 🚀

**Dúvidas?** Consulte o guia completo em `SUPABASE_MIGRATION_GUIDE.md`
