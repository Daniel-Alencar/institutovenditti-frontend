import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type UserData } from '@/types/legal';
import { ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { validateEmail, validateWhatsApp, formatWhatsAppInput } from '@/lib/scoring';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { LGPDTermsModal } from '@/components/legal/LGPDTermsModal';

interface UserDataFormProps {
  onSubmit: (data: UserData) => void;
  onBack: () => void;
}

export function UserDataForm({ onSubmit, onBack }: UserDataFormProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLGPDModal, setShowLGPDModal] = useState(false);
  const [pendingData, setPendingData] = useState<UserData | null>(null);

  const form = useForm<UserData>({
    defaultValues: {
      fullName: '',
      city: '',
      state: '',
      email: '',
      whatsapp: '',
      referralName: '',
      referralWhatsapp: '',
    },
  });

  const handleFormSubmit = (data: UserData) => {
    setPendingData(data);
    // First show LGPD modal (mandatory)
    setShowLGPDModal(true);
  };

  const handleLGPDAccept = () => {
    setShowLGPDModal(false);
    // After LGPD acceptance, show disclaimer
    setShowDisclaimer(true);
  };

  const handleLGPDDecline = () => {
    setShowLGPDModal(false);
    setPendingData(null);
    // Stay on the form
  };

  const handleDisclaimerAccept = async () => {
    if (pendingData) {
      onSubmit(pendingData);
    }
    setShowDisclaimer(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2" />
          Voltar ao Questionário
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Seus Dados para Receber o Relatório</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para receber seu diagnóstico jurídico gratuito por email e WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Personal Data Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Seus Dados</h3>

                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{
                    required: 'Nome completo é obrigatório',
                    minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    rules={{ required: 'Cidade é obrigatória' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    rules={{ required: 'Estado é obrigatório' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" {...field} maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: 'Email é obrigatório',
                    validate: (value) => validateEmail(value) ? true : 'Email inválido',
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seuemail@exemplo.com" {...field} />
                      </FormControl>
                      <FormDescription>Enviaremos o relatório PDF para este email</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  rules={{
                    required: 'WhatsApp é obrigatório',
                    validate: (value) => {
                      const cleaned = value.replace(/\D/g, '');
                      return validateWhatsApp(cleaned) ? true : 'WhatsApp inválido (DDD + 9 dígitos)';
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 99999-9999"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatWhatsAppInput(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Formato: (DDD) 9XXXX-XXXX (sem o 0)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Referral Section */}
              <div className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>O relatório é gratuito!</strong> Pedimos apenas a indicação de um amigo
                    para que ele também possa conhecer seus direitos.
                  </AlertDescription>
                </Alert>

                <h3 className="font-semibold text-lg border-b pb-2">Indique um Amigo</h3>

                <FormField
                  control={form.control}
                  name="referralName"
                  rules={{
                    required: 'Nome do amigo é obrigatório',
                    minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Amigo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Maria Santos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referralWhatsapp"
                  rules={{
                    required: 'WhatsApp do amigo é obrigatório',
                    validate: (value) => {
                      const cleaned = value.replace(/\D/g, '');
                      return validateWhatsApp(cleaned) ? true : 'WhatsApp inválido (DDD + 9 dígitos)';
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp do Amigo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(11) 98888-8888"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatWhatsAppInput(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enviaremos um convite para seu amigo conhecer o diagnóstico gratuito
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-2" />
                  Voltar
                </Button>
                <Button type="submit">
                  Gerar Relatório de Diagnóstico
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* LGPD Terms Modal - FIRST (MANDATORY) */}
      <LGPDTermsModal
        open={showLGPDModal}
        onAccept={handleLGPDAccept}
        onDecline={handleLGPDDecline}
      />

      {/* Disclaimer Dialog - SECOND */}
      <AlertDialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Aviso Importante
            </AlertDialogTitle>
            <div className="space-y-3 text-left">
              <AlertDialogDescription>
                <strong>Este diagnóstico é uma análise inicial e educativa.</strong>
              </AlertDialogDescription>
              <AlertDialogDescription>
                O relatório gerado por inteligência artificial pode conter imprecisões e
                não substitui a consulta com um advogado especializado.
              </AlertDialogDescription>
              <AlertDialogDescription>
                Para uma avaliação jurídica completa, precisa e adequada à sua situação
                específica, é <strong>fundamental buscar orientação de um profissional
                qualificado</strong>.
              </AlertDialogDescription>
              <AlertDialogDescription className="text-sm text-zinc-600">
                Ao continuar, você declara estar ciente das limitações deste diagnóstico.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDisclaimer(false)}>
              Cancelar
            </Button>
            <AlertDialogAction onClick={handleDisclaimerAccept}>
              Estou Ciente, Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
