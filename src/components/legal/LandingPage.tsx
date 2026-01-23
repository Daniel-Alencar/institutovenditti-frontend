import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, Info, FileCheck, Shield, Users, FileText, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analyticsService } from '@/lib/data-service';
import { LawyersCarousel } from './LawyersCarousel';
import { TestimonialsCarousel } from './TestimonialsCarousel';
import { diagnosticsServiceDB } from '@/lib/data-service-db';
import { supabase } from '@/lib/supabase';

interface LandingPageProps {
  onStart: () => void;
}

interface Stats {
  totalAccesses: number;
  totalQuestionnaires: number;
  totalUsers: number;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [stats, setStats] = useState<Stats>({
    totalAccesses: 0,
    totalQuestionnaires: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      // Increment access counter on page load
      await analyticsService.incrementAccess();

      // Load stats
      const analyticsStats = await analyticsService.getStats();
      setStats({
        totalAccesses: analyticsStats.total,
        totalQuestionnaires: analyticsStats.totalQuestionnaires,
        totalUsers: analyticsStats.totalUsers,
      });
    };

    loadData();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Sessão do usuário:", session);
    });
  }, []);


  const scrollToHowItWorks = () => {
    const element = document.getElementById('como-funciona');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.20_0.12_245)] via-[oklch(0.23_0.10_248)] to-[oklch(0.25_0.08_250)] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-[oklch(0.75_0.12_85)] p-5 rounded-2xl shadow-2xl ring-4 ring-[oklch(0.75_0.12_85)]/30">
              <Scale className="w-20 h-20 text-[oklch(0.20_0.12_245)]" />
            </div>
          </div>
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl tracking-tight leading-tight">
            Faça valer seus direitos
          </h1>
          <p className="text-2xl text-[oklch(0.92_0.02_250)] mb-3 font-semibold leading-relaxed">
            Diagnóstico jurídico gratuito em diversas áreas do direito
          </p>
          <p className="text-xl text-[oklch(0.75_0.12_85)] font-bold mb-8 uppercase tracking-wider drop-shadow-lg">
            Educação jurídica é direito de todos
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={onStart}
              className="text-lg px-10 py-7 bg-[oklch(0.75_0.12_85)] hover:bg-[oklch(0.70_0.14_80)] text-[oklch(0.20_0.12_245)] font-extrabold shadow-2xl hover:shadow-[0_20px_50px_rgba(255,215,0,0.4)] transition-all transform hover:scale-105"
            >
              Começar Diagnóstico
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToHowItWorks}
              className="text-lg px-10 py-7 bg-white/5 border-3 border-white text-white hover:bg-white/15 font-bold backdrop-blur-md shadow-2xl hover:shadow-[0_10px_30px_rgba(255,255,255,0.3)] transition-all"
            >
              <Info className="mr-2" />
              Como Funciona
            </Button>
          </div>
        </div>

        {/* Social Proof Stats - Professional Impact Metrics */}
        <div className="mb-16 bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-tight">
            Nossa Comunidade em Números
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-[oklch(0.75_0.12_85)] to-[oklch(0.70_0.14_80)] p-4 rounded-2xl shadow-xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all">
                  <TrendingUp className="w-12 h-12 text-[oklch(0.20_0.12_245)]" />
                </div>
              </div>
              <div className="text-5xl font-black text-[oklch(0.75_0.12_85)] mb-2 drop-shadow-lg">
                +{(Math.max(stats.totalAccesses, 50000)).toLocaleString('pt-BR')}
              </div>
              <div className="text-lg font-semibold text-white/90">
                Acessos Realizados
              </div>
              <div className="text-sm text-white/70 mt-1">
                Pessoas buscando seus direitos
              </div>
            </div>

            <div className="text-center group hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-[oklch(0.75_0.12_85)] to-[oklch(0.70_0.14_80)] p-4 rounded-2xl shadow-xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all">
                  <Users className="w-12 h-12 text-[oklch(0.20_0.12_245)]" />
                </div>
              </div>
              <div className="text-5xl font-black text-[oklch(0.75_0.12_85)] mb-2 drop-shadow-lg">
                +{(Math.max(stats.totalUsers, 10000)).toLocaleString('pt-BR')}
              </div>
              <div className="text-lg font-semibold text-white/90">
                Pessoas Ajudadas
              </div>
              <div className="text-sm text-white/70 mt-1">
                Receberam diagnóstico completo
              </div>
            </div>

            <div className="text-center group hover:scale-105 transition-transform">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-[oklch(0.75_0.12_85)] to-[oklch(0.70_0.14_80)] p-4 rounded-2xl shadow-xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all">
                  <FileText className="w-12 h-12 text-[oklch(0.20_0.12_245)]" />
                </div>
              </div>
              <div className="text-5xl font-black text-[oklch(0.75_0.12_85)] mb-2 drop-shadow-lg">
                +{(Math.max(stats.totalQuestionnaires, 8500)).toLocaleString('pt-BR')}
              </div>
              <div className="text-lg font-semibold text-white/90">
                Questionários Respondidos
              </div>
              <div className="text-sm text-white/70 mt-1">
                Análises jurídicas completas
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white/80 text-sm italic">
              ✨ Junte-se a milhares de pessoas que já conheceram seus direitos!
            </p>
          </div>
        </div>

        {/* Lawyers Carousel */}
        <LawyersCarousel />

        {/* Testimonials Carousel */}
        <TestimonialsCarousel />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/98 backdrop-blur-sm border-2 border-[oklch(0.75_0.12_85)]/40 hover:border-[oklch(0.75_0.12_85)] hover:shadow-2xl transition-all transform hover:scale-105">
            <CardHeader>
              <FileCheck className="w-10 h-10 text-[oklch(0.45_0.15_250)] mb-2" />
              <CardTitle className="text-[oklch(0.20_0.12_245)] text-xl font-bold">Relatório Personalizado</CardTitle>
              <CardDescription className="text-base leading-relaxed text-zinc-700">
                Receba um relatório detalhado sobre sua situação jurídica com análise de IA
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/98 backdrop-blur-sm border-2 border-[oklch(0.75_0.12_85)]/40 hover:border-[oklch(0.75_0.12_85)] hover:shadow-2xl transition-all transform hover:scale-105">
            <CardHeader>
              <Shield className="w-10 h-10 text-[oklch(0.45_0.15_250)] mb-2" />
              <CardTitle className="text-[oklch(0.20_0.12_245)] text-xl font-bold">Múltiplas Áreas</CardTitle>
              <CardDescription className="text-base leading-relaxed text-zinc-700">
                Trabalhista, consumidor, família, previdenciário e muito mais
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/98 backdrop-blur-sm border-2 border-[oklch(0.75_0.12_85)]/40 hover:border-[oklch(0.75_0.12_85)] hover:shadow-2xl transition-all transform hover:scale-105">
            <CardHeader>
              <Scale className="w-10 h-10 text-[oklch(0.45_0.15_250)] mb-2" />
              <CardTitle className="text-[oklch(0.20_0.12_245)] text-xl font-bold">100% Gratuito</CardTitle>
              <CardDescription className="text-base leading-relaxed text-zinc-700">
                Diagnóstico completo sem custos, enviado por email e WhatsApp
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it works */}
        <Card id="como-funciona" className="mb-8 bg-white/98 backdrop-blur-sm border-2 border-[oklch(0.75_0.12_85)]/40">
          <CardHeader>
            <CardTitle className="text-3xl text-[oklch(0.20_0.12_245)] font-bold">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[oklch(0.45_0.15_250)] text-white flex items-center justify-center text-2xl font-bold mb-3 mx-auto shadow-xl ring-4 ring-[oklch(0.45_0.15_250)]/20">
                  1
                </div>
                <h3 className="font-bold mb-2 text-[oklch(0.20_0.12_245)] text-lg">Escolha a Área</h3>
                <p className="text-base text-zinc-700 leading-relaxed">
                  Selecione a área jurídica relacionada ao seu problema
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[oklch(0.45_0.15_250)] text-white flex items-center justify-center text-2xl font-bold mb-3 mx-auto shadow-xl ring-4 ring-[oklch(0.45_0.15_250)]/20">
                  2
                </div>
                <h3 className="font-bold mb-2 text-[oklch(0.20_0.12_245)] text-lg">Responda Perguntas</h3>
                <p className="text-base text-zinc-700 leading-relaxed">
                  Complete o questionário específico sobre sua situação
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[oklch(0.45_0.15_250)] text-white flex items-center justify-center text-2xl font-bold mb-3 mx-auto shadow-xl ring-4 ring-[oklch(0.45_0.15_250)]/20">
                  3
                </div>
                <h3 className="font-bold mb-2 text-[oklch(0.20_0.12_245)] text-lg">Forneça seus Dados</h3>
                <p className="text-base text-zinc-700 leading-relaxed">
                  Informe email, WhatsApp e indique um amigo
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[oklch(0.45_0.15_250)] text-white flex items-center justify-center text-2xl font-bold mb-3 mx-auto shadow-xl ring-4 ring-[oklch(0.45_0.15_250)]/20">
                  4
                </div>
                <h3 className="font-bold mb-2 text-[oklch(0.20_0.12_245)] text-lg">Receba o Relatório</h3>
                <p className="text-base text-zinc-700 leading-relaxed">
                  Relatório em PDF enviado por email e WhatsApp
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer - Maximum Visibility */}
        <Alert className="border-3 border-[oklch(0.75_0.12_85)] bg-white shadow-2xl">
          <Info className="h-7 w-7 text-[oklch(0.75_0.12_85)] flex-shrink-0 mt-1" />
          <AlertDescription className="text-[oklch(0.20_0.12_245)] text-base leading-relaxed">
            <strong className="text-[oklch(0.20_0.12_245)] font-extrabold text-lg block mb-1">
              ⚠️ Importante - Leia com Atenção:
            </strong>
            <span className="font-semibold">
              Este diagnóstico é uma análise inicial e educativa.
              Não substitui a consulta com um advogado especializado. Para uma avaliação
              jurídica completa e precisa, recomendamos sempre buscar orientação profissional.
            </span>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
