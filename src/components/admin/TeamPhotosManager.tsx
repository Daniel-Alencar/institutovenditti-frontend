import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Image as ImageIcon, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TeamPhoto {
  id: string;
  imageUrl: string;
  createdAt: number;
}

const STORAGE_KEY = 'team_photos';
const MAX_PHOTOS = 10;

export function TeamPhotosManager() {
  const [photos, setPhotos] = useState<TeamPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load photos from localStorage on mount
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

  // Save photos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }, [photos]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= MAX_PHOTOS) {
      setError(`Máximo de ${MAX_PHOTOS} fotos permitidas`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem');
        setUploading(false);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem muito grande. Máximo de 5MB');
        setUploading(false);
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;

        const newPhoto: TeamPhoto = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          imageUrl,
          createdAt: Date.now(),
        };

        setPhotos(prev => [...prev, newPhoto]);
        setUploading(false);
      };

      reader.onerror = () => {
        setError('Erro ao carregar imagem');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erro ao fazer upload da imagem');
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta foto?')) {
      setPhotos(prev => prev.filter(photo => photo.id !== id));
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Tem certeza que deseja excluir TODAS as fotos?')) {
      setPhotos([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          Gerenciar Fotos da Equipe
        </CardTitle>
        <CardDescription>
          Upload e gerenciamento de fotos que aparecerão no carrossel da equipe.
          Máximo de {MAX_PHOTOS} fotos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <div className="mb-6">
          <input
            type="file"
            id="team-photo-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || photos.length >= MAX_PHOTOS}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => document.getElementById('team-photo-upload')?.click()}
              disabled={uploading || photos.length >= MAX_PHOTOS}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              {uploading ? 'Carregando...' : 'Adicionar Foto'}
            </Button>
            {photos.length > 0 && (
              <Button variant="destructive" onClick={handleDeleteAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Todas
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {photos.length} / {MAX_PHOTOS} fotos carregadas
          </p>
        </div>

        {/* Photos Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all"
              >
                <img
                  src={photo.imageUrl}
                  alt="Team member"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(photo.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Nenhuma foto cadastrada</p>
            <p className="text-sm text-gray-500">
              Clique em "Adicionar Foto" para começar
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use imagens quadradas para melhor resultado</li>
            <li>• Tamanho máximo: 5MB por imagem</li>
            <li>• Formatos aceitos: JPG, PNG, WebP, GIF</li>
            <li>• As fotos aparecerão automaticamente no carrossel da equipe</li>
            <li>• Recomendado: fotos profissionais geradas por IA</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
