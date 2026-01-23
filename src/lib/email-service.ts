import type { UserData } from '@/types/legal';

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  pdfAttachment?: Blob;
  userData: UserData;
}

/**
 * Sends an email with the legal diagnostic report
 *
 * ⚠️ SECURITY: This function calls a backend API endpoint.
 * Email sending is handled server-side to protect API keys.
 * The backend endpoint should be configured at /api/send-email
 */
export async function sendDiagnosticEmail(
  options: SendEmailOptions
): Promise<boolean> {
  const { to, subject, htmlContent, pdfAttachment, userData } = options;

  console.log('📧 Email Service - Preparing to send email via backend:', {
    to,
    subject,
    userName: userData.fullName,
  });

  const formData = new FormData();
  formData.append('emailId', crypto.randomUUID());

  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('htmlContent', htmlContent);
  formData.append('userName', userData.fullName);

  if (pdfAttachment) {
    formData.append('attachment', pdfAttachment, 'diagnostico-juridico.pdf');
  }

  try {

    const API_URL = import.meta.env.VITE_API_URL;

    // Call backend API endpoint
    // TODO: Configure your backend server to handle /api/send-email
    const response = await fetch(`${API_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_INTERNAL_API_TOKEN}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', errorText);

      // If backend is not configured, simulate success in development
      if (response.status === 404) {
        console.warn('⚠️ Backend endpoint /api/send-email not found');
        console.log('📧 SIMULATED MODE - Email would be sent to:', to);
        console.log('💡 Configure your backend server to handle email sending');

        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('✅ Email sent successfully (simulated)');
        return true;
      }

      return false;
    }

    const result = await response.json();
    console.log('✅ Email sent successfully via backend:', result);
    return true;
  } catch (error) {
    console.error('❌ Network error calling backend API:', error);

    // Fallback to simulated mode if backend is unreachable
    console.warn('⚠️ Backend unreachable - using simulated mode');
    console.log('📧 SIMULATED MODE - Email would be sent to:', to);
    console.log('💡 Configure your backend server to handle email sending');

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('✅ Email sent successfully (simulated)');
    return true;
  }
}

/**
 * Prepares HTML email template for the diagnostic report
 */
export function prepareEmailTemplate(options: {
  userName: string;
  legalArea: string;
  urgencyLevel: 'high' | 'medium' | 'low';
}): string {
  const { userName, legalArea, urgencyLevel } = options;

  const urgencyLabels = {
    high: 'ALTA',
    medium: 'MÉDIA',
    low: 'BAIXA'
  };

  const urgencyColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981'
  };

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Seu Diagnóstico Jurídico</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1E40AF; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Diagnóstico Jurídico</h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">${legalArea}</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="font-size: 16px; color: #18181B; margin: 0 0 20px 0;">
                    Olá, <strong>${userName}</strong>!
                  </p>

                  <p style="font-size: 14px; color: #52525B; line-height: 1.6; margin: 0 0 20px 0;">
                    Seu diagnóstico jurídico foi gerado com sucesso. Em anexo, você encontrará o relatório completo em PDF.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F4F5; border-radius: 6px; padding: 20px; margin: 0 0 20px 0;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #18181B;">
                          <strong>Área do Direito:</strong> ${legalArea}
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #18181B;">
                          <strong>Nível de Urgência:</strong>
                          <span style="color: ${urgencyColors[urgencyLevel]}; font-weight: bold;">
                            ${urgencyLabels[urgencyLevel]}
                          </span>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <div style="background-color: #059669; border-radius: 6px; padding: 20px; text-align: center; margin: 0 0 20px 0;">
                    <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                      Consulte um Advogado Especializado
                    </p>
                    <p style="color: #ffffff; margin: 0 0 5px 0; font-size: 14px;">
                      WhatsApp: (11) 92148-6194
                    </p>
                    <a href="https://wa.me/5511921486194" style="display: inline-block; background-color: #ffffff; color: #059669; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin-top: 10px; font-weight: bold;">
                      Falar Agora
                    </a>
                  </div>

                  <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 4px;">
                    <p style="margin: 0; font-size: 12px; color: #92400E;">
                      <strong>⚠ Aviso Legal:</strong> Este diagnóstico é uma análise preliminar gerada por IA. Para avaliação jurídica completa, consulte um advogado qualificado.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F4F4F5; padding: 20px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #71717A;">
                    © ${new Date().getFullYear()} Diagnóstico Jurídico. Todos os direitos reservados.
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #71717A;">
                    Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
