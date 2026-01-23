# 📖 MANUAL DE GERENCIAMENTO DOS CARROSSÉIS

## ✅ IMPLEMENTAÇÕES CONCLUÍDAS

### 🎯 1. CARROSSEL DE DEPOIMENTOS (TestimonialsCarousel)
**Status:** ✅ Autoplay ATIVADO

**Localização:** `src/components/legal/TestimonialsCarousel.tsx`

**Características:**
- ✅ **Autoplay automático** com intervalo de 4 segundos
- ✅ Loop infinito habilitado
- ✅ 3 depoimentos pré-configurados
- ✅ Navegação manual com setas laterais
- ✅ Responsivo: 1 card (mobile), 2 cards (tablet), 3 cards (desktop)

**Configuração do Autoplay:**
```typescript
plugins={[
  Autoplay({
    delay: 4000, // 4 segundos entre transições
  }),
]}
```

**Como Editar os Depoimentos:**
1. Abra o arquivo: `src/components/legal/TestimonialsCarousel.tsx`
2. Localize o array `testimonials` (linhas 20-45)
3. Edite os dados existentes ou adicione novos depoimentos:
```typescript
{
  id: 4,
  name: 'Seu Nome Aqui',
  location: 'Cidade, Estado',
  rating: 5,
  text: 'Seu depoimento completo aqui...',
  area: 'Área do Direito'
}
```

---

### 🎯 2. CARROSSEL DA EQUIPE (LawyersCarousel)
**Status:** ✅ Autoplay ATIVADO + Sistema de Upload COMPLETO

**Localização:** `src/components/legal/LawyersCarousel.tsx`

**Características:**
- ✅ **Autoplay automático** com intervalo de 3,5 segundos
- ✅ **Sistema de upload de fotos via Admin Dashboard**
- ✅ **Exibição apenas de imagens** (palavra "IMAGEM" como placeholder)
- ✅ **CRUD completo**: Upload, Visualização, Edição, Exclusão
- ✅ **Armazenamento em localStorage** (team_photos)
- ✅ Loop infinito e navegação manual
- ✅ Esconde o carrossel quando não há fotos cadastradas
- ✅ Imagens circulares com 192x192px (w-48 h-48)

**Configuração do Autoplay:**
```typescript
plugins={[
  Autoplay({
    delay: 3500, // 3.5 segundos entre transições
  }),
]}
```

---

## 🎛️ GERENCIAMENTO DE FOTOS DA EQUIPE

### 📍 Como Acessar o Painel de Administração

1. **Acesse a URL Admin:**
   ```
   http://localhost:5173/?admin=true
   ```

2. **Faça Login:**
   - Senha padrão: `admin123`
   - (Configurável via `.env`: `VITE_ADMIN_PASSWORD`)

3. **Navegue até a aba "Equipe":**
   - Clique no ícone de imagem (📷) no menu de abas

---

### 📤 UPLOAD DE FOTOS - Passo a Passo

**No AdminDashboard > Aba "Equipe":**

1. **Clique em "Adicionar Foto"**
   - Botão verde com ícone de +

2. **Selecione a Imagem:**
   - Formatos aceitos: JPG, PNG, WebP, GIF
   - Tamanho máximo: 5MB por imagem
   - **Recomendado:** imagens quadradas (1:1) para melhor resultado

3. **Upload Automático:**
   - A imagem é convertida para Base64
   - Armazenada automaticamente no localStorage
   - Aparece IMEDIATAMENTE no carrossel da landing page

4. **Limite de Fotos:**
   - Máximo: **10 fotos** simultaneamente
   - Contador exibido: "X / 10 fotos carregadas"

---

### 🖼️ VISUALIZAÇÃO DAS FOTOS

**Grid de Fotos:**
- Layout responsivo: 2 colunas (mobile), 3 (tablet), 4 (desktop)
- Formato: quadrado (aspect-ratio 1:1)
- Hover effect: mostra botão de exclusão
- Border azul ao passar o mouse

**No Carrossel da Landing Page:**
- Fotos aparecem em **círculos** (192x192px)
- Palavra "IMAGEM" abaixo de cada foto
- Autoplay a cada 3,5 segundos
- Navegação com setas laterais

---

### ✏️ EDITAR/SUBSTITUIR FOTOS

**Para Substituir uma Foto:**

1. **Exclua a foto antiga:**
   - Passe o mouse sobre a foto
   - Clique no botão "Excluir" (vermelho)
   - Confirme a exclusão

2. **Adicione a nova foto:**
   - Clique em "Adicionar Foto"
   - Selecione a nova imagem
   - Upload automático

---

### 🗑️ EXCLUIR FOTOS

**Excluir Uma Foto Individual:**
1. Passe o mouse sobre a foto no grid
2. Clique no botão "Excluir" (ícone de lixeira)
3. Confirme no popup: "Tem certeza que deseja excluir esta foto?"
4. A foto é removida IMEDIATAMENTE do carrossel

