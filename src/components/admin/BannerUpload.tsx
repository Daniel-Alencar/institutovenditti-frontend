import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, X, AlertCircle, Loader2 } from 'lucide-react';
import { uploadBannerImage } from '@/lib/blob-storage';

interface BannerUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
}

export function BannerUpload({
  currentImageUrl,
  onImageChange,
  label = 'Banner do Anúncio',
}: BannerUploadProps) {
  const [previewUrl, setPreviewUrl]       = useState<string>(currentImageUrl || '');
  const [uploadMethod, setUploadMethod]   = useState<'url' | 'file'>('url');
  const [urlInput, setUrlInput]           = useState<string>(currentImageUrl || '');
  const [uploading, setUploading]         = useState(false);
  const [uploadError, setUploadError]     = useState<string | null>(null);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  // ── URL method ──────────────────────────────────────────────────────────────
  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    setPreviewUrl(url);
    onImageChange(url);
    setUploadError(null);
  };

  // ── File upload method ──────────────────────────────────────────────────────
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem válido (JPG, PNG, GIF, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo deve ter no máximo 5 MB.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    // Mostra preview local imediatamente enquanto faz upload
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const publicUrl = await uploadBannerImage(file, file.name);
      setPreviewUrl(publicUrl);
      onImageChange(publicUrl);
    } catch (err: any) {
      setUploadError(
        err?.message?.includes('bucket')
          ? 'Bucket "banners" não encontrado. Execute o supabase-storage-setup.sql primeiro.'
          : `Erro no upload: ${err?.message ?? 'tente novamente.'}`
      );
      // Reverte preview para o valor anterior
      setPreviewUrl(currentImageUrl || '');
      onImageChange(currentImageUrl || '');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    setUrlInput('');
    setUploadError(null);
    onImageChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Method toggle */}
      <div>
        <Label>{label}</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            type="button"
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('url')}
          >
            URL da Imagem
          </Button>
          <Button
            type="button"
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('file')}
          >
            Upload de Arquivo
          </Button>
        </div>
      </div>

      {/* URL input */}
      {uploadMethod === 'url' && (
        <div>
          <Label htmlFor="banner-url">URL da Imagem</Label>
          <Input
            id="banner-url"
            type="url"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://exemplo.com/banner.jpg"
            className="mt-1"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Cole o link direto de uma imagem hospedada online
          </p>
        </div>
      )}

      {/* File upload */}
      {uploadMethod === 'file' && (
        <div>
          <Label htmlFor="banner-file">Selecionar Arquivo</Label>
          <div className="mt-1">
            <input
              ref={fileInputRef}
              id="banner-file"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando imagem...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Imagem
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Formatos aceitos: JPG, PNG, GIF, WebP (máx. 5 MB)
          </p>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900 text-xs">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      {previewUrl && !uploading && (
        <div className="relative border-2 border-dashed border-zinc-300 rounded-lg p-4">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleClearImage}
            className="absolute top-2 right-2 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-6 w-6 text-zinc-500" />
            <p className="text-sm font-medium text-zinc-700">Preview do Banner</p>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-auto max-h-48 rounded border border-zinc-200"
              onError={() => {
                setPreviewUrl('');
                setUploadError('Não foi possível carregar a imagem. Verifique a URL.');
              }}
            />
          </div>
        </div>
      )}

      {/* Loading preview */}
      {uploading && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 flex flex-col items-center gap-2 bg-blue-50">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-blue-700 font-medium">Enviando para o servidor...</p>
        </div>
      )}

      {/* Specs */}
      <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50 text-xs text-zinc-600 space-y-1">
        <p className="font-semibold text-zinc-800">📐 Dimensões recomendadas para o PDF:</p>
        <p>• Banner horizontal: <strong>728 × 90 px</strong></p>
        <p>• Banner quadrado: <strong>300 × 250 px</strong></p>
        <p>• Tamanho máximo: <strong>5 MB</strong> | Formatos: JPG, PNG, GIF, WebP</p>
      </div>
    </div>
  );
}
