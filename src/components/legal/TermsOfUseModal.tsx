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
import { AlertCircle } from 'lucide-react';

interface TermsOfUseModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsOfUseModal({ open, onAccept, onDecline }: TermsOfUseModalProps) {
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = () => {
    if (!hasAccepted) {
      return;
    }

    // Store acceptance in localStorage
    localStorage.setItem('termsAccepted', 'true');
    localStorage.setItem('termsAcceptedDate', new Date().toISOString());

    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Termos de Uso e Aviso Legal</DialogTitle>
          <DialogDescription>
            Por favor, leia atentamente antes de continuar
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-bold text-base mb-2">1. Natureza do Serviço</h3>
              <p className="text-zinc-600 leading-relaxed">
                Este sistema de diagnóstico jurídico é uma ferramenta educacional e informativa que utiliza
                inteligência artificial para fornecer uma análise preliminar de situações jurídicas. O diagnóstico
                gerado NÃO constitui aconselhamento jurídico formal, opinião legal profissional ou estabelecimento
                de relação advogado-cliente.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">2. Limitações e Isenção de Responsabilidade</h3>
              <p className="text-zinc-600 leading-relaxed mb-2">
                O usuário reconhece e concorda que:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-600">
                <li>
                  O diagnóstico é gerado por inteligência artificial e pode conter imprecisões, erros ou
                  informações desatualizadas;
                </li>
                <li>
                  A análise é baseada exclusivamente nas informações fornecidas pelo usuário no questionário,
                  sem verificação independente dos fatos;
                </li>
                <li>
                  O sistema não considera todas as nuances, complexidades e particularidades específicas de cada caso;
                </li>
                <li>
                  As leis, jurisprudências e regulamentações podem mudar constantemente, e o diagnóstico pode não
                  refletir as atualizações mais recentes;
                </li>
                <li>
                  NÃO substitui a consulta com um advogado devidamente habilitado e especializado na área relevante;
                </li>
                <li>
                  O uso deste serviço é por conta e risco do usuário, sem qualquer garantia de resultados;
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">3. Consulta Profissional Obrigatória</h3>
              <p className="text-zinc-600 leading-relaxed">
                Para qualquer ação jurídica, decisão legal ou questão que requeira orientação profissional,
                o usuário DEVE consultar um advogado qualificado. Decisões tomadas com base exclusivamente
                neste diagnóstico são de inteira responsabilidade do usuário.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">4. Privacidade e Proteção de Dados</h3>
              <p className="text-zinc-600 leading-relaxed">
                As informações fornecidas pelos usuários serão tratadas de acordo com a Lei Geral de Proteção
                de Dados (LGPD - Lei 13.709/2018). Os dados coletados incluem: nome, email, telefone/WhatsApp,
                localização e respostas ao questionário. Esses dados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-600 mt-2">
                <li>Geração do diagnóstico jurídico personalizado;</li>
                <li>Envio do relatório por email e WhatsApp;</li>
                <li>Análises estatísticas e melhoria do serviço;</li>
                <li>Cadastro de indicações (quando fornecido voluntariamente);</li>
              </ul>
              <p className="text-zinc-600 leading-relaxed mt-2">
                Os dados não serão compartilhados com terceiros sem consentimento, exceto quando exigido por lei.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">5. Prazos Prescricionais</h3>
              <p className="text-zinc-600 leading-relaxed">
                ATENÇÃO: Muitos direitos possuem prazos legais de prescrição. A demora em consultar um advogado
                pode resultar na perda definitiva de direitos. Embora o diagnóstico indique prazos gerais,
                apenas um advogado pode determinar com precisão os prazos aplicáveis ao seu caso específico.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">6. Publicidade</h3>
              <p className="text-zinc-600 leading-relaxed">
                Este serviço pode exibir anúncios publicitários no relatório e interface. A presença de anúncios
                não constitui endosso ou recomendação dos produtos ou serviços anunciados.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">7. Uso Adequado</h3>
              <p className="text-zinc-600 leading-relaxed">
                O usuário concorda em fornecer informações verdadeiras e precisas. O uso de informações falsas,
                incompletas ou enganosas pode comprometer a qualidade e utilidade do diagnóstico.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">8. Modificações nos Termos</h3>
              <p className="text-zinc-600 leading-relaxed">
                Estes termos podem ser modificados a qualquer momento. O uso continuado do serviço após
                modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base mb-2">9. Contato</h3>
              <p className="text-zinc-600 leading-relaxed">
                Para dúvidas, sugestões ou questões relacionadas a privacidade e dados pessoais, entre em
                contato através do WhatsApp: (11) 92148-6194
              </p>
            </section>
          </div>

        </ScrollArea>

        <div className="shrink-0 mt-4 space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 text-sm">
              <strong>Importante:</strong> Ao aceitar estes termos, você reconhece que
              compreendeu as limitações deste serviço e que a consulta com um advogado é
              essencial para orientação jurídica completa.
            </AlertDescription>
          </Alert>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Li e aceito os Termos de Uso e Aviso Legal. Compreendo que este diagnóstico
              não substitui consulta com advogado.
            </label>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
              Não Aceito
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!hasAccepted}
              className="w-full sm:w-auto"
            >
              Aceito e Continuar
            </Button>
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
}