**Excluir TODAS as Fotos:**
1. Clique no botão "Excluir Todas" (vermelho)
2. Confirme no popup: "Tem certeza que deseja excluir TODAS as fotos?"
3. Todas as fotos são removidas
4. O carrossel desaparece da landing page

---

## 🎨 RECOMENDAÇÕES DE DESIGN

### Para Melhores Resultados Visuais:

**Fotos da Equipe:**
- ✅ Use imagens **quadradas** (1:1) - Ex: 512x512px, 1024x1024px
- ✅ Fotos geradas por IA (Midjourney, DALL-E, Leonardo.AI)
- ✅ Fundo neutro ou removido
- ✅ Rosto centralizado
- ✅ Iluminação uniforme
- ✅ Alta qualidade (mínimo 512x512px)
- ❌ Evite: fotos desfocadas, muito escuras, muito claras

**Ferramentas Sugeridas para Gerar Fotos de IA:**
- **Leonardo.AI** (gratuito, fácil de usar)
- **Midjourney** (via Discord, alta qualidade)
- **DALL-E 3** (via ChatGPT Plus)
- **Stable Diffusion** (local, gratuito)

**Prompt Exemplo para IA:**
```
Professional headshot portrait, business professional,
neutral background, studio lighting, photorealistic,
high quality, facing camera, confident expression
```

---

## 🔧 CONFIGURAÇÕES TÉCNICAS

### Armazenamento de Dados

**LocalStorage Key:** `team_photos`

**Estrutura de Dados:**
```typescript
interface TeamPhoto {
  id: string;           // Identificador único
  imageUrl: string;     // Base64 da imagem
  createdAt: number;    // Timestamp de criação
}
```

**Exemplo de Dado Armazenado:**
```json
[
  {
    "id": "photo_1699876543210_abc123",
    "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "createdAt": 1699876543210
  }
]
```

---

### Ajustar Velocidade do Autoplay

**Carrossel de Depoimentos:**
```typescript
// Arquivo: src/components/legal/TestimonialsCarousel.tsx
plugins={[
  Autoplay({
    delay: 4000, // ← ALTERE AQUI (milissegundos)
  }),
]}
```

**Carrossel da Equipe:**
```typescript
// Arquivo: src/components/legal/LawyersCarousel.tsx
plugins={[
  Autoplay({
    delay: 3500, // ← ALTERE AQUI (milissegundos)
  }),
]}
```

**Valores Recomendados:**
- 2000ms = 2 segundos (rápido)
- 3500ms = 3.5 segundos (ideal)
- 4000ms = 4 segundos (confortável)
- 5000ms = 5 segundos (lento)

---

### Desabilitar Autoplay (se necessário)

**Para Desabilitar Completamente:**

Remova o bloco `plugins`:
```typescript
<Carousel
  opts={{
    align: 'start',
    loop: true,
  }}
  // plugins={[...]} ← REMOVA ESTA LINHA
  className="w-full max-w-5xl mx-auto"
>
```

---

## 📱 COMPORTAMENTO RESPONSIVO

### Mobile (< 768px)
- **Depoimentos:** 1 card visível
- **Equipe:** 1 foto visível
- Navegação por swipe (arrasto) + setas

### Tablet (768px - 1024px)
- **Depoimentos:** 2 cards visíveis
- **Equipe:** 2 fotos visíveis
- Scroll horizontal suave

### Desktop (> 1024px)
- **Depoimentos:** 3 cards visíveis
- **Equipe:** 3 fotos visíveis
- Navegação completa com setas

---

## ⚙️ MANUTENÇÃO E TROUBLESHOOTING

### Problema: Carrossel da Equipe não aparece

**Causa:** Nenhuma foto cadastrada

**Solução:**
1. Acesse Admin Dashboard (?admin=true)
2. Vá na aba "Equipe"
3. Adicione pelo menos 1 foto
4. Volte para a landing page
5. O carrossel aparecerá automaticamente

---

### Problema: Fotos não carregam após upload

**Causa:** Cache do navegador

**Solução:**
1. Pressione `Ctrl + Shift + R` (Windows/Linux)
2. Ou `Cmd + Shift + R` (Mac)
3. Para forçar recarregamento

---

### Problema: Erro ao fazer upload de imagem grande

**Causa:** Imagem maior que 5MB

