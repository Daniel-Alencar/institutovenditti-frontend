# 🔐 COMO ACESSAR O PAINEL ADMINISTRATIVO

## 📋 Guia Rápido de Acesso

### **MÉTODO 1: Acesso via URL (Mais Fácil)**

```bash
# 1. Inicie o servidor de desenvolvimento
npm run dev

# 2. Acesse no navegador:
http://localhost:3000/?admin=true

# 3. Digite a senha quando solicitado:
admin123
```

**Pronto!** Você estará no painel administrativo.

---

### **MÉTODO 2: Acesso com Autenticação Persistente**

Se você já fez login uma vez, o sistema lembra da autenticação:

```bash
# Acesse normalmente:
http://localhost:3000/?admin=true

# Se já logou antes, vai direto para o dashboard
# Para forçar novo login, limpe o localStorage do navegador
```

---

### **MÉTODO 3: Acesso em Produção**

Quando hospedar o sistema:

```bash
# Substitua pelo seu domínio:
https://seudominio.com.br/?admin=true

# Use a senha configurada em .env.local:
# VITE_ADMIN_PASSWORD=sua_senha_segura
```

---

## 🎯 O Que Você Verá no Admin

### **1. Tab "Visão Geral"**
- 📊 Cards com estatísticas:
  - Total de usuários cadastrados
  - Total de diagnósticos realizados
  - Total de indicações enviadas
  - Taxa de conversão
- 🚀 Ações rápidas:
  - Exportar relatório
  - Ver usuários recentes
  - Enviar broadcast

### **2. Tab "Usuários"**
- 👥 Lista completa de todos os usuários cadastrados
- 📝 Informações: Nome, Email, Telefone, Área Jurídica
- 🔍 Busca e filtros
- 📊 Ordenação por data de cadastro

### **3. Tab "Diagnósticos"**
- 📋 Histórico de todos os diagnósticos realizados
- 🎯 Detalhes: Usuário, Área Jurídica, Data, Respostas
- 📄 Visualização de relatórios gerados
- 📊 Análise de respostas

### **4. Tab "Indicações"**
- 💼 Lista de todas as indicações enviadas
- 📧 Status de envio (email, WhatsApp)
- 📥 Exportação para Excel
- 📊 Métricas de conversão

---

## 🔑 Configuração de Senha

### **Alterar a Senha Padrão**

Edite o arquivo `.env.local`:

```env
# Troque "admin123" pela sua senha segura
VITE_ADMIN_PASSWORD=minha_senha_super_segura_2024
```

### **Senha Padrão de Fábrica**

Se você não configurar nada, a senha padrão é:

```
admin123
```

⚠️ **IMPORTANTE:** Sempre mude a senha padrão em produção!

---

## 🚪 Como Fazer Logout

1. Clique no botão **"Sair"** no canto superior direito
2. Você será redirecionado para a página inicial
3. A sessão será limpa do navegador

---

## 🛠️ Troubleshooting

### **Problema: "Senha incorreta"**

**Solução:**
1. Verifique se o arquivo `.env.local` existe
2. Confirme que `VITE_ADMIN_PASSWORD=admin123` está definido
3. Reinicie o servidor (`npm run dev`)

### **Problema: "Não consigo ver dados no admin"**

**Explicação:**
- O admin está 100% funcional
- Os dados mostrados são DEMO (zeros) porque o banco ainda não está configurado
- A interface está pronta para exibir dados reais quando você conectar o banco

**Para ver dados reais:**
1. Configure o banco de dados (veja `MANUAL_DO_SISTEMA.md`)
2. As integrações buscarão dados automaticamente

### **Problema: "Preciso limpar a sessão de login"**

**Solução:**
```javascript
// Abra o Console do navegador (F12) e execute:
localStorage.removeItem('adminAuthenticated');
location.reload();
```

---

## 📱 Funcionalidades do Admin

### **✅ Funcionalidades Implementadas**

- ✅ Sistema de login com senha
- ✅ Persistência de sessão (localStorage)
- ✅ 4 tabs principais (Visão Geral, Usuários, Diagnósticos, Indicações)
- ✅ Cards de estatísticas
- ✅ Tabelas de dados
- ✅ Exportação para Excel (tab Indicações)
- ✅ Interface responsiva e moderna
- ✅ Botão de logout
- ✅ Proteção de rotas

### **⚙️ Aguardando Configuração**

- ⚙️ Conexão com banco de dados (para dados reais)
- ⚙️ APIs de email e WhatsApp (para integrações)

---

## 🎨 Interface do Admin

### **Design**

- 🎨 Interface profissional com shadcn/ui
- 📱 Totalmente responsiva (desktop, tablet, mobile)
- 🌙 Design moderno com gradientes
- 🔒 Tela de login elegante
- 📊 Visualização clara de dados

### **Navegação**

- 🔝 Header fixo com logo e botão de logout
- 📑 Tabs para alternar entre seções
- 🔍 Busca e filtros em todas as tabelas
- 📥 Botões de ação em destaque

---

## 📚 Próximos Passos

1. ✅ **Acesse o admin** - Use o guia acima
2. 📖 **Leia o manual** - `MANUAL_DO_SISTEMA.md`
3. 🔌 **Configure as APIs** - Email, WhatsApp, Banco
4. 🚀 **Faça deploy** - Vercel, Netlify ou VPS
5. 🔐 **Mude a senha** - Em produção, use senha forte

---

## 🆘 Suporte

Caso tenha problemas, verifique:

1. **MANUAL_DO_SISTEMA.md** - Manual completo
2. **IMPLEMENTATION_COMPLETE.md** - Detalhes técnicos
3. **.env.example** - Template de variáveis

---

**✅ O painel administrativo está 100% pronto para uso!**

Acesse agora: `http://localhost:3000/?admin=true`
Senha: `admin123`
