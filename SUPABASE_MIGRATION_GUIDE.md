# Guia de Migração para Supabase

## ✅ Migração Concluída com Sucesso!

Seu projeto foi migrado do localStorage para o **Supabase**, um banco de dados PostgreSQL em nuvem totalmente funcional.

---

## 📋 O que foi feito

### 1. **Schema do Banco de Dados**
Foi criado um schema SQL completo com as seguintes tabelas:

- **`announcements`** - Anúncios/banners publicitários
- **`users`** - Usuários cadastrados
- **`diagnostics`** - Diagnósticos jurídicos realizados
- **`referrals`** - Indicações de amigos
- **`terms`** - Termos de uso e LGPD
- **`analytics`** - Dados analíticos diários
- **`analytics_summary`** - Totalizadores de analytics

### 2. **Código Atualizado**
Todos os componentes foram atualizados para usar o Supabase:

- ✅ `src/lib/supabase.ts` - Cliente Supabase configurado
- ✅ `src/lib/data-service.ts` - Serviços de dados com Supabase (async/await)
- ✅ `src/components/admin/AdminDashboard.tsx` - Dashboard administrativo
- ✅ `src/components/legal/LandingPage.tsx` - Página inicial
- ✅ `src/components/legal/ReportPreview.tsx` - Preview de relatórios
- ✅ `.env` - Variáveis de ambiente configuradas

### 3. **Funcionalidades Preservadas**
- ✅ Autenticação do admin (ainda em localStorage - sessão local)
- ✅ Aceitação de termos (ainda em localStorage - sessão local)
- ✅ Todos os dados de negócio agora no Supabase

---

## 🚀 Como usar

### 1. **Instalar dependências**
```bash
npm install
```

### 2. **Executar o projeto**
```bash
npm run dev
```

O projeto estará disponível em: http://localhost:3000

### 3. **Build para produção**
```bash
npm run build
```

---

## 🔧 Configuração do Supabase

### Credenciais Configuradas
As seguintes credenciais já estão no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://dguyabubrktpeqimxdvi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZapQg9eUIJFQfW9acD00LQ_KpzopaiW
```

### Schema SQL
O arquivo `supabase-schema.sql` contém todo o schema do banco de dados. Ele já foi executado no seu projeto Supabase.

---

## 📊 Estrutura de Dados

### Tabela: `announcements`
```sql
- id (UUID)
- image_url (TEXT)
- valid_from (DATE)
- valid_to (DATE)
- website_url (TEXT)
- facebook_url (TEXT)
- instagram_url (TEXT)
- position (INTEGER 1-4)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: `users`
```sql
- id (UUID)
- full_name (TEXT)
- email (TEXT UNIQUE)
- whatsapp (TEXT)
- legal_area (TEXT)
- responses (JSONB)
- created_at (TIMESTAMP)
```

### Tabela: `diagnostics`
```sql
- id (UUID)
- user_id (UUID FK)
- area (JSONB)
- responses (JSONB)
- user_data (JSONB)
- total_score (INTEGER)
- urgency_level (TEXT: low/medium/high)
- ai_report (TEXT)
- created_at (TIMESTAMP)
```

### Tabela: `referrals`
```sql
- id (UUID)
- referrer_name (TEXT)
- referrer_email (TEXT)
- referrer_whatsapp (TEXT)
- referred_name (TEXT)
- referred_whatsapp (TEXT)
- created_at (TIMESTAMP)
```

