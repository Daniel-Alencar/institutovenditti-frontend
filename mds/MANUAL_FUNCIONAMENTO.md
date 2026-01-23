# 📘 Manual de Funcionamento do Sistema - Diagnóstico Jurídico

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Fluxo do Usuário](#fluxo-do-usuário)
3. [Painel Administrativo](#painel-administrativo)
4. [Sistema de Anúncios](#sistema-de-anúncios)
5. [Gestão de Dados](#gestão-de-dados)
6. [Exportações e Relatórios](#exportações-e-relatórios)
7. [Integração com WhatsApp](#integração-com-whatsapp)
8. [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Visão Geral

O **Sistema de Diagnóstico Jurídico** é uma plataforma web que permite aos usuários:

- Realizar diagnósticos jurídicos gratuitos em diversas áreas do direito
- Receber análises personalizadas geradas por IA
- Obter relatórios em PDF enviados por email e WhatsApp
- Indicar amigos para receberem convites automáticos

### Tecnologias Principais

- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Roteamento:** TanStack Router
- **UI:** shadcn/ui (New York style)
- **IA:** Claude API (Anthropic)
- **Armazenamento:** localStorage (desenvolvimento) / Backend API (produção)

---

## 👤 Fluxo do Usuário

### 1. Landing Page

**Localização:** `src/components/legal/LandingPage.tsx`

**Elementos principais:**
- Hero section com call-to-action
- Cards de funcionalidades
- Seção "Como Funciona" (4 passos)
- Disclaimer legal visível

**Ações:**
- Botão "Começar Diagnóstico" → abre modal de Termos de Uso
- Botão "Como Funciona" → scroll suave para seção explicativa

### 2. Modal de Termos de Uso

**Localização:** `src/components/legal/TermsOfUseModal.tsx`

**Funcionamento:**
- Exibe termos configurados pelo admin em `localStorage['adminTermsOfUse']`
- Checkbox de aceite obrigatório
- Botões: "Aceitar e Continuar" / "Recusar"
- Armazena aceite em `localStorage['termsAccepted']`

**Importante:**
- Termos só são exibidos uma vez por dispositivo
- Admin pode editar termos no painel administrativo

**🔒 NOVO: Fluxo com LGPD**
- Após aceitar Termos de Uso, usuário segue para seleção de área
- Ao preencher formulário de dados, dois aceites obrigatórios são necessários:
  1. Modal LGPD (Proteção de Dados)
  2. Disclaimer de IA

### 3. Seleção de Área Jurídica

**Localização:** `src/components/legal/AreaSelection.tsx`

**Áreas disponíveis:**
1. Direito Trabalhista
2. Direito do Consumidor
3. Direito de Família
4. Direito Previdenciário
5. Direito Civil
6. Direito do Inquilino

**Cada área contém:**
- Nome e descrição
- Conjunto de perguntas específicas
- Sistema de pontuação personalizado

### 4. Questionário

**Localização:** `src/components/legal/QuestionnaireForm.tsx`

**Tipos de pergunta:**
- **Radio:** Seleção única
- **Checkbox:** Seleção múltipla
- **Textarea:** Texto livre

**Features:**
- Barra de progresso visual
- Navegação entre perguntas
- Validação antes de avançar
- Armazenamento temporário das respostas

**Sistema de pontuação:**
- Cada opção tem pontos associados
- Pontos são somados para calcular urgência
- Urgência: Baixa (0-30) / Média (31-60) / Alta (61+)

### 5. Formulário de Dados do Usuário

**Localização:** `src/components/legal/UserDataForm.tsx`

**Campos obrigatórios:**
- Nome completo
- Email
- WhatsApp

**Campos opcionais (Indicação de amigo):**
- Nome do amigo
- WhatsApp do amigo

**Validações:**
- Email: formato válido
- WhatsApp: formato brasileiro `(XX) XXXXX-XXXX`
- Máscara automática no campo de telefone

**🔒 NOVO: Duplo Aceite Obrigatório**

Ao clicar em "Gerar Relatório", o usuário passa por 2 modais obrigatórios:

#### Modal 1: Termos LGPD (OBRIGATÓRIO)
**Localização:** `src/components/legal/LGPDTermsModal.tsx`

**Aceites necessários:**
1. ✅ **Aceite LGPD:** Autorização para tratamento de dados pessoais
2. ✅ **Aceite de Contato:** Autorização para receber contato via email e WhatsApp

**Armazenamento:**
```typescript
localStorage['lgpdAccepted'] = 'true'
localStorage['lgpdAcceptedDate'] = '2025-01-15T10:30:00.000Z'
localStorage['contactAccepted'] = 'true'
localStorage['contactAcceptedDate'] = '2025-01-15T10:30:00.000Z'
```

**Conteúdo:**
- Editável pelo admin no painel (Aba LGPD)
- Template padrão conforme LGPD (Lei 13.709/2018)
- Inclui: dados coletados, finalidades, direitos do titular, etc.

#### Modal 2: Disclaimer de IA (OBRIGATÓRIO)
- Modal informativo sobre limitações da IA
- Aceite obrigatório para continuar
- Aparece APÓS aceite LGPD

**Importante:**
- Sem os 2 aceites, o usuário NÃO recebe o relatório
- Ordem obrigatória: LGPD → Disclaimer → Geração do relatório

### 6. Relatório de Diagnóstico

**Localização:** `src/components/legal/ReportPreview.tsx`

**Geração do relatório:**

```typescript
// 1. Cálculo da pontuação
const score = calculateScore(area.questions, responses);

// 2. Geração de análise por IA
const report = await generateAIAnalysis({
  area,
  responses,
  totalScore: score.totalPoints,
  urgencyLevel: score.urgencyLevel
});

// 3. Salvamento no banco de dados
diagnosticsService.create({
  userId: userData.email,
  area,
  responses,
  userData,
  totalScore: score.totalPoints,
  urgencyLevel: score.urgencyLevel,
  aiReport: report,
});

// 4. Salvamento de indicação (se houver)
if (userData.referralName && userData.referralWhatsapp) {
  referralsService.create({
    referrerName: userData.fullName,
    referrerEmail: userData.email,
    referrerWhatsapp: userData.whatsapp,
    referredName: userData.referralName,
    referredWhatsapp: userData.referralWhatsapp,
  });
}
```

**Recursos do relatório:**
- Card de pontuação e urgência
- Análise detalhada gerada por IA
- **4 espaços publicitários integrados**
- Botões de ação: Download PDF, Enviar Email
- Botão flutuante de WhatsApp para advogado
- Disclaimer legal

**Envio automático:**
- Email com PDF em anexo (automático após geração)
- WhatsApp para amigo indicado (se informado)

---

## 🔐 Painel Administrativo

### Acesso

**URL:** `http://localhost:3000/?admin=true`

**Credenciais:**
- Senha padrão: `admin123`
- Configurável via `.env.local`: `VITE_ADMIN_PASSWORD=sua_senha`

**Autenticação:**
- Login armazenado em `localStorage['adminAuthenticated']`
- Logout limpa autenticação e redireciona para home

### Estrutura do Painel

**Localização:** `src/components/admin/AdminDashboard.tsx`

#### 1. Aba Visão Geral

**Estatísticas em tempo real:**
- Total de usuários cadastrados
- Total de diagnósticos gerados
- Total de indicações
- Diagnósticos deste mês

**Ações rápidas:**
- Exportar relatório Excel
- Envio WhatsApp em massa (configurável)

#### 2. Aba Termos de Uso

**Funcionalidades:**
- Editor de texto completo (textarea)
- Botão "Salvar Termos de Uso"
- Botão "Cancelar Alterações"
- Preview automático no modal do usuário

**Armazenamento:**
```typescript
localStorage.setItem('adminTermsOfUse', termsContent);
```

#### 3. Aba LGPD 🔒 NOVO

**Gerenciamento de Termos de Proteção de Dados Pessoais**

**Funcionalidades:**
- Editor de texto completo (textarea com 25 linhas)
- Botão "Salvar Termos LGPD"
- Botão "Cancelar Alterações"
- Botão "Restaurar Template Padrão"
- Alertas informativos sobre obrigatoriedade

**Armazenamento:**
```typescript
lgpdService.set(lgpdContent);
// Salvo em: localStorage['adminLGPDTerms']
```

**Template padrão inclui:**
- Identificação do responsável pelo tratamento
- Dados coletados (nome, email, WhatsApp, respostas, etc.)
- Finalidades do tratamento
- Base legal (LGPD Art. 7º)
- Direitos do titular de dados
- Compartilhamento de dados
- Armazenamento e segurança
- Como exercer direitos
- Cookies e tecnologias
- Contatos do DPO (Encarregado de Dados)

**Aceites obrigatórios para o usuário:**
1. ✅ Aceite dos Termos LGPD
2. ✅ Autorização para receber contato (email e WhatsApp)

**Onde são exibidos:**
- Modal obrigatório no formulário de dados do usuário
- Exibido ANTES do disclaimer de IA
- Usuário só recebe relatório após aceitar ambos os termos

**Conformidade:**
- Template baseado na Lei 13.709/2018 (LGPD)
- Campos editáveis para personalização do escritório
- Registra data e hora do aceite automaticamente

#### 4. Aba Anúncios ⭐

**Gerenciamento de 4 espaços publicitários:**

**Campos por anúncio:**
- **Banner:** Upload de arquivo OU URL da imagem
- **Vigência:** Data início e fim
- **URLs:**
  - Site principal
  - Facebook
  - Instagram

**Upload de banner:**
- Opção 1: URL direta da imagem
- Opção 2: Upload de arquivo local (convertido para base64)
- Formatos aceitos: JPG, PNG, GIF
- Tamanho máximo: 5MB
- Tamanho recomendado: 728x90px ou 300x250px

**Preview visual:**
- Imagem exibida antes de salvar
- Links para site e redes sociais

**Posicionamento:**
- Anúncio 1: Após introdução do relatório
- Anúncio 2: No meio da análise
- Anúncio 3: Antes das recomendações
- Anúncio 4: Final do relatório

**Exibição nos relatórios:**
- Apenas anúncios com vigência ativa são exibidos
- Verificação automática de datas
- Placeholders `[ESPAÇO_PUBLICITARIO_1]` são substituídos por banners reais

#### 5. Aba Usuários

**Tabela de usuários:**
- Nome completo
- Email
- WhatsApp
- Área jurídica
- Data de cadastro
- Botão "Ver" (detalhes)

**Exportações:**
- CSV: Download imediato com todos os dados
- Excel: Estrutura pronta para implementação

**Dados incluídos na exportação:**
- Informações pessoais
- Área jurídica selecionada
- Todas as respostas do questionário
- Data de cadastro

#### 6. Aba Diagnósticos

**Histórico completo:**
- Lista de todos os diagnósticos gerados
- Filtros por área, urgência, data
- Detalhes de cada diagnóstico

**Em desenvolvimento:** Interface aguarda conexão com backend

#### 7. Aba Indicações

**Tabela de indicações:**
- Nome do indicado
- WhatsApp do indicado
- Nome do indicador
- Data da indicação

**Exportações:**
- CSV: Formato otimizado para integração com APIs de WhatsApp
- Excel: Disponível em produção

**Integração:**
- Dados prontos para import em sistemas de disparo
- APIs compatíveis: Evolution API, Z-API, Baileys, etc.

#### 8. Aba WhatsApp

**Sistema de envio em massa:**

**Seleção de destinatários:**
- Todos (usuários + indicados)
- Apenas usuários
- Apenas indicados

**Editor de mensagem:**
- Campo de texto livre
- Variáveis dinâmicas: `{nome}`, `{area_juridica}`, `{data}`

**APIs suportadas:**
- Evolution API (recomendado)
- Z-API
- Baileys
- Venom Bot
- WPPConnect

**Configuração (.env.local):**
```env
VITE_WHATSAPP_API_URL=https://sua-api.com
VITE_WHATSAPP_API_KEY=sua-chave-aqui
```

---

## 🎯 Sistema de Anúncios - Integração Completa

### 📐 Especificações Técnicas dos Banners

#### Dimensões Recomendadas

**Opção 1: Banner Horizontal (Leaderboard)**
- **Dimensões:** 728 x 90 pixels
- **Proporção:** 8:1 (largura:altura)
- **Uso:** Espaços publicitários horizontais no topo e rodapé

**Opção 2: Banner Quadrado (Medium Rectangle)**
- **Dimensões:** 300 x 250 pixels
- **Proporção:** 1.2:1 (largura:altura)
- **Uso:** Espaços publicitários laterais ou embutidos no conteúdo

#### Requisitos Técnicos

**Resolução:**
- **Mínima:** 72 DPI
- **Recomendada:** 150 DPI para melhor qualidade no PDF

**Formatos Aceitos:**
- JPG (JPEG)
- PNG (com ou sem transparência)
- GIF (estático ou animado - apenas primeiro frame será usado)

**Tamanho de Arquivo:**
- **Máximo:** 5 MB
- **Recomendado:** até 500 KB para carregamento rápido

**Espaço no PDF:**
- **Dimensões fixas:** 180mm x 50mm
- **Localização:** 4 posições estratégicas ao longo do relatório

**Cores:**
- **Perfil:** RGB
- **Conversão:** Automática para PDF (mantém fidelidade de cores)

#### ✅ Checklist de Qualidade do Banner

**Qualidade Visual:**
- [ ] Imagem nítida e sem pixelização
- [ ] Sem distorções ou esticamento
- [ ] Cores com bom contraste e saturação adequada
- [ ] Sem compressão excessiva (artefatos JPEG)

**Legibilidade:**
- [ ] Texto legível (fonte mínima 10pt recomendada)
- [ ] Logotipo visível e reconhecível
- [ ] Informações de contato claras
- [ ] Call-to-action destacado

**Dimensões:**
- [ ] Largura e altura dentro da tolerância (±10%)
- [ ] Proporção adequada (8:1 ou 1.2:1)
- [ ] Tamanho de arquivo dentro do limite

#### ⚠️ Validação Automática

O sistema **valida automaticamente** as dimensões ao fazer upload:

**Validação em Tempo Real:**
1. Carrega imagem via URL ou arquivo
2. Extrai dimensões (largura x altura)
3. Compara com dimensões recomendadas (±10% tolerância)
4. Exibe feedback visual:
   - ✅ **Verde:** Dimensões corretas
   - ⚠️ **Amarelo:** Fora das dimensões recomendadas

**Alertas de Validação:**
- Dimensões diferentes das recomendadas
- Proporção incorreta
- Resolução muito baixa
- Possível perda de qualidade

**Comportamento:**
- Se dimensões estiverem incorretas, sistema exibe **confirmação**
- Admin pode optar por continuar ou cancelar upload
- Banner será **redimensionado automaticamente** no PDF

### Fluxo de Configuração

1. **Admin acessa aba "Anúncios"**
2. **Clica em "Novo Anúncio"**
3. **Faz upload do banner:**
   - **Opção A:** URL da imagem hospedada
   - **Opção B:** Upload de arquivo local (max 5MB)
4. **Sistema valida dimensões automaticamente:**
   - ✅ Dimensões corretas: prossegue normalmente
   - ⚠️ Dimensões incorretas: exibe alerta e solicita confirmação
5. **Visualiza especificações técnicas no card informativo**
6. **Define vigência do anúncio:**
   - Data inicial (validFrom)
   - Data final (validTo)
7. **Adiciona URLs de destino:**
   - Site institucional
   - Página do Facebook
   - Perfil do Instagram
8. **Salva anúncio**
9. **Anúncio é armazenado em localStorage**

### Fluxo de Exibição

1. **Usuário completa diagnóstico**
2. **ReportPreview carrega anúncios ativos:**
```typescript
const activeAnnouncements = announcementsService.getActive();
```
3. **IA gera relatório com placeholders:**
```
[ESPAÇO_PUBLICITARIO_1]
[ESPAÇO_PUBLICITARIO_2]
[ESPAÇO_PUBLICITARIO_3]
[ESPAÇO_PUBLICITARIO_4]
```
4. **Placeholders são substituídos por componentes `<AdBanner>`**
5. **Banners exibem:**
   - Imagem configurada (redimensionada se necessário)
   - Links clicáveis para site e redes sociais
   - Indicador visual "Publicidade"

### Validação de Vigência

```typescript
getActive: (): Announcement[] => {
  const announcements = announcementsService.getAll();
  const now = new Date().toISOString().split('T')[0];

  return announcements.filter(a => {
    return a.validFrom <= now && a.validTo >= now;
  }).sort((a, b) => a.position - b.position);
}
```

### 🎨 Exemplo de Dimensionamento no PDF

**Como o banner é inserido no PDF:**

```typescript
// Espaço publicitário no PDF
const bannerWidth = 180;  // mm (largura A4 - margens)
const bannerHeight = 50;  // mm (altura fixa)

// Banner 728x90px será redimensionado para caber em 180x50mm
// Banner 300x250px será redimensionado para caber em 180x50mm
```

**Importante:** Banners com dimensões diferentes das recomendadas serão **redimensionados automaticamente**, o que pode causar:
- Distorção da imagem
- Perda de qualidade visual
- Texto ilegível
- Proporções incorretas

**Recomendação:** Sempre use as dimensões exatas recomendadas (728x90px ou 300x250px) para garantir a melhor qualidade visual.

---

## 💾 Gestão de Dados

### Serviço Centralizado

**Localização:** `src/lib/data-service.ts`

**Estrutura modular:**
- `announcementsService` - CRUD de anúncios
- `diagnosticsService` - Gerenciamento de diagnósticos
- `referralsService` - Controle de indicações
- `usersService` - Gestão de usuários
- `termsService` - Termos de uso
- `exportService` - Utilitários de exportação

### Storage Keys

```typescript
const STORAGE_KEYS = {
  ANNOUNCEMENTS: 'adminAnnouncements',
  DIAGNOSTICS: 'diagnosticRecords',
  REFERRALS: 'referralRecords',
  USERS: 'userRecords',
  TERMS: 'adminTermsOfUse',
} as const;
```

### Interfaces de Dados

```typescript
interface Announcement {
  id: string;
  imageUrl: string;
  validFrom: string;
  validTo: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  position: 1 | 2 | 3 | 4;
  createdAt: string;
  updatedAt: string;
}

interface DiagnosticRecord {
  id: string;
  userId: string;
  area: LegalArea;
  responses: QuestionnaireResponse[];
  userData: UserData;
  totalScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  aiReport: string;
  createdAt: string;
}

interface ReferralRecord {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referrerWhatsapp: string;
  referredName: string;
  referredWhatsapp: string;
  createdAt: string;
}

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  legalArea: string;
  responses: QuestionnaireResponse[];
  createdAt: string;
}
```

### Migração para Backend

O código está estruturado para fácil migração:

**Antes (localStorage):**
```typescript
getAll: (): Announcement[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
  return data ? JSON.parse(data) : [];
}
```

**Depois (API):**
```typescript
getAll: async (): Promise<Announcement[]> => {
  const response = await fetch('/api/announcements', {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });
  return await response.json();
}
```

Ver `API_IMPLEMENTATION.md` para guia completo.

---

## 📊 Exportações e Relatórios

### CSV - Usuários

**Formato:**
```csv
Nome;Email;WhatsApp;Área Jurídica;Data Cadastro
João Silva;joao@email.com;(11) 99999-9999;Direito Trabalhista;10/11/2025
```

**Implementação:**
```typescript
exportUsersToCSV: (): string => {
  const users = usersService.getAll();
  const headers = ['Nome', 'Email', 'WhatsApp', 'Área Jurídica', 'Data Cadastro'];
  const rows = users.map(u => [
    u.fullName,
    u.email,
    u.whatsapp,
    u.legalArea,
    new Date(u.createdAt).toLocaleDateString('pt-BR'),
  ]);

  return [headers, ...rows].map(row => row.join(';')).join('\n');
}
```

### CSV - Indicações

**Formato:**
```csv
Nome do Indicado;WhatsApp do Indicado;Nome do Indicador;Data
Maria Santos;(11) 98888-8888;João Silva;10/11/2025
```

**Uso:**
- Importação direta em sistemas de disparo WhatsApp
- Integração com CRMs
- Campanhas de marketing

### PDF - Diagnóstico

**Gerado automaticamente após análise:**

**Conteúdo:**
- Dados do usuário
- Área jurídica
- Pontuação e urgência
- Análise completa por IA
- **Banners de anúncios**
- Disclaimers legais
- Contato do advogado

**Envio:**
- Email automático com anexo
- Disponível para download manual

---

## 📱 Integração com WhatsApp

### Configuração

**Arquivo:** `.env.local`

```env
# Evolution API (Recomendado)
VITE_WHATSAPP_API_URL=https://evolution.sua-api.com
VITE_WHATSAPP_API_KEY=sua-chave-api
VITE_WHATSAPP_INSTANCE=instance-name

# Z-API
VITE_WHATSAPP_API_URL=https://api.z-api.io
VITE_WHATSAPP_API_KEY=sua-chave-aqui
VITE_WHATSAPP_INSTANCE=sua-instancia
```

### Envio de Diagnóstico

**Arquivo:** `src/lib/whatsapp-service.ts`

```typescript
export async function sendDiagnosticWhatsApp(params: {
  phoneNumber: string;
  userName: string;
  legalArea: string;
  urgencyLevel: string;
}) {
  const message = prepareWhatsAppMessage(params);

  // Implementação depende da API configurada
  if (API_TYPE === 'evolution') {
    await sendViaEvolutionAPI(params.phoneNumber, message);
  } else if (API_TYPE === 'z-api') {
    await sendViaZAPI(params.phoneNumber, message);
  }
}
```

### Envio de Convite (Indicação)

```typescript
export async function sendReferralInvitation(params: {
  friendName: string;
  friendWhatsApp: string;
  referredBy: string;
}) {
  const message = `Olá, ${params.friendName}! 👋\n\nSeu amigo ${params.referredBy} te indicou para fazer um diagnóstico jurídico gratuito...\n\nAcesse: [URL do sistema]`;

  await sendWhatsAppMessage(params.friendWhatsApp, message);
}
```

### Disparo em Massa

**Painel Admin → Aba WhatsApp**

**Fluxo:**
1. Seleciona destinatários (Todos / Usuários / Indicados)
2. Escreve mensagem com variáveis
3. Clica "Enviar Mensagens"
4. Sistema substitui variáveis e envia para cada destinatário

**Variáveis disponíveis:**
- `{nome}` - Nome do destinatário
- `{area_juridica}` - Área selecionada
- `{data}` - Data atual

**Exemplo:**
```
Olá, {nome}!

Seu diagnóstico de {area_juridica} está pronto.
Acesse agora e confira a análise completa.

Data: {data}
```

---

## 🔧 Solução de Problemas

### Admin não consegue fazer login

**Sintomas:** Senha não aceita

**Soluções:**
1. Verificar senha no `.env.local`
2. Se não configurado, usar senha padrão: `admin123`
3. Limpar localStorage: `localStorage.removeItem('adminAuthenticated')`

### Anúncios não aparecem no relatório

**Possíveis causas:**

1. **Vigência expirada:**
   - Verificar datas de início/fim
   - Garantir que data atual está entre `validFrom` e `validTo`

2. **Banner sem imagem:**
   - Conferir URL da imagem
   - Testar URL diretamente no navegador
   - Verificar se base64 está completo (upload)

3. **Posição incorreta:**
   - IA deve incluir placeholders `[ESPAÇO_PUBLICITARIO_X]`
   - Verificar se posição do anúncio corresponde ao placeholder

### Estatísticas zeradas no admin

**Sintomas:** Cards mostram "0"

**Causas:**
- Nenhum usuário completou diagnóstico ainda
- localStorage vazio

**Solução:**
- Completar um diagnóstico de teste
- Verificar `localStorage` no DevTools:
  - `diagnosticRecords`
  - `userRecords`
  - `referralRecords`

### Email não enviado automaticamente

**Sintomas:** Relatório gerado mas email não chega

**Verificação:**
1. Checar implementação do `email-service.ts`
2. Verificar configurações de API de email (se houver)
3. Verificar console do navegador por erros

**Nota:** Em desenvolvimento, função é simulada. Ver `API_IMPLEMENTATION.md` para integração real.

### Exportação CSV com caracteres estranhos

**Causa:** Encoding incorreto

**Solução:**
- Abrir CSV no Excel: Importar Dados → Encoding UTF-8
- Ou usar LibreOffice Calc (detecta automaticamente)

### Upload de banner muito lento

**Causa:** Arquivo muito grande (>5MB)

**Soluções:**
1. Comprimir imagem antes do upload
2. Usar ferramentas online: TinyPNG, Squoosh
3. Redimensionar para tamanho recomendado (728x90px)
4. Usar URL de CDN em vez de upload

### WhatsApp não dispara mensagens

**Verificações:**
1. API configurada no `.env.local`?
2. Credenciais corretas?
3. Instância conectada?
4. Número no formato correto: `5511999999999`

**Debug:**
```javascript
console.log('API URL:', import.meta.env.VITE_WHATSAPP_API_URL);
console.log('API Key:', import.meta.env.VITE_WHATSAPP_API_KEY ? 'Configurada' : 'Não configurada');
```

---

## 📞 Suporte

**Documentação adicional:**
- `API_IMPLEMENTATION.md` - Guia de integração com backend
- `CLAUDE.md` - Orientações para desenvolvimento
- `README.md` - Instruções de instalação

**Logs importantes:**
- Console do navegador (F12)
- Network tab para chamadas API
- LocalStorage para dados salvos

**Contato:**
- Issues no GitHub
- Email de suporte (configurar)

---

**Última atualização:** 10/11/2025
**Versão do sistema:** 2.0.0
