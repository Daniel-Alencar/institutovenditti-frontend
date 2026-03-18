/**
 * Blob Storage Service - Integração com Supabase Storage
 *
 * Gerencia upload de PDFs e imagens de banner para o Supabase Storage.
 * Pré-requisito: execute supabase-storage-setup.sql no SQL Editor do Supabase.
 */

import { supabase } from './supabase';

const PDF_BUCKET    = 'pdfs';
const BANNER_BUCKET = 'banners';

// ─── Helpers ────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
}

// ─── PDFs ────────────────────────────────────────────────────────────────────

/**
 * Faz upload de um PDF para o Supabase Storage e retorna a URL pública.
 */
export async function uploadPDFToBlob(pdfBlob: Blob, filename: string): Promise<string> {
  const safeFilename = sanitizeFilename(filename);

  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(safeFilename, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('Erro ao fazer upload do PDF:', error);
    throw new Error(`Falha no upload do PDF: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(PDF_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Obtém a URL do PDF de um diagnóstico pelo seu ID.
 */
export async function getPDFUrl(diagnosticId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('pdf_url')
      .eq('id', diagnosticId)
      .single();

    if (error) throw error;
    return data?.pdf_url ?? null;
  } catch (error) {
    console.error('Erro ao obter URL do PDF:', error);
    return null;
  }
}

/** Abre um PDF em nova aba. */
export function openPDFInNewTab(pdfUrl: string): void {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Remove um PDF do Supabase Storage a partir da sua URL pública. */
export async function deletePDFFromBlob(pdfUrl: string): Promise<void> {
  const parts = pdfUrl.split(`/storage/v1/object/public/${PDF_BUCKET}/`);
  if (parts.length < 2) throw new Error('URL do PDF inválida para deleção');
  const { error } = await supabase.storage.from(PDF_BUCKET).remove([parts[1]]);
  if (error) throw error;
}

// ─── Banners de anúncio ──────────────────────────────────────────────────────

/**
 * Faz upload de uma imagem de banner para o Supabase Storage.
 * @param imageFile - Arquivo de imagem (File ou Blob)
 * @param originalName - Nome original do arquivo para gerar o path
 * @returns URL pública da imagem
 */
export async function uploadBannerImage(
  imageFile: File | Blob,
  originalName: string
): Promise<string> {
  const ext         = originalName.split('.').pop() ?? 'jpg';
  const base        = sanitizeFilename(originalName.replace(/\.[^.]+$/, ''));
  const filename    = `${base}_${Date.now()}.${ext}`;
  const contentType = imageFile instanceof File ? imageFile.type : `image/${ext}`;

  const { data, error } = await supabase.storage
    .from(BANNER_BUCKET)
    .upload(filename, imageFile, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('Erro ao fazer upload do banner:', error);
    throw new Error(`Falha no upload da imagem: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BANNER_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/** Remove uma imagem de banner do Supabase Storage. */
export async function deleteBannerImage(imageUrl: string): Promise<void> {
  const parts = imageUrl.split(`/storage/v1/object/public/${BANNER_BUCKET}/`);
  if (parts.length < 2) return; // URL externa (não gerenciada pelo Storage)
  const { error } = await supabase.storage.from(BANNER_BUCKET).remove([parts[1]]);
  if (error) console.error('Erro ao deletar banner:', error);
}
