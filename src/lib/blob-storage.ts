/**
 * Blob Storage Service - Integração com Supabase Storage para armazenamento de PDFs
 *
 * Este serviço gerencia o upload de PDFs das análises jurídicas para o Supabase Storage.
 * Os PDFs são armazenados na nuvem e as URLs públicas são salvas no banco de dados.
 *
 * Pré-requisito: Execute o bloco "SUPABASE STORAGE SETUP" do supabase-schema.sql
 * para criar o bucket 'pdfs' com as políticas corretas.
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'pdfs';

/**
 * Faz upload de um PDF para o Supabase Storage
 * @param pdfBlob - O blob do PDF a ser enviado
 * @param filename - Nome do arquivo
 * @returns URL pública do PDF armazenado
 */
export async function uploadPDFToBlob(pdfBlob: Blob, filename: string): Promise<string> {
  // Sanitiza o nome do arquivo (sem espaços, caracteres especiais)
  const safeFilename = filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(safeFilename, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    console.error('Erro ao fazer upload do PDF para Supabase Storage:', error);
    throw new Error(`Falha no upload do PDF: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Obtém a URL do PDF de um diagnóstico
 */
export async function getPDFUrl(diagnosticId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('pdf_url')
      .eq('id', diagnosticId)
      .single();

    if (error) throw error;
    return data?.pdf_url || null;
  } catch (error) {
    console.error('Erro ao obter URL do PDF:', error);
    return null;
  }
}

/**
 * Abre o PDF em uma nova aba
 */
export function openPDFInNewTab(pdfUrl: string): void {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Deleta um PDF do Supabase Storage
 */
export async function deletePDFFromBlob(pdfUrl: string): Promise<void> {
  const urlParts = pdfUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
  if (urlParts.length < 2) throw new Error('URL do PDF inválida');
  const filePath = urlParts[1];

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
  if (error) throw error;
}
