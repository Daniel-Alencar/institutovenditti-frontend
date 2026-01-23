import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface TeamPhoto {
  id: string;
  imageUrl: string;
  createdAt: number;
}

const STORAGE_KEY = 'team_photos';

export function LawyersCarousel() {
  const [photos, setPhotos] = useState<TeamPhoto[]>([]);

  // Load photos from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPhotos(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading photos:', e);
      }
    }
  }, []);

  // If no photos, don't render anything
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
          Nossa Equipe
        </h2>
        <p className="text-xl text-white/80">
          Profissionais dedicados a ajudar você
        </p>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3500,
          }),
        ]}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent>
          {photos.map((photo) => (
            <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="bg-white/98 backdrop-blur-sm border-2 border-[oklch(0.75_0.12_85)]/40 hover:border-[oklch(0.75_0.12_85)] hover:shadow-2xl transition-all transform hover:scale-105 h-full">
                  <CardContent className="flex flex-col items-center p-6">
                    {/* Team Photo */}
                    <div className="w-48 h-48 rounded-full mb-4 flex items-center justify-center shadow-xl ring-4 ring-white/50 overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt="Membro da equipe"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Placeholder Text */}
                    <div className="text-center mt-2">
                      <p className="text-lg font-bold text-[oklch(0.45_0.15_250)] uppercase tracking-wider">
                        IMAGEM
                      </p>
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
    </div>
  );
}
