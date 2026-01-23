import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { commonAreas } from '@/data/questionnaires';
import { specialAreas } from '@/data/special-areas';
import { type LegalArea } from '@/types/legal';
import {
  ArrowLeft,
  AlertTriangle,
  Briefcase,
  ShoppingCart,
  Users,
  Heart,
  FileText,
  Activity,
  Shield,
  Home,
  Landmark,
  Car,
  CreditCard,
  GraduationCap,
  Building2,
  Tractor,
  DollarSign
} from 'lucide-react';

interface AreaSelectionProps {
  onAreaSelect: (area: LegalArea) => void;
  onBack: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  ShoppingCart,
  Users,
  Heart,
  FileText,
  Activity,
  Shield,
  Home,
  Landmark,
  Car,
  CreditCard,
  GraduationCap,
  AlertTriangle,
  Building2,
  Tractor,
  DollarSign
};

export function AreaSelection({ onAreaSelect, onBack }: AreaSelectionProps) {
  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="w-8 h-8" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.20_0.12_245)] via-[oklch(0.23_0.10_248)] to-[oklch(0.25_0.08_250)] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:text-[oklch(0.75_0.12_85)] hover:bg-white/10 font-semibold"
          >
            <ArrowLeft className="mr-2" />
            Voltar
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-2xl tracking-tight">
            Selecione a Área Jurídica
          </h1>
          <p className="text-xl text-[oklch(0.92_0.02_250)] font-semibold leading-relaxed">
            Escolha a área que melhor se relaciona com sua situação
          </p>
        </div>

        {/* Common Areas */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[oklch(0.75_0.12_85)] mb-6 drop-shadow-xl tracking-tight">Áreas Comuns</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
            {commonAreas.map((area) => (
              <Card
                key={area.id}
                className="cursor-pointer hover:shadow-2xl transition-all hover:scale-105 bg-white/98 backdrop-blur-sm border-2 border-[oklch(0.75_0.12_85)]/30 hover:border-[oklch(0.75_0.12_85)]"
                onClick={() => onAreaSelect(area)}
              >
                <CardHeader>
                  <div className="text-[oklch(0.45_0.15_250)] mb-3">
                    {getIcon(area.icon)}
                  </div>
                  <CardTitle className="text-lg text-[oklch(0.20_0.12_245)] font-bold">{area.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-zinc-700 font-medium">
                    {area.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Areas - PF Style (Black & Yellow) */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[oklch(0.85_0.18_85)] p-2 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-[oklch(0.15_0_0)]" />
            </div>
            <h2 className="text-3xl font-bold text-[oklch(0.85_0.18_85)] drop-shadow-lg">
              Áreas Especiais
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {specialAreas.map((area) => (
              <Card
                key={area.id}
                className="cursor-pointer hover:shadow-2xl transition-all hover:scale-105 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.15 0 0) 0%, oklch(0.20 0 0) 100%)',
                  borderColor: 'oklch(0.85 0.18 85)',
                  borderWidth: '3px'
                }}
                onClick={() => onAreaSelect(area)}
              >
                {/* Diagonal stripe pattern */}
                <div
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      45deg,
                      oklch(0.85 0.18 85),
                      oklch(0.85 0.18 85) 10px,
                      transparent 10px,
                      transparent 20px
                    )`
                  }}
                />

                <CardHeader className="relative z-10">
                  <div className="bg-[oklch(0.85_0.18_85)] p-3 rounded-lg inline-block mb-3 shadow-lg">
                    <div className="text-[oklch(0.15_0_0)]">
                      {getIcon(area.icon)}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-[oklch(0.85_0.18_85)] font-bold uppercase tracking-wide">
                    {area.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-[oklch(0.92_0.20_90)]">
                    {area.description}
                  </CardDescription>
                </CardHeader>

                {/* PF Badge */}
                <div className="absolute top-3 right-3 bg-[oklch(0.85_0.18_85)] text-[oklch(0.15_0_0)] text-xs font-bold px-2 py-1 rounded shadow-lg">
                  URGENTE
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 bg-[oklch(0.15_0_0)] border-2 border-[oklch(0.85_0.18_85)] rounded-lg p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[oklch(0.85_0.18_85)] flex-shrink-0 mt-1" />
              <p className="text-[oklch(0.92_0.20_90)] text-sm leading-relaxed">
                <strong className="text-[oklch(0.85_0.18_85)]">ATENÇÃO:</strong> As áreas especiais
                tratam de questões de maior complexidade e gravidade, exigindo atenção jurídica
                especializada <span className="text-[oklch(0.85_0.18_85)] font-bold">URGENTE</span>.
                Recomendamos prioridade máxima na busca por orientação profissional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
