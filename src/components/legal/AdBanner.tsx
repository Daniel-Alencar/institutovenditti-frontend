import { ExternalLink } from 'lucide-react';
import { type Announcement } from '@/lib/data-service';

interface AdBannerProps {
  announcement: Announcement;
  position: number;
}

export function AdBanner({ announcement, position }: AdBannerProps) {
  const adColors: Record<number, { bg: string; border: string }> = {
    1: { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200' },
    2: { bg: 'from-purple-50 to-pink-50', border: 'border-purple-200' },
    3: { bg: 'from-green-50 to-teal-50', border: 'border-green-200' },
    4: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-200' },
  };

  const colors = adColors[position] || adColors[1];

  return (
    <div className={`my-8 p-4 bg-gradient-to-r ${colors.bg} rounded-lg border-2 border-dashed ${colors.border}`}>
      <p className="text-xs text-zinc-500 mb-2 font-medium text-center uppercase tracking-wide">
        Publicidade
      </p>

      {announcement.imageUrl ? (
        <div className="relative group">
          <img
            src={announcement.imageUrl}
            alt={`Anúncio ${position}`}
            className="w-full h-auto rounded border border-zinc-200 shadow-sm"
            loading="lazy"
          />

          {/* Links overlay */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {announcement.websiteUrl && (
              <a
                href={announcement.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-md text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Visitar Site
              </a>
            )}
            {announcement.facebookUrl && (
              <a
                href={announcement.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 border border-blue-700 rounded-md text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Facebook
              </a>
            )}
            {announcement.instagramUrl && (
              <a
                href={announcement.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-700 rounded-md text-xs font-medium text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Instagram
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="h-24 bg-white rounded-lg flex items-center justify-center border border-dashed border-zinc-300">
          <span className="text-zinc-400 text-sm">Espaço Publicitário {position}</span>
        </div>
      )}
    </div>
  );
}
