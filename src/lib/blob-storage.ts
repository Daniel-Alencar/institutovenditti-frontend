/**
 * Blob Storage Service - Integração com Vercel Blob para armazenamento de PDFs
 * 
 * Este serviço gerencia o upload de PDFs das análises jurídicas para o Vercel Blob.
 * Os PDFs são armazenados na nuvem e as URLs são salvas no banco de dados.
 */

import { supabase } from './supabase';

interface BlobUploadResponse {
  url: string;
  downloadUrl: string;
  pathname: string;
}

/**
 * Faz upload de um PDF para o Vercel Blob
 * @param pdfBlob - O blob do PDF a ser enviado
 * @param filename - Nome do arquivo (ex: "diagnostico_trabalhista_joao_silva_2026-03-18.pdf")
 * @returns URL do PDF armazenado
 */
export async function uploadPDFToBlob(pdfBlob: Blob, filename: string): Promise<string> {
  try {
    // Criar FormData para envio
    const formData = new FormData();
    formData.append('file', pdfBlob, filename);

    // Fazer upload para Vercel Blob via API
    const response = await fetch('/api/upload-blob', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro ao fazer upload: ${response.statusText}`);
    }

    const data: BlobUploadResponse = await response.json();
    return data.url;
  } catch (error) {
    console.error('Erro ao fazer upload do PDF para Vercel Blob:', error);
    throw error;
  }
}

/**
 * Salva a referência do PDF no banco de dados (tabela diagnostics)
 * @param diagnosticId - ID do diagnóstico
 * @param pdfUrl - URL do PDF armazenado no Vercel Blob
 */
export async function savePDFUrlToDB(diagnosticId: string, pdfUrl: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('diagnostics')
      .update({ pdf_url: pdfUrl })
      .eq('id', diagnosticId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar URL do PDF no banco de dados:', error);
    throw error;
  }
}

/**
 * Obtém a URL do PDF de um diagnóstico
 * @param diagnosticId - ID do diagnóstico
 * @returns URL do PDF ou null se não encontrado
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
 * @param pdfUrl - URL do PDF
 * @param filename - Nome do arquivo para referência
 */
export function openPDFInNewTab(pdfUrl: string, filename?: string): void {
  try {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao abrir PDF:', error);
    alert('Erro ao abrir o PDF. Tente novamente.');
  }
}

/**
 * Deleta um PDF do Vercel Blob
 * @param pdfUrl - URL do PDF a ser deletado
 */
export async function deletePDFFromBlob(pdfUrl: string): Promise<void> {
  try {
    const response = await fetch('/api/delete-blob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: pdfUrl }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar PDF: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erro ao deletar PDF do Vercel Blob:', error);
    throw error;
  }
}
