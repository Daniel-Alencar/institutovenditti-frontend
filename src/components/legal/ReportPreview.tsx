import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type LegalArea, type QuestionnaireResponse, type UserData } from '@/types/legal';
import { calculateScore, getUrgencyColor, getUrgencyLabel, formatWhatsApp } from '@/lib/scoring';
import { announcementsService, diagnosticsService, referralsService } from '@/lib/data-service';
import { AdBanner } from '@/components/legal/AdBanner';
import { AlertCircle, Download, Home, MessageCircle, Mail, Loader2, ExternalLink } from 'lucide-react';

interface ReportPreviewProps {
  area: LegalArea;
  responses: QuestionnaireResponse[];
  userData: UserData;
  onBackToStart: () => void;
}

export function ReportPreview({ 
  area, responses, userData, onBackToStart 
}: ReportPreviewProps) {
  const [aiReport, setAiReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [emailSentAutomatically, setEmailSentAutomatically] = useState(false);

  const score = calculateScore(area.questions, responses);
  const urgencyColor = getUrgencyColor(score.urgencyLevel);
  const urgencyLabel = getUrgencyLabel(score.urgencyLevel);

  // Get active announcements
  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      const announcements = await announcementsService.getActive();
      setActiveAnnouncements(announcements);
    };
    loadAnnouncements();
  }, []);

  // Prepare WhatsApp message with user name and area
  const lawyerWhatsAppMessage = `Olá! Meu nome é ${userData.fullName} e acabei de preencher o questionário de diagnóstico jurídico na área de ${area.name}. Gostaria de conversar com um advogado especializado.`;

  const hasRunRef = useRef(false);

  useEffect(() => {
    
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    
    console.log('🔥 useEffect executado');
    
    const generateReport = async () => {
      try {
        const { generateAIAnalysis } = await import('@/lib/ai-analysis');

        const report = await generateAIAnalysis({
          area,
          responses,
          totalScore: score.totalPoints,
          urgencyLevel: score.urgencyLevel
        });

        setAiReport(report);
        setIsGenerating(false);

        await diagnosticsService.create({
          userId: userData.email,
          area,
          responses,
          userData,
          totalScore: score.totalPoints,
          urgencyLevel: score.urgencyLevel,
          aiReport: report,
        });

        if (userData.referralName && userData.referralWhatsapp) {
          await referralsService.create({
            referrerName: userData.fullName,
            referrerEmail: userData.email,
            referrerWhatsapp: userData.whatsapp,
            referredName: userData.referralName,
            referredWhatsapp: userData.referralWhatsapp,
          });
        }

        await handleSendWhatsApp();
        await handleSendEmail();

      } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        const mockReport = generateMockReport();
        setAiReport(mockReport);
        setIsGenerating(false);
      }
    };

    generateReport();
  }, []);


  const generateMockReport = () => {
    return `
      # Diagnóstico Jurídico - ${area.name}

      ## Análise da Situação

      Prezado(a) ${userData.fullName},

      Após análise cuidadosa das informações fornecidas no questionário sobre **${area.name}**, identificamos aspectos importantes que merecem sua atenção.

      ### Nível de Urgência: ${urgencyLabel}

      Com base nas respostas fornecidas, sua situação foi classificada com **${urgencyLabel.toLowerCase()}** (pontuação: ${score.totalPoints} pontos). ${
        score.urgencyLevel === 'high'
          ? 'Este nível indica que sua situação requer atenção jurídica **imediata**. Recomendamos fortemente que você consulte um advogado especializado o quanto antes.'
          : score.urgencyLevel === 'medium'
          ? 'Este nível sugere que você deve buscar orientação jurídica em breve para evitar que a situação se agrave.'
          : 'Embora sua situação não pareça crítica no momento, é importante estar ciente de seus direitos e monitorar possíveis desenvolvimentos.'
      }

      ## Principais Pontos Identificados

      ${generateKeyPoints(area, responses)}

      ## Recomendações e Próximos Passos

      ### 1. Documentação
      - Reúna todos os documentos relacionados à sua situação
      - Organize comprovantes, contratos, emails e mensagens
      - Tire fotos/prints de evidências relevantes

      ### 2. Prazos Legais
      ⚠️ **Importante**: Muitas ações judiciais possuem prazos de prescrição. Não deixe para depois!

      ### 3. Consultoria Especializada
      Para uma avaliação precisa e completa, recomendamos consultar um advogado especializado em ${area.name}.

      ## Entre em Contato com um Especialista

      [**FALAR COM ADVOGADO ESPECIALISTA**](https://wa.me/5511921486194)

      Um advogado poderá:
      - Avaliar detalhadamente seu caso
      - Identificar todas as possibilidades legais
      - Representá-lo judicialmente se necessário
      - Orientá-lo sobre a melhor estratégia

      ## Aviso Legal Importante

      ⚠️ **Este diagnóstico é apenas uma análise preliminar e educativa, gerada por inteligência artificial.**

      **LIMITAÇÕES:**
      - Pode conter imprecisões ou estar desatualizado
      - Não considera todas as nuances do seu caso específico
      - Não substitui consulta com advogado
      - Não constitui aconselhamento jurídico formal

      **Para uma análise jurídica completa e confiável, consulte sempre um advogado devidamente habilitado.**

      ---

      *Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}*
    `;
  };

  const generateKeyPoints = (area: LegalArea, responses: QuestionnaireResponse[]) => {
    const points: string[] = [];

    responses.forEach((response) => {
      const question = area.questions.find(q => q.id === response.questionId);
      if (!question) return;

      if (question.type === 'radio' && typeof response.answer === 'string') {
        const option = question.options?.find(opt => opt.value === response.answer);
        if (option && option.points > 15) {
          points.push(`- **${question.text}**: ${option.label}`);
        }
      } else if (question.type === 'checkbox' && Array.isArray(response.answer)) {
        const selectedOptions = question.options?.filter(opt => response.answer.includes(opt.value));
        if (selectedOptions && selectedOptions.length > 0) {
          points.push(`- **${question.text}**: ${selectedOptions.map(o => o.label).join(', ')}`);
        }
      }
    });

    return points.length > 0 ? points.join('\n') : '- Análise detalhada das respostas fornecidas';
  };

  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);

      // Dynamically import PDF generation library
      const { 
        generateLegalReportPDF, 
        downloadPDF 
      } = await import('@/lib/pdf-generator');

      // Generate PDF
      const pdfBlob = await generateLegalReportPDF({
        area,
        userData,
        aiReport,
        totalScore: score.totalPoints,
        urgencyLevel: score.urgencyLevel
      });

      // Download PDF
      const filename = `Diagnostico_${area.id}_${userData.fullName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdfBlob, filename);

      alert('✅ PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('❌ Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);

      // Dynamically import services
      const { 
        sendDiagnosticEmail, 
        prepareEmailTemplate 
      } = await import('@/lib/email-service');
      const { generateLegalReportPDF } = await import('@/lib/pdf-generator');

      // Generate PDF for attachment
      const pdfBlob = await generateLegalReportPDF({
        area,
        userData,
        aiReport,
        totalScore: score.totalPoints,
        urgencyLevel: score.urgencyLevel
      });

      // Prepare email
      const htmlContent = prepareEmailTemplate({
        userName: userData.fullName,
        legalArea: area.name,
        urgencyLevel: score.urgencyLevel
      });

      // Send email (currently simulated)
      await sendDiagnosticEmail({
        to: userData.email,
        subject: `Seu Diagnóstico Jurídico - ${area.name}`,
        htmlContent,
        pdfAttachment: pdfBlob,
        userData
      });

      alert(`✅ Email enviado com sucesso para ${userData.email}!`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Erro ao enviar email. Tente novamente.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      setIsSendingWhatsApp(true);

      // Dynamically import services
      const { 
        sendDiagnosticWhatsApp, 
        prepareWhatsAppMessage, 
        sendReferralInvitation, 
        prepareReferralMessage 
      } = await import('@/lib/whatsapp-service');

      // Prepare WhatsApp message
      const message = prepareWhatsAppMessage({
        userName: userData.fullName,
        legalArea: area.name,
        urgencyLevel: score.urgencyLevel
      });

      // Send WhatsApp to user (currently simulated)
      await sendDiagnosticWhatsApp({
        phoneNumber: userData.whatsapp,
        userName: userData.fullName,
        legalArea: area.name,
        urgencyLevel: score.urgencyLevel
      });

      // Send referral invitation to friend if provided
      if (userData.referralName && userData.referralWhatsapp) {
        const referralMessage = prepareReferralMessage({
          friendName: userData.referralName,
          referredBy: userData.fullName
        });

        await sendReferralInvitation({
          friendName: userData.referralName,
          friendWhatsApp: userData.referralWhatsapp,
          referredBy: userData.fullName
        });

        alert(`✅ Mensagem enviada para você e convite enviado para ${userData.referralName}!`);
      } else {
        alert(`✅ Mensagem enviada para WhatsApp ${formatWhatsApp(userData.whatsapp)}!`);
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      alert('❌ Erro ao enviar WhatsApp. Tente novamente.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={`https://wa.me/5511921486194?text=${encodeURIComponent(lawyerWhatsAppMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" className="rounded-full shadow-lg bg-green-600 hover:bg-green-700 h-16 w-16 p-0">
            <MessageCircle className="h-8 w-8" />
          </Button>
        </a>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Seu Diagnóstico Jurídico</h1>
        <p className="text-zinc-600">
          Olá, {userData.fullName}! Aqui está sua análise personalizada.
        </p>
        <div className="mt-4">
          <a
            href={`https://wa.me/5511921486194?text=${encodeURIComponent(lawyerWhatsAppMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
              <MessageCircle className="mr-2 h-4 w-4" />
              Falar com Advogado: (11) 92148-6194
            </Button>
          </a>
        </div>
      </div>

      {/* Email Sent Notification */}
      {emailSentAutomatically && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Mail className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>✅ Email enviado com sucesso!</strong> O seu relatório completo em PDF foi enviado para <strong>{userData.email}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Score Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{area.name}</span>
            <Badge className={urgencyColor}>{urgencyLabel}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-zinc-900">{score.totalPoints}</div>
              <div className="text-sm text-zinc-600">Pontos de Risco</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{responses.length}</div>
              <div className="text-sm text-zinc-600">Respostas Analisadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{urgencyLabel}</div>
              <div className="text-sm text-zinc-600">Nível de Urgência</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Report */}
      {isGenerating ? (
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-zinc-600" />
            <p className="text-lg text-zinc-600">Gerando seu relatório com inteligência artificial...</p>
            <p className="text-sm text-zinc-500 mt-2">Isso pode levar alguns segundos</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Relatório Detalhado</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-zinc max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {aiReport.split('\n').map((line, idx) => {
                // 🎯 Handle Advertisement Placeholders
                if (line.trim().startsWith('[ESPAÇO_PUBLICITARIO_')) {
                  const adNumber = Number.parseInt(line.match(/\[ESPAÇO_PUBLICITARIO_(\d+)\]/)?.[1] || '1');
                  const announcement = activeAnnouncements.find(a => a.position === adNumber);

                  if (announcement) {
                    return <AdBanner key={idx} announcement={announcement} position={adNumber} />;
                  }

                  // Fallback: show placeholder if no announcement configured
                  const adColors: Record<number, { bg: string; border: string }> = {
                    1: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200' },
                    2: { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200' },
                    3: { bg: 'from-green-50 to-teal-50', border: 'border-green-200' },
                    4: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200' }
                  };
                  const colors = adColors[adNumber] || adColors[1];

                  return (
                    <div key={idx} className={`my-8 p-6 bg-gradient-to-r ${colors.bg} rounded-lg border-2 border-dashed ${colors.border}`}>
                      <p className="text-xs text-zinc-500 mb-3 font-medium text-center">Espaço Publicitário {adNumber}</p>
                      <div className="h-24 bg-white rounded-lg flex items-center justify-center border border-dashed border-zinc-300">
                        <span className="text-zinc-400 text-sm">Nenhum anúncio configurado</span>
                      </div>
                    </div>
                  );
                }

                // Handle section titles (all caps)
                if (line.trim() && line === line.toUpperCase() && line.length > 5 && !line.includes('•') && !line.includes('-')) {
                  return <h2 key={idx} className="text-lg font-bold mt-6 mb-3 text-zinc-900 uppercase">{line}</h2>;
                }

                // Handle bullet points with •
                if (line.trim().startsWith('•')) {
                  return <li key={idx} className="ml-6 mb-1 text-zinc-700">{line.replace('•', '').trim()}</li>;
                }

                // Handle numbered lists
                if (/^\d+\./.test(line.trim())) {
                  return <p key={idx} className="mb-2 font-semibold text-zinc-800">{line}</p>;
                }

                // Handle subsections with ○
                if (line.trim().startsWith('○')) {
                  return <li key={idx} className="ml-8 mb-1 text-zinc-600 list-circle">{line.replace('○', '').trim()}</li>;
                }

                // Handle separator lines
                if (line.trim() === '---') {
                  return <Separator key={idx} className="my-6" />;
                }

                // Handle empty lines
                if (line.trim() === '') {
                  return <br key={idx} />;
                }

                // Handle lines starting with ⚠️
                if (line.includes('⚠️')) {
                  return (
                    <p key={idx} className="mb-2 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-900 font-medium">
                      {line}
                    </p>
                  );
                }

                // Regular paragraphs
                return <p key={idx} className="mb-2 text-zinc-700">{line}</p>;
              })}

              {/* CTA Button at the end of report */}
              <div className="my-8 text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <a
                  href={`https://wa.me/5511921486194?text=${encodeURIComponent(lawyerWhatsAppMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <MessageCircle className="mr-2" />
                    Falar com Advogado Especialista
                  </Button>
                </a>
                <p className="text-sm text-zinc-600 mt-3">WhatsApp: (11) 92148-6194</p>
                <p className="text-xs text-zinc-500 mt-2">Tire suas dúvidas com um especialista</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!isGenerating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Receba seu Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={handleDownloadPDF} variant="outline" className="w-full" disabled={isDownloadingPDF}>
                {isDownloadingPDF ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                {isDownloadingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
              </Button>
              <Button onClick={handleSendEmail} variant="outline" className="w-full" disabled={isSendingEmail}>
                {isSendingEmail ? <Loader2 className="mr-2 animate-spin" /> : <Mail className="mr-2" />}
                {isSendingEmail ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                O relatório completo em PDF foi enviado automaticamente para <strong>{userData.email}</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>Aviso Legal:</strong> Este diagnóstico é uma análise preliminar gerada por IA
          e pode conter imprecisões. Não substitui consulta com advogado. Para avaliação
          jurídica precisa, consulte um profissional qualificado.
          <div className="mt-3">
            <a
              href={`https://wa.me/5511921486194?text=${encodeURIComponent(lawyerWhatsAppMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Consulte um Advogado Agora: (11) 92148-6194
              </Button>
            </a>  
          </div>
        </AlertDescription>
      </Alert>

      {/* Footer Actions */}
      <div className="flex justify-center gap-4">
        <Button onClick={onBackToStart} variant="outline">
          <Home className="mr-2" />
          Voltar ao Início
        </Button>
        <Button onClick={onBackToStart}>
          Fazer Novo Diagnóstico
        </Button>
      </div>
    </div>
  );
}
