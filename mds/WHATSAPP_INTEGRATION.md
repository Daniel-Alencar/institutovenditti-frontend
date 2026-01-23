# Integração WhatsApp - Sistema de Diagnóstico Jurídico

## 📱 Visão Geral

O sistema envia automaticamente mensagens WhatsApp para os amigos indicados pelos usuários após o preenchimento do formulário de dados. A mensagem é enviada do número do **Instituto Venditti** (+55 11 92148-6194).

## 🎯 Funcionalidade

Quando um usuário:
1. Completa o questionário jurídico
2. Clica em "Enviar Relatório"
3. Preenche seus dados pessoais
4. **Indica um amigo** (nome + WhatsApp)
5. Aceita o disclaimer

**O sistema automaticamente envia**:
- **Remetente**: Instituto Venditti (+55 11 92148-6194)
- **Destinatário**: Número do WhatsApp do amigo indicado
- **Mensagem**: Convite personalizado com link de acesso ao sistema

## 🔧 Configuração da WhatsApp Business API

### Passo 1: Obter Credenciais da Meta

1. Acesse o [Meta Business Suite](https://business.facebook.com/)
2. Vá para **WhatsApp Business API**
3. Configure seu número de telefone (+55 11 92148-6194)
4. Obtenha:
   - **Phone Number ID** (ID do número de telefone)
   - **Access Token** (Token de acesso permanente)

### Passo 2: Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto com:

```bash
# WhatsApp Business API
VITE_WHATSAPP_API_ENDPOINT=https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
VITE_WHATSAPP_API_TOKEN=YOUR_PERMANENT_ACCESS_TOKEN

# Site URL para o link de convite
VITE_SITE_URL=https://seudominio.com.br
```

**Exemplo real:**
```bash
VITE_WHATSAPP_API_ENDPOINT=https://graph.facebook.com/v18.0/123456789012345/messages
VITE_WHATSAPP_API_TOKEN=EAABsbCS1iHgBO7ZCKvK...
VITE_SITE_URL=https://diagnosticojuridico.com.br
```

### Passo 3: Verificar Template de Mensagem

A mensagem enviada precisa estar aprovada pela Meta como template. Atualmente usa o formato:

```
👋 Olá, *[Nome do Amigo]*!

Seu amigo(a) *[Nome do Usuário]* indicou você para conhecer nosso *Diagnóstico Jurídico Gratuito* do Instituto Venditti!

🔍 *O que é?*
É uma análise inteligente que ajuda você a entender seus direitos em diversas áreas do Direito:

• ⚖️ Trabalhista
• 🛒 Consumidor
• 👥 Previdenciário (INSS)
• ❤️ Família
• 🏛️ Civil
• 🏥 Plano de Saúde
• 🏠 Imobiliário
• 🚗 Trânsito
E muito mais!

✅ *100% Gratuito*
✅ *Rápido (5 minutos)*
✅ *Relatório em PDF*

📲 *Acesse agora e conheça seus direitos:*
[LINK DO SITE]

💬 *Dúvidas? Fale com um advogado:*
https://wa.me/5511921486194

_Mensagem enviada pelo Instituto Venditti_
```

## 🛠️ Alternativas de Provedores

Se não usar a WhatsApp Business API oficial, você pode usar:

### Opção 1: Twilio
```bash
VITE_WHATSAPP_PROVIDER=twilio
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=+14155238886
```

### Opção 2: MessageBird
```bash
VITE_WHATSAPP_PROVIDER=messagebird
VITE_MESSAGEBIRD_API_KEY=your_api_key
VITE_MESSAGEBIRD_WHATSAPP_NUMBER=+31612345678
```

## 🔄 Fluxo de Funcionamento

```
Usuário preenche formulário
         ↓
UserDataForm.tsx (linha 39-57)
         ↓
sendReferralInvitation()
         ↓
WhatsApp Business API
         ↓
Mensagem enviada para o amigo
```

## 🧪 Modo de Desenvolvimento

Se as variáveis `VITE_WHATSAPP_API_ENDPOINT` ou `VITE_WHATSAPP_API_TOKEN` **não estiverem configuradas**:

- ⚠️ O sistema **não enviará** mensagens reais
- 📝 A mensagem será **apenas logada no console**
- ✅ O fluxo do usuário **não será bloqueado**
- 🔍 Útil para desenvolvimento e testes

**Log no console:**
```javascript
⚠️ WhatsApp API credentials not configured. Message will be logged but not sent.
📱 Message that would be sent: {
  from: "5511921486194",
  to: "5511987654321",
  message: "..."
}
```

## 📋 Checklist de Implementação

- [x] Serviço WhatsApp implementado (`src/lib/whatsapp-service.ts`)
- [x] Integração no formulário (`src/components/legal/UserDataForm.tsx`)
- [x] Variáveis de ambiente documentadas (`.env.example`)
- [x] Tratamento de erros (não bloqueia o fluxo do usuário)
- [x] Logs para debug e monitoramento
- [ ] Configurar credenciais reais da Meta WhatsApp Business API
- [ ] Testar envio de mensagens em produção
- [ ] Aprovar template de mensagem na Meta

## 🚨 Segurança e Boas Práticas

1. **Nunca commite** as credenciais reais (use `.env.local`)
2. **Use tokens permanentes** para produção (não tokens temporários)
3. **Configure webhooks** para receber status de entrega
4. **Monitore logs** de erro para mensagens não enviadas
5. **Respeite limites** de API da Meta (1000 conversas/mês gratuitas)

## 📊 Monitoramento

Logs importantes para monitorar:

```javascript
✅ WhatsApp message sent successfully
❌ Error sending WhatsApp message
📝 MESSAGE TO BE SENT MANUALLY (quando falha)
```

## 🆘 Troubleshooting

### Erro: "WhatsApp API credentials not configured"
- Verifique se `.env.local` existe
- Confirme que as variáveis estão com prefixo `VITE_`
- Reinicie o servidor de desenvolvimento

### Erro: "WhatsApp API error: 401"
- Token de acesso inválido ou expirado
- Gere um novo token permanente na Meta

### Erro: "WhatsApp API error: 403"
- Número de telefone não verificado
- Template de mensagem não aprovado

### Mensagem não chega
- Verifique se o número do destinatário está correto
- Confirme que o número tem WhatsApp ativo
- Verifique logs no painel da Meta

## 📞 Suporte

Para dúvidas sobre a integração WhatsApp:
- WhatsApp Instituto Venditti: https://wa.me/5511921486194
- Documentação Meta: https://developers.facebook.com/docs/whatsapp
