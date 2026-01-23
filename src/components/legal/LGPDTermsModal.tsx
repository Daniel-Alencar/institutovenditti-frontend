import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

interface LGPDTermsModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function LGPDTermsModal({ open, onAccept, onDecline }: LGPDTermsModalProps) {
  const [hasAcceptedLGPD, setHasAcceptedLGPD] = useState(false);
  const [hasAcceptedContact, setHasAcceptedContact] = useState(false);

  // Load LGPD terms from localStorage (admin can edit)
  const [lgpdContent] = useState(() => {
    return localStorage.getItem('adminLGPDTerms') || DEFAULT_LGPD_TERMS;
  });

  const handleAccept = () => {
    if (!hasAcceptedLGPD || !hasAcceptedContact) {
      return;
    }

    // Store acceptances in localStorage
    localStorage.setItem('lgpdAccepted', 'true');
    localStorage.setItem('lgpdAcceptedDate', new Date().toISOString());
    localStorage.setItem('contactAccepted', 'true');
    localStorage.setItem('contactAcceptedDate', new Date().toISOString());

    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Termos LGPD - Proteção de Dados Pessoais
          </DialogTitle>
          <DialogDescription>
            Leia atentamente nossos termos de proteção de dados (LGPD)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-6 text-sm whitespace-pre-wrap leading-relaxed">
            {lgpdContent}
          </div>
        </ScrollArea>

        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 text-sm">
            <strong>Seus direitos garantidos pela LGPD:</strong> Você pode solicitar acesso, correção,
            exclusão ou portabilidade dos seus dados pessoais a qualquer momento.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* LGPD Acceptance - MANDATORY */}
          <div className="flex items-start space-x-2 p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
            <Checkbox
              id="lgpd-terms"
              checked={hasAcceptedLGPD}
              onCheckedChange={(checked) => setHasAcceptedLGPD(checked as boolean)}
            />
            <label
              htmlFor="lgpd-terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              <span className="text-red-600">* OBRIGATÓRIO:</span> Li e aceito os Termos da LGPD.
              Autorizo o tratamento dos meus dados pessoais conforme descrito acima.
            </label>
          </div>

          {/* Contact Acceptance - MANDATORY */}
          <div className="flex items-start space-x-2 p-3 border-2 border-green-200 rounded-lg bg-green-50">
            <Checkbox
              id="contact-acceptance"
              checked={hasAcceptedContact}
              onCheckedChange={(checked) => setHasAcceptedContact(checked as boolean)}
            />
            <label
              htmlFor="contact-acceptance"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              <span className="text-red-600">* OBRIGATÓRIO:</span> Autorizo o recebimento de contato
              por email e WhatsApp para envio do relatório de diagnóstico jurídico e comunicações relacionadas.
            </label>
          </div>
        </div>

