import { formatWhatsApp } from '@/lib/scoring';

export interface SendWhatsAppOptions {
  phoneNumber: string;
  userName: string;
  legalArea: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  pdfUrl?: string;
}

/**
 * Sends a WhatsApp message with the legal diagnostic report
 */
export async function sendDiagnosticWhatsApp(
  options: SendWhatsAppOptions
): Promise<boolean> {
  const { phoneNumber, userName, legalArea, urgencyLevel, pdfUrl } = options;

  try {
    const message = prepareWhatsAppMessage({
      userName,
      legalArea,
      urgencyLevel,
      pdfUrl,
    });

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55')
      ? cleanNumber
      : `55${cleanNumber}`;

    const response = await fetch(
      `${import.meta.env.VITE_EVOLUTION_API_URL}/message/sendText/${import.meta.env.VITE_EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          number: fullNumber,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Evolution API error:', error);
      return false;
    }

    console.log('✅ WhatsApp message sent via Evolution API');
    return true;

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return false;
  }
}


/**
 * Prepares WhatsApp message template for the diagnostic report
 */
export function prepareWhatsAppMessage(options: {
  userName: string;
  legalArea: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  pdfUrl?: string;
}): string {
  const { userName, legalArea, urgencyLevel, pdfUrl } = options;

  const urgencyLabels = {
    high: 'ALTA',
    medium: 'MÉDIA',
    low: 'BAIXA'
  };

  const urgencyEmojis = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };

  let message = `🔔 *Diagnóstico Jurídico Concluído*\n\n`;
  message += `Olá, *${userName}*!\n\n`;
  message += `Seu diagnóstico jurídico foi gerado com sucesso.\n\n`;
  message += `📋 *Detalhes:*\n`;
  message += `• Área: ${legalArea}\n`;
  message += `• Urgência: ${urgencyEmojis[urgencyLevel]} ${urgencyLabels[urgencyLevel]}\n\n`;

  if (pdfUrl) {
    message += `📄 *Relatório em PDF:*\n`;
    message += `${pdfUrl}\n\n`;
  }

  message += `⚖️ *Próximo Passo Importante:*\n`;
  message += `Para uma avaliação jurídica completa e orientação especializada, consulte um advogado.\n\n`;
  message += `💬 *Fale com um Advogado Especializado:*\n`;
  message += `https://wa.me/5511921486194\n\n`;
  message += `⚠️ _Este diagnóstico é uma análise preliminar gerada por IA. Para avaliação completa, consulte um profissional qualificado._`;

  return message;
}

/**
 * Opens WhatsApp Web/App with a pre-filled message
 * This is useful for manual sending or as a fallback
 */
export function openWhatsAppWithMessage(
  phoneNumber: string, message: string
): void {
  // Remove all non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Create WhatsApp URL
  const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  // Open in new tab
  window.open(url, '_blank');
}

/**
 * Sends a referral invitation via WhatsApp to a friend
 * Uses WhatsApp Business API with Instituto Venditti number as sender
 */
export async function sendReferralInvitation(options: {
  friendName: string;
  friendWhatsApp: string;
  referredBy: string;
}): Promise<boolean> {
  const { friendName, friendWhatsApp, referredBy } = options;

  try {
    // 1️⃣ Monta mensagem
    const message = prepareReferralMessage({ friendName, referredBy });

    // 2️⃣ Normaliza número
    const cleanNumber = friendWhatsApp.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('55')
      ? cleanNumber
      : `55${cleanNumber}`;

    // 3️⃣ Variáveis de ambiente
    const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL;
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
    const instance = import.meta.env.VITE_EVOLUTION_INSTANCE;

    if (!apiUrl || !apiKey || !instance) {
      throw new Error('Evolution API environment variables not configured');
    }

    // 4️⃣ Chamada à Evolution API
    const response = await fetch(
      `${apiUrl}/message/sendText/${instance}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify({
          number: fullNumber,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    console.log('✅ Referral WhatsApp sent via Evolution API:', result);
    return true;

  } catch (error) {
    console.error('❌ Error sending referral invitation:', error);
    return false;
  }
}

/**
 * Prepares referral invitation message for WhatsApp
 */
export function prepareReferralMessage(options: {
  friendName: string;
  referredBy: string;
}): string {
  const { friendName, referredBy } = options;

  // Get the current site URL for the referral link
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

  let message = `👋 Olá, *${friendName}*!\n\n`;
  message += `Seu amigo(a) *${referredBy}* indicou você para conhecer nosso *Diagnóstico Jurídico Gratuito* do Instituto Venditti!\n\n`;
  message += `🔍 *O que é?*\n`;
  message += `É uma análise inteligente que ajuda você a entender seus direitos em diversas áreas do Direito:\n\n`;
  message += `• ⚖️ Trabalhista\n`;
  message += `• 🛒 Consumidor\n`;
  message += `• 👥 Previdenciário (INSS)\n`;
  message += `• ❤️ Família\n`;
  message += `• 🏛️ Civil\n`;
  message += `• 🏥 Plano de Saúde\n`;
  message += `• 🏠 Imobiliário\n`;
  message += `• 🚗 Trânsito\n`;
  message += `E muito mais!\n\n`;
  message += `✅ *100% Gratuito*\n`;
  message += `✅ *Rápido (5 minutos)*\n`;
  message += `✅ *Relatório em PDF*\n\n`;
  message += `📲 *Acesse agora e conheça seus direitos:*\n`;
  message += `${siteUrl}\n\n`;
  message += `💬 *Dúvidas? Fale com um advogado:*\n`;
  message += `https://wa.me/5511921486194\n\n`;
  message += `_Mensagem enviada pelo Instituto Venditti_`;

  return message;
}
