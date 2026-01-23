import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, X, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface BannerUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
  fileSize?: number;
  isValid: boolean;
  errors: string[];
}

// Recommended dimensions for ad space in PDF (728x90px for banner, 300x250px for square)
const RECOMMENDED_DIMENSIONS = {
  banner: { width: 728, height: 90 },
  square: { width: 300, height: 250 }
};

const TOLERANCE = 0.1; // 10% tolerance for dimensions

export function BannerUpload({ currentImageUrl, onImageChange, label = 'Banner do Anúncio' }: BannerUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [urlInput, setUrlInput] = useState<string>(currentImageUrl || '');
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImageDimensions = (width: number, height: number, fileSize?: number): ImageDimensions => {
    const errors: string[] = [];

    // Check if matches banner dimensions (728x90) with tolerance
    const matchesBanner =
      Math.abs(width - RECOMMENDED_DIMENSIONS.banner.width) <= RECOMMENDED_DIMENSIONS.banner.width * TOLERANCE &&
      Math.abs(height - RECOMMENDED_DIMENSIONS.banner.height) <= RECOMMENDED_DIMENSIONS.banner.height * TOLERANCE;

    // Check if matches square dimensions (300x250) with tolerance
    const matchesSquare =
      Math.abs(width - RECOMMENDED_DIMENSIONS.square.width) <= RECOMMENDED_DIMENSIONS.square.width * TOLERANCE &&
      Math.abs(height - RECOMMENDED_DIMENSIONS.square.height) <= RECOMMENDED_DIMENSIONS.square.height * TOLERANCE;

    if (!matchesBanner && !matchesSquare) {
      errors.push(`Dimensões ${width}x${height}px não correspondem aos tamanhos recomendados`);
      errors.push(`Recomendado: 728x90px (banner) ou 300x250px (quadrado)`);
    }

    // Check aspect ratio for banner (should be ~8:1)
    if (matchesBanner) {
      const aspectRatio = width / height;
      if (Math.abs(aspectRatio - 8.09) > 0.5) {
        errors.push(`Proporção incorreta: ${aspectRatio.toFixed(2)}:1 (esperado ~8:1)`);
      }
    }

    // Check minimum resolution (72 DPI is minimum, 150 DPI is recommended)
    if (width < 728 && height < 250) {
      errors.push('Resolução muito baixa - pode ficar pixelado no PDF');
    }

    return {
      width,
      height,
      fileSize,
      isValid: errors.length === 0,
      errors
    };
  };

  const loadImageDimensions = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = validateImageDimensions(img.width, img.height);
      setImageDimensions(dimensions);
    };
    img.onerror = () => {
      setImageDimensions(null);
    };
    img.src = url;
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    setPreviewUrl(url);
    onImageChange(url);
    if (url) {
      loadImageDimensions(url);
    } else {
      setImageDimensions(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB');
      return;
    }

    // Convert to base64 for local storage and validate dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;

      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        const dimensions = validateImageDimensions(img.width, img.height, file.size);
        setImageDimensions(dimensions);

        // Show warning if dimensions are invalid but still allow upload
        if (!dimensions.isValid) {
          const confirmUpload = confirm(
            `⚠️ ATENÇÃO: Dimensões não recomendadas!\n\n` +
            `Imagem: ${dimensions.width}x${dimensions.height}px\n` +
            `Problemas encontrados:\n${dimensions.errors.join('\n')}\n\n` +
            `Deseja continuar mesmo assim?`
          );

          if (!confirmUpload) {
            return;
          }
        }

        setPreviewUrl(base64String);
        onImageChange(base64String);
      };
      img.src = base64String;
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    setUrlInput('');
    setImageDimensions(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
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
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Escolher Imagem
            </Button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
          </p>
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
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
                alert('Erro ao carregar imagem. Verifique a URL.');
              }}
            />
          </div>
        </div>
      )}

      {/* Dimension Validation Status */}
      {imageDimensions && (
        <Alert className={imageDimensions.isValid ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
          {imageDimensions.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-amber-600" />
          )}
          <AlertDescription className={imageDimensions.isValid ? 'text-green-900 text-xs' : 'text-amber-900 text-xs'}>
            {imageDimensions.isValid ? (
              <>
                <strong>✅ Dimensões corretas!</strong> {imageDimensions.width}x{imageDimensions.height}px
                {imageDimensions.fileSize && ` | Tamanho: ${(imageDimensions.fileSize / 1024).toFixed(0)}KB`}
              </>
            ) : (
              <>
                <strong>⚠️ Atenção:</strong> {imageDimensions.width}x{imageDimensions.height}px
                {imageDimensions.fileSize && ` | ${(imageDimensions.fileSize / 1024).toFixed(0)}KB`}
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {imageDimensions.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Technical Specifications Card */}
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
        <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Especificações Técnicas do Banner
        </h4>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-2 rounded border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">📐 Banner Horizontal</p>
              <p className="text-zinc-700"><strong>Dimensões:</strong> 728 x 90 pixels</p>
              <p className="text-zinc-700"><strong>Proporção:</strong> 8:1 (largura:altura)</p>
            </div>
            <div className="bg-white p-2 rounded border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">📐 Banner Quadrado</p>
              <p className="text-zinc-700"><strong>Dimensões:</strong> 300 x 250 pixels</p>
              <p className="text-zinc-700"><strong>Proporção:</strong> 1.2:1 (largura:altura)</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-blue-200 space-y-1.5">
            <p className="font-semibold text-blue-900">🎨 Requisitos Gerais:</p>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-700 ml-2">
              <li><strong>Resolução mínima:</strong> 72 DPI (recomendado: 150 DPI)</li>
              <li><strong>Formatos aceitos:</strong> JPG, PNG, GIF</li>
              <li><strong>Tamanho máximo:</strong> 5 MB</li>
              <li><strong>Espaço no PDF:</strong> 180mm x 50mm (equivalente ao banner)</li>
              <li><strong>Cores:</strong> RGB (será convertido para PDF automaticamente)</li>
            </ul>
          </div>

          <div className="bg-white p-3 rounded border border-blue-200 space-y-1.5">
            <p className="font-semibold text-blue-900">✅ Checklist de Qualidade:</p>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-700 ml-2">
              <li>Imagem nítida e sem pixelização</li>
              <li>Texto legível (fonte mínima 10pt)</li>
              <li>Cores com bom contraste</li>
              <li>Logotipo e informações visíveis</li>
              <li>Sem distorções ou esticamento</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-2 rounded border border-amber-300">
            <p className="font-semibold text-amber-900">⚠️ Importante:</p>
            <p className="text-zinc-700 mt-1">
              O banner será inserido no PDF com dimensões fixas de <strong>180mm x 50mm</strong>.
              Imagens com dimensões diferentes serão redimensionadas automaticamente, o que pode
              causar distorção ou perda de qualidade visual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
