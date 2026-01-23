import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star, Quote } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  area: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Maria Fernanda Santos',
    location: 'São Paulo, SP',
    rating: 5,
    text: 'O diagnóstico jurídico me ajudou a entender meus direitos trabalhistas. Consegui resolver meu problema de horas extras não pagas. Excelente serviço!',
    area: 'Direito Trabalhista'
  },
  {
    id: 2,
    name: 'João Pedro Oliveira',
    location: 'Rio de Janeiro, RJ',
    rating: 5,
    text: 'Fui vítima de propaganda enganosa e não sabia o que fazer. O relatório me orientou perfeitamente sobre meus direitos. Muito profissional!',
    area: 'Direito do Consumidor'
  },
  {
    id: 3,
    name: 'Carla Regina Lima',
    location: 'Belo Horizonte, MG',
    rating: 5,
    text: 'Estava com dúvidas sobre pensão alimentícia. O diagnóstico foi claro e objetivo, me deu toda a base que eu precisava. Recomendo demais!',
    area: 'Direito de Família'
  }
];

export function TestimonialsCarousel() {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
          O Que Dizem Nossos Usuários
        </h2>
        <p className="text-xl text-white/80">
          Milhares de pessoas já foram ajudadas
        </p>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="bg-white/98 backdrop-blur-sm border-2 border-[oklch(0.75_0.12_85)]/40 hover:border-[oklch(0.75_0.12_85)] hover:shadow-2xl transition-all transform hover:scale-105 h-full">
                  <CardContent className="flex flex-col p-6">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[oklch(0.75_0.12_85)] to-[oklch(0.70_0.14_80)] flex items-center justify-center shadow-lg">
                        <Quote className="w-8 h-8 text-[oklch(0.20_0.12_245)]" />
                      </div>
                    </div>

                    {/* Stars Rating */}
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-[oklch(0.75_0.12_85)] text-[oklch(0.75_0.12_85)]"
                        />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-sm text-zinc-700 text-center leading-relaxed mb-4 italic min-h-[120px] flex items-center">
                      "{testimonial.text}"
                    </p>

                    {/* Divider */}
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[oklch(0.75_0.12_85)] to-transparent mx-auto mb-4" />

                    {/* Profile Image Placeholder */}
                    <div className="flex justify-center mb-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[oklch(0.45_0.15_250)] to-[oklch(0.35_0.18_248)] flex items-center justify-center shadow-md ring-2 ring-white/50">
                        <span className="text-2xl font-bold text-white">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-base font-bold text-[oklch(0.20_0.12_245)] text-center mb-1">
                      {testimonial.name}
                    </h3>

                    {/* Location */}
                    <p className="text-xs text-zinc-600 text-center mb-2">
                      {testimonial.location}
                    </p>

                    {/* Area Tag */}
                    <div className="flex justify-center">
                      <span className="inline-block px-3 py-1 bg-[oklch(0.45_0.15_250)]/10 text-[oklch(0.45_0.15_250)] text-xs font-semibold rounded-full">
                        {testimonial.area}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-white/90 hover:bg-white border-2 border-[oklch(0.75_0.12_85)]/40 hover:border-[oklch(0.75_0.12_85)] text-[oklch(0.45_0.15_250)] shadow-xl" />
        <CarouselNext className="bg-white/90 hover:bg-white border-2 border-[oklch(0.75_0.12_85)]/40 hover:border-[oklch(0.75_0.12_85)] text-[oklch(0.45_0.15_250)] shadow-xl" />
      </Carousel>

      {/* Trust Badge */}
      <div className="mt-8 text-center">
        <p className="text-white/70 text-sm italic">
          ✨ Depoimentos reais de pessoas que conheceram seus direitos
        </p>
      </div>
    </div>
  );
}