        {(!hasAcceptedLGPD || !hasAcceptedContact) && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 text-sm">
              <strong>Atenção:</strong> Ambos os aceites são obrigatórios para continuar e receber o relatório.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Não Aceito
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!hasAcceptedLGPD || !hasAcceptedContact}
            className="w-full sm:w-auto"
          >
            Aceito Ambos os Termos e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DEFAULT_LGPD_TERMS = `TERMOS DE PROTEÇÃO DE DADOS PESSOAIS (LGPD)

Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), informamos como tratamos seus dados pessoais:

1. RESPONSÁVEL PELO TRATAMENTO DE DADOS
O responsável pela coleta e tratamento dos dados pessoais é:
- Nome: [Nome do Escritório/Empresa]
- CNPJ: [CNPJ]
- Endereço: [Endereço Completo]
- Email: [email@exemplo.com]
- WhatsApp: (11) 92148-6194

2. DADOS COLETADOS

Coletamos os seguintes dados pessoais:
• Nome completo
• Email
• Número de telefone (WhatsApp)
• Cidade e Estado
• Respostas ao questionário jurídico
• Nome e WhatsApp do amigo indicado (quando fornecido)
• Data e hora de acesso ao sistema
• Endereço IP (para fins de segurança)

3. FINALIDADES DO TRATAMENTO

Seus dados pessoais são utilizados exclusivamente para:
• Gerar diagnóstico jurídico personalizado
• Enviar relatório em PDF por email
• Enviar notificação via WhatsApp
• Enviar convite ao amigo indicado
• Análises estatísticas e melhoria do serviço
• Atendimento de obrigações legais e regulatórias
• Comunicações sobre o serviço prestado

4. BASE LEGAL PARA O TRATAMENTO

O tratamento dos seus dados está fundamentado em:
• Consentimento expresso (Art. 7º, I da LGPD)
• Execução de contrato (Art. 7º, V da LGPD)
• Exercício regular de direitos (Art. 7º, VI da LGPD)
• Cumprimento de obrigação legal (Art. 7º, II da LGPD)

5. COMPARTILHAMENTO DE DADOS

Seus dados NÃO serão compartilhados com terceiros, exceto:
• Quando necessário para prestação do serviço (ex: envio de emails, WhatsApp)
• Quando exigido por lei, ordem judicial ou autoridade competente
• Com seu consentimento expresso

6. ARMAZENAMENTO E SEGURANÇA

• Seus dados são armazenados em servidores seguros
• Utilizamos criptografia e medidas de segurança adequadas
• Acesso restrito aos dados por pessoal autorizado
• Backups regulares para proteção contra perda de dados
• Retenção dos dados pelo prazo necessário às finalidades ou exigido por lei

7. SEUS DIREITOS GARANTIDOS PELA LGPD

Você tem direito a:
• Confirmar a existência de tratamento dos seus dados
• Acessar seus dados pessoais
• Corrigir dados incompletos, inexatos ou desatualizados
• Anonimizar, bloquear ou eliminar dados desnecessários
• Solicitar portabilidade dos dados a outro fornecedor
• Eliminar dados tratados com seu consentimento
• Obter informações sobre compartilhamento de dados
• Revogar o consentimento a qualquer momento
• Opor-se a tratamento de dados

8. COMO EXERCER SEUS DIREITOS

Para exercer qualquer direito garantido pela LGPD, entre em contato através de:
• Email: [email@exemplo.com]
• WhatsApp: (11) 92148-6194

Responderemos sua solicitação em até 15 dias úteis.

9. DIREITO DE REVOGAÇÃO DO CONSENTIMENTO

Você pode revogar seu consentimento a qualquer momento, sem custos, através dos canais de contato acima. A revogação não afeta a legalidade do tratamento realizado antes da revogação.

10. COOKIES E TECNOLOGIAS SEMELHANTES

Utilizamos cookies e tecnologias semelhantes para:
• Melhorar a experiência do usuário
• Análises estatísticas de uso
• Segurança do sistema

Você pode configurar seu navegador para recusar cookies.

11. TRANSFERÊNCIA INTERNACIONAL DE DADOS

Atualmente NÃO realizamos transferência internacional de dados. Caso venha a ocorrer, você será informado e solicitado novo consentimento.

12. INCIDENTES DE SEGURANÇA

Em caso de incidente de segurança que possa acarretar risco aos seus dados, você será notificado conforme exigido pela LGPD.

13. DADOS DE MENORES DE IDADE

Este serviço não é destinado a menores de 18 anos. Se você tiver menos de 18 anos, não utilize este sistema.

14. ALTERAÇÕES NESTES TERMOS

Estes termos podem ser atualizados periodicamente. Alterações relevantes serão comunicadas por email ou WhatsApp.

15. ENCARREGADO DE DADOS (DPO)

Para questões relacionadas à proteção de dados, entre em contato com nosso Encarregado de Dados:
• Email: [dpo@exemplo.com]
• WhatsApp: (11) 92148-6194

16. LEGISLAÇÃO E FORO

Estes termos são regidos pela legislação brasileira. Eventuais disputas serão resolvidas no foro da comarca de [Cidade/UF].

Data da última atualização: ${new Date().toLocaleDateString('pt-BR')}

---

IMPORTANTE:

Ao aceitar estes termos, você declara:
✓ Ter lido e compreendido todos os termos acima
✓ Concordar com o tratamento dos seus dados conforme descrito
✓ Ter capacidade legal para fornecer este consentimento
✓ Autorizar o contato por email e WhatsApp conforme descrito

Para dúvidas ou esclarecimentos, entre em contato através do WhatsApp (11) 92148-6194.`;
