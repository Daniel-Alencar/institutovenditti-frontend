import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callMCPTool } from '@/sdk/core/mcp-client';

// MCP Response wrapper interface - MANDATORY
export interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string; // JSON string containing actual tool data
  }>;
}

// Gmail MCP tool input schema
export interface GmailSendEmailInput {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

// Gmail MCP tool output schema
export interface GmailSendEmailOutput {
  success: boolean;
  messageId: string;
  message: string;
}

// Hook input parameters
export interface SendLegalReportEmailParams {
  recipientEmail: string;
  recipientName: string;
  legalArea: string;
  reportContent: string; // markdown format
  urgencyLevel: "high" | "medium" | "low";
}

/**
 * Simple markdown to HTML converter for email content
 * Supports: headings, bold, italic, links, lists, code blocks, paragraphs
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Code blocks (must be before inline code)
  html = html.replace(/```([^`]+)```/g, '<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace;">$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 24px 0 12px 0;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="color: #1a1a1a; font-size: 22px; font-weight: 600; margin: 28px 0 14px 0;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="color: #1a1a1a; font-size: 26px; font-weight: 700; margin: 32px 0 16px 0;">$1</h1>');

  // Bold (must be before italic)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em style="font-style: italic;">$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>');

  // Unordered lists
  html = html.replace(/^\* (.+)$/gm, '<li style="margin: 4px 0;">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>)/s, '<ul style="margin: 12px 0; padding-left: 24px; list-style-type: disc;">$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin: 4px 0;">$1</li>');

  // Paragraphs (split by double newlines)
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    // Don't wrap if already wrapped in HTML tags
    if (p.trim().startsWith('<')) {
      return p;
    }
    return `<p style="margin: 12px 0; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

/**
 * Generate professional HTML email template with Law Design branding
 */
function generateEmailTemplate(params: SendLegalReportEmailParams): string {
  const { recipientName, legalArea, reportContent, urgencyLevel } = params;

  // Convert markdown report to HTML
  const reportHtml = markdownToHtml(reportContent);

  // Urgency indicators
  const urgencyConfig = {
    high: {
      badge: '⚠️ URGENTE',
      color: '#dc2626',
      backgroundColor: '#fee2e2',
      summary: 'Este diagnóstico identificou questões jurídicas que requerem atenção imediata.',
    },
    medium: {
      badge: '📋 ATENÇÃO',
      color: '#ea580c',
      backgroundColor: '#ffedd5',
      summary: 'Este diagnóstico identificou pontos importantes que merecem sua atenção.',
    },
    low: {
      badge: '✅ INFORMATIVO',
      color: '#16a34a',
      backgroundColor: '#dcfce7',
      summary: 'Este diagnóstico fornece uma visão completa da sua situação jurídica.',
    },
  };

  const urgency = urgencyConfig[urgencyLevel];

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnóstico Jurídico - Law Design</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Law Design</h1>
              <p style="margin: 8px 0 0 0; color: #dbeafe; font-size: 14px;">Soluções Jurídicas Inteligentes</p>
            </td>
          </tr>

          <!-- Urgency Badge -->
          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <div style="display: inline-block; background-color: ${urgency.backgroundColor}; color: ${urgency.color}; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; border-left: 4px solid ${urgency.color};">
                ${urgency.badge}
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                Olá <strong style="color: #1f2937;">${recipientName}</strong>,
              </p>
            </td>
          </tr>

          <!-- Executive Summary -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
                  <strong>Área Jurídica:</strong> ${legalArea}
                </p>
                <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                  ${urgency.summary}
                </p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 32px 32px 32px; color: #374151; font-size: 15px; line-height: 1.6;">
              ${reportHtml}
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 14px 32px; border-radius: 6px; text-align: center;">
                    <a href="mailto:contato@lawdesign.com.br?subject=Consultoria sobre ${encodeURIComponent(legalArea)}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; display: block;">
                      Agendar Consultoria
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #9ca3af;">
                Nossa equipe está pronta para ajudar você
              </p>
            </td>
          </tr>

          <!-- Legal Disclaimer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                <strong style="color: #374151;">Aviso Legal:</strong> Este diagnóstico jurídico é baseado nas informações fornecidas e tem caráter informativo. Não constitui aconselhamento jurídico formal. Para uma análise completa do seu caso, recomendamos agendar uma consultoria com nossos advogados especializados.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #1f2937; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 14px; color: #ffffff; font-weight: 600;">Law Design</p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #9ca3af;">
                Email: contato@lawdesign.com.br
              </p>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #9ca3af;">
                Telefone: (11) 3456-7890
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">
                © ${new Date().getFullYear()} Law Design. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate subject line based on legal area and urgency level
 */
function generateSubjectLine(legalArea: string, urgencyLevel: "high" | "medium" | "low"): string {
  const subjectMap = {
    high: `⚠️ URGENTE: Seu Diagnóstico Jurídico - ${legalArea}`,
    medium: `📋 Seu Diagnóstico Jurídico - ${legalArea}`,
    low: `✅ Diagnóstico Jurídico Completo - ${legalArea}`,
  };

  return subjectMap[urgencyLevel];
}

/**
 * Custom hook for sending legal report emails via Gmail MCP
 *
 * Features:
 * - Professional HTML email template with Law Design branding
 * - Markdown-to-HTML conversion for report content
 * - Urgency-based subject lines and visual indicators
 * - Legal disclaimers and call-to-action
 * - Error handling and validation
 * - Automatic query invalidation on success
 *
 * @example
 * const sendEmail = useSendLegalReportEmail();
 *
 * await sendEmail.mutateAsync({
 *   recipientEmail: "cliente@example.com",
 *   recipientName: "João Silva",
 *   legalArea: "Direito Trabalhista",
 *   reportContent: "# Análise\n\nSeu caso requer atenção...",
 *   urgencyLevel: "high"
 * });
 */
export function useSendLegalReportEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendLegalReportEmailParams) => {
      // Validate input parameters
      if (!params.recipientEmail) {
        throw new Error('Recipient email is required');
      }

      if (!params.recipientName) {
        throw new Error('Recipient name is required');
      }

      if (!params.legalArea) {
        throw new Error('Legal area is required');
      }

      if (!params.reportContent) {
        throw new Error('Report content is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(params.recipientEmail)) {
        throw new Error('Invalid email format');
      }

      // Generate email content
      const subject = generateSubjectLine(params.legalArea, params.urgencyLevel);
      const htmlBody = generateEmailTemplate(params);

      // Prepare Gmail MCP tool input
      const gmailInput: GmailSendEmailInput = {
        to: params.recipientEmail,
        subject: subject,
        body: htmlBody,
      };

      // CRITICAL: Call MCP tool with MCPToolResponse and parse JSON response
      const mcpResponse = await callMCPTool<MCPToolResponse, GmailSendEmailInput>(
        '686de5276fd1cae1afbb55be', // Gmail MCP server ID
        'gmail_send_email',
        gmailInput
      );

      if (!mcpResponse.content?.[0]?.text) {
        throw new Error('Invalid MCP response format: missing content[0].text');
      }

      try {
        const toolData: GmailSendEmailOutput = JSON.parse(mcpResponse.content[0].text);

        // Validate successful response
        if (!toolData.success) {
          throw new Error(toolData.message || 'Failed to send email');
        }

        return toolData;
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          throw new Error(`Failed to parse MCP response JSON: ${parseError.message}`);
        }
        throw parseError;
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['legal-reports'] });
      queryClient.invalidateQueries({ queryKey: ['sent-emails'] });

      console.log('Legal report email sent successfully:', {
        messageId: data.messageId,
        timestamp: new Date().toISOString(),
      });
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