### Tabela: `terms`
```sql
- id (UUID)
- type (TEXT: terms_of_use/lgpd_terms)
- content (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: `analytics`
```sql
- id (UUID)
- date (DATE UNIQUE)
- access_count (INTEGER)
- questionnaire_count (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: `analytics_summary`
```sql
- id (UUID)
- total_accesses (INTEGER)
- total_questionnaires (INTEGER)
- total_users (INTEGER)
- area_distribution (JSONB)
- updated_at (TIMESTAMP)
```

---

## 🔐 Segurança (RLS - Row Level Security)

O Supabase possui políticas de segurança configuradas:

- ✅ **Leitura pública** habilitada para todas as tabelas
- ✅ **Escrita pública** habilitada (você pode restringir isso depois)
- ⚠️ **Recomendação**: Implemente autenticação Supabase para restringir operações de escrita

### Como adicionar autenticação (opcional)
1. No painel do Supabase, vá em **Authentication**
2. Configure provedores de login (Email, Google, etc.)
3. Atualize as políticas RLS para verificar `auth.uid()`

---

## 🔄 Conversão de Dados (camelCase ↔ snake_case)

O código possui funções automáticas de conversão:

- **Frontend (JavaScript)**: usa `camelCase` (ex: `imageUrl`)
- **Backend (PostgreSQL)**: usa `snake_case` (ex: `image_url`)
- **Conversão automática**: feita pelas funções `toCamelCase()` e `toSnakeCase()`

---

## 📝 Serviços Disponíveis

### `announcementsService`
```typescript
await announcementsService.getAll()
await announcementsService.getById(id)
await announcementsService.getActive()
await announcementsService.create(announcement)
await announcementsService.update(id, updates)
await announcementsService.delete(id)
```

### `usersService`
```typescript
await usersService.getAll()
await usersService.createOrUpdate(user)
await usersService.getStats()
```

### `diagnosticsService`
```typescript
await diagnosticsService.getAll()
await diagnosticsService.create(diagnostic)
await diagnosticsService.getByUser(userId)
await diagnosticsService.getStats()
```

### `referralsService`
```typescript
await referralsService.getAll()
await referralsService.create(referral)
await referralsService.getStats()
```

### `termsService`
```typescript
await termsService.get()
await termsService.set(content)
```

### `lgpdService`
```typescript
await lgpdService.get()
await lgpdService.set(content)
```

### `analyticsService`
```typescript
await analyticsService.get()
await analyticsService.incrementAccess()
await analyticsService.incrementQuestionnaire(area)
await analyticsService.getStats()
await analyticsService.reset()
```

### `exportService`
```typescript
await exportService.exportUsersToCSV()
await exportService.exportReferralsToCSV()
exportService.downloadCSV(content, filename)
```

---

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
**Solução**: Verifique se o arquivo `.env` existe e contém as variáveis corretas.

### Erro: "Failed to fetch"
**Solução**: Verifique se as políticas RLS do Supabase estão configuradas corretamente.

### Erro: "Row Level Security policy violation"
**Solução**: No painel do Supabase, vá em **Authentication > Policies** e verifique as políticas.

### Dados não aparecem
**Solução**: 
1. Verifique se o schema SQL foi executado corretamente
2. Verifique se há dados no banco (use o SQL Editor do Supabase)
3. Abra o console do navegador para ver erros

---

## 📦 Backup e Migração de Dados

### Exportar dados do localStorage (se houver)
```javascript
// Execute no console do navegador
const data = {
  announcements: JSON.parse(localStorage.getItem('adminAnnouncements') || '[]'),
  diagnostics: JSON.parse(localStorage.getItem('diagnosticRecords') || '[]'),
  referrals: JSON.parse(localStorage.getItem('referralRecords') || '[]'),
  users: JSON.parse(localStorage.getItem('userRecords') || '[]'),
};
console.log(JSON.stringify(data, null, 2));
```

### Importar dados para o Supabase
Use o SQL Editor do Supabase para inserir dados manualmente ou crie um script de migração.

---

## 🎯 Próximos Passos Recomendados

1. **Implementar autenticação real**
   - Use Supabase Auth para login de administradores
   - Remova a autenticação por localStorage

2. **Adicionar validações**
   - Valide dados antes de inserir no banco
   - Use Zod ou Yup para validação de schemas

3. **Otimizar queries**
   - Use índices do PostgreSQL
   - Implemente paginação para listas grandes

4. **Adicionar testes**
   - Teste os serviços de dados
   - Teste a integração com Supabase

5. **Monitoramento**
   - Configure alertas no Supabase
   - Monitore uso de recursos

---

## 📞 Suporte

- **Documentação Supabase**: https://supabase.com/docs
- **Painel Supabase**: https://dguyabubrktpeqimxdvi.supabase.co

---

## ✨ Conclusão

Seu projeto agora está usando um banco de dados real e escalável! Todos os dados são persistidos no Supabase e podem ser acessados de qualquer lugar.

**Principais vantagens:**
- ✅ Dados persistentes (não se perdem ao limpar o navegador)
- ✅ Acesso de múltiplos dispositivos
- ✅ Backup automático
- ✅ Escalabilidade
- ✅ APIs REST e Realtime prontas
- ✅ Dashboard administrativo completo

**Boa sorte com seu projeto! 🚀**