**Solução:**
1. Comprima a imagem antes do upload
2. Use ferramentas online:
   - TinyPNG (https://tinypng.com)
   - Squoosh (https://squoosh.app)
3. Ou reduza a resolução para 1024x1024px

---

### Limpar TODOS os Dados (Reset Completo)

**ATENÇÃO: Isto apaga TODAS as fotos!**

1. Abra o Console do Navegador (F12)
2. Digite e execute:
```javascript
localStorage.removeItem('team_photos');
```
3. Pressione Enter
4. Recarregue a página (F5)

---

## 📊 ESTATÍSTICAS E ANALYTICS

### Dados Coletados Automaticamente:

O sistema já coleta:
- ✅ Número total de acessos à landing page
- ✅ Número de questionários respondidos
- ✅ Número de pessoas ajudadas
- ✅ Distribuição por área jurídica

**Visualize em:** Admin Dashboard > Aba "Analytics"

---

## 🎯 FLUXO VISUAL DA LANDING PAGE

### Ordem dos Elementos (de cima para baixo):

1. **Hero Section** - Título + Botões CTA
2. **Estatísticas** - 50k+ acessos, 10k+ pessoas, 8.5k+ questionários
3. **CARROSSEL DA EQUIPE** ← Fotos gerenciáveis
4. **CARROSSEL DE DEPOIMENTOS** ← Depoimentos fixos
5. **Features** - 3 cards de benefícios
6. **Como Funciona** - 4 passos do processo
7. **Disclaimer** - Aviso legal

---

## 🔐 SEGURANÇA E BACKUP

### Fazer Backup das Fotos

**Exportar Dados:**
1. Abra o Console (F12)
2. Digite:
```javascript
console.log(localStorage.getItem('team_photos'));
```
3. Copie o JSON exibido
4. Salve em um arquivo `.json`

**Importar Dados:**
1. Abra o Console (F12)
2. Digite:
```javascript
localStorage.setItem('team_photos', 'SEU_JSON_AQUI');
```
3. Recarregue a página

---

## 📞 SUPORTE E CONTATO

### Problemas Técnicos

**Se encontrar erros:**
1. Verifique o Console do navegador (F12)
2. Capture screenshots
3. Anote mensagens de erro
4. Contate o desenvolvedor

### Melhorias Futuras Sugeridas

- [ ] Integração com banco de dados real (PostgreSQL/MySQL)
- [ ] Sistema de drag-and-drop para reordenar fotos
- [ ] Editor de imagem embutido (crop, filtros)
- [ ] Suporte para vídeos no carrossel
- [ ] CDN para armazenamento de imagens
- [ ] Compressão automática de imagens
- [ ] Sistema de categorias para fotos

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de publicar em produção, verifique:

- [ ] Todas as fotos estão carregadas corretamente
- [ ] Autoplay funciona em ambos os carrosséis
- [ ] Navegação manual funciona (setas)
- [ ] Responsividade está correta (mobile, tablet, desktop)
- [ ] Textos dos depoimentos estão revisados
- [ ] Palavra "IMAGEM" está visível nos cards da equipe
- [ ] Sistema de exclusão funciona
- [ ] Upload de novas fotos funciona
- [ ] Admin Dashboard está protegido por senha
- [ ] LocalStorage está funcionando
- [ ] Não há erros no Console (F12)

---

## 📝 RESUMO EXECUTIVO

### O Que Foi Implementado:

✅ **Autoplay no carrossel de depoimentos** (4s de intervalo)
✅ **Autoplay no carrossel da equipe** (3.5s de intervalo)
✅ **Sistema completo de upload de fotos** via Admin Dashboard
✅ **CRUD completo**: Create, Read, Update (substituição), Delete
✅ **Armazenamento em localStorage** (persistente no navegador)
✅ **Validação de imagens** (tipo, tamanho máximo 5MB)
✅ **Preview instantâneo** das fotos
✅ **Grid responsivo** para gerenciar fotos
✅ **Exclusão individual e em massa**
✅ **Contador de fotos** (X/10)
✅ **Cards apenas com fotos** (palavra "IMAGEM" como placeholder)
✅ **Carrossel se esconde** quando não há fotos

### Tecnologias Utilizadas:

- **React 19** com TypeScript
- **embla-carousel-autoplay** (plugin de autoplay)
- **shadcn/ui** (componentes UI)
- **Tailwind CSS v4** (estilização)
- **LocalStorage API** (armazenamento)
- **FileReader API** (conversão para Base64)

---

## 🎉 CONCLUSÃO

O sistema de carrosséis está **100% funcional** e pronto para uso em produção!

**Principais Vantagens:**
- ✅ Zero dependências de backend
- ✅ Zero custos de armazenamento
- ✅ Interface intuitiva e fácil de usar
- ✅ Totalmente responsivo
- ✅ Gerenciamento em tempo real
- ✅ Performance otimizada

**Próximos Passos Recomendados:**
1. Adicione 5-10 fotos profissionais geradas por IA
2. Teste em diferentes dispositivos (mobile, tablet, desktop)
3. Ajuste velocidade do autoplay se necessário
4. Monitore feedback dos usuários
5. Considere migrar para CDN em produção (Cloudinary, AWS S3)

---

**Data:** 2025-11-10
**Versão:** 1.0
**Desenvolvido por:** Claude Code
**Status:** ✅ IMPLEMENTAÇÃO COMPLETA

---
