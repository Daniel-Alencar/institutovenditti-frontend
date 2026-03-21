import { jsPDF } from 'jspdf';
import type { LegalArea, QuestionnaireResponse, UserData } from '@/types/legal';
import type { Announcement } from '@/lib/data-service';
import { formatWhatsApp } from '@/lib/scoring';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface PDFGenerationOptions {
  area: LegalArea;
  userData: UserData;
  aiReport: string;
  totalScore: number;
  urgencyLevel: 'high' | 'medium' | 'low';
  /** Anúncios ativos buscados do banco. Se omitido, usa placeholders. */
  announcements?: Announcement[];
}

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  bgLight: string;
  warning: string;
  success: string;
  danger: string;
}

// Regex que detecta um marcador de espaço publicitário na linha
const BANNER_MARKER_RE = /^\s*\[ESPAÇO_PUBLICITARIO_(\d)\]\s*$/i;

// ─── Utilitários de imagem ────────────────────────────────────────────────────

/**
 * Carrega uma imagem a partir de uma URL e retorna base64, formato MIME
 * e as dimensões naturais (px) da imagem.
 * Retorna null se falhar (CORS, 404, etc.).
 */
async function fetchImageAsBase64(
  url: string
): Promise<{ data: string; format: 'PNG' | 'JPEG' | 'GIF' | 'WEBP'; naturalW: number; naturalH: number } | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    const mime = blob.type || '';
    const format = mime.includes('png')
      ? 'PNG'
      : mime.includes('gif')
      ? 'GIF'
      : mime.includes('webp')
      ? 'WEBP'
      : 'JPEG';

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Carrega em <img> para ler dimensões naturais
        const img = new Image();
        img.onload  = () => resolve({ data: base64, format, naturalW: img.naturalWidth, naturalH: img.naturalHeight });
        img.onerror = () => resolve({ data: base64, format, naturalW: 0, naturalH: 0 });
        img.src = base64;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Pré-carregamento de imagens ─────────────────────────────────────────────

type ImgData = { data: string; format: 'PNG' | 'JPEG' | 'GIF' | 'WEBP'; naturalW: number; naturalH: number };
type ImgCache = Record<number, ImgData | null>;

async function preloadAnnouncementImages(announcements: Announcement[]): Promise<ImgCache> {
  const cache: ImgCache = {};
  await Promise.all(
    announcements.map(async (ann) => {
      if (ann.imageUrl) {
        cache[ann.position] = await fetchImageAsBase64(ann.imageUrl);
      } else {
        cache[ann.position] = null;
      }
    })
  );
  return cache;
}

// ─── Renderização de banner ───────────────────────────────────────────────────

/**
 * Renderiza um espaço publicitário no PDF.
 * Retorna o novo yPosition após o bloco.
 */
function renderBanner(
  doc: jsPDF,
  y: number,
  position: number,
  announcement: Announcement | undefined,
  imgData: ImgData | null | undefined,
  colors: Colors
): number {
  // ── Verificar se cabe na página ──────────────────────────────────────────
  const totalH = announcement ? (imgData ? 50 : 20) : 20;
  if (y + totalH > 275) {
    doc.addPage();
    y = 20;
  }

  const X = 15;
  const W = 180;

  if (!announcement) {
    // ── Placeholder ──────────────────────────────────────────────────────
    const placeholderColors = ['#DBEAFE', '#F3E8FF', '#D1FAE5', '#FED7AA'];
    const borderColors      = ['#3B82F6', '#A855F7', '#10B981', '#F97316'];
    const ci = (position - 1) % 4;

    doc.setFillColor(placeholderColors[ci]);
    doc.rect(X, y, W, 18, 'F');
    doc.setDrawColor(borderColors[ci]);
    doc.setLineWidth(0.4);
    doc.rect(X, y, W, 18, 'S');

    doc.setTextColor(colors.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Espaço Publicitário ${position} — sem anúncio configurado`, 105, y + 11, { align: 'center' });

    return y + 20;
  }

  // ── Anúncio configurado ──────────────────────────────────────────────────

  if (imgData) {
    // Calcula altura proporcional às dimensões naturais da imagem
    // Limita a 80mm para não ocupar a página toda; mínimo de 10mm
    const ratio  = (imgData.naturalW > 0 && imgData.naturalH > 0)
      ? imgData.naturalH / imgData.naturalW
      : 42 / 180;                          // fallback: proporção padrão de banner
    const imgH   = Math.min(Math.max(W * ratio, 10), 80);

    // Garante que cabe na página antes de renderizar
    if (y + imgH > 275) { doc.addPage(); y = 20; }

    try {
      doc.addImage(imgData.data, imgData.format, X, y, W, imgH);
    } catch {
      // Se falhar (formato não suportado, etc.) mostra cinza
      doc.setFillColor('#E5E7EB');
      doc.rect(X, y, W, imgH, 'F');
      doc.setTextColor(colors.textLight);
      doc.setFontSize(8);
      doc.text(`[Imagem não pôde ser carregada — Anúncio ${position}]`, 105, y + imgH / 2, { align: 'center' });
    }
    y += imgH + 1;
  }

  // ── Seção de links ────────────────────────────────────────────────────────
  const links: Array<{ label: string; url: string }> = [];
  if (announcement.websiteUrl)   links.push({ label: 'Site',      url: announcement.websiteUrl });
  if (announcement.facebookUrl)  links.push({ label: 'Facebook',  url: announcement.facebookUrl });
  if (announcement.instagramUrl) links.push({ label: 'Instagram', url: announcement.instagramUrl });

  if (links.length > 0) {
    if (y + 12 > 275) { doc.addPage(); y = 20; }

    // Fundo da barra de links
    doc.setFillColor('#F1F5F9');
    doc.rect(X, y, W, 11, 'F');
    doc.setDrawColor('#CBD5E1');
    doc.setLineWidth(0.3);
    doc.rect(X, y, W, 11, 'S');

    // Distribui os links horizontalmente
    const segW = W / links.length;
    links.forEach((link, i) => {
      const cx = X + segW * i + segW / 2;
      const cy = y + 7;

      // Texto clicável
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#1D4ED8');
      doc.textWithLink(link.label, cx, cy, { url: link.url, align: 'center' });

      // Sublinha
      const textW = doc.getTextWidth(link.label);
      doc.setDrawColor('#1D4ED8');
      doc.setLineWidth(0.2);
      doc.line(cx - textW / 2, cy + 0.5, cx + textW / 2, cy + 0.5);
    });

    y += 13;
  }

  return y;
}

// ─── Renderização de linha de texto ──────────────────────────────────────────

function renderTextLine(doc: jsPDF, line: string, y: number, colors: Colors): number {
  if (y > 272) {
    doc.addPage();
    y = 20;
  }

  const clean = line.replace(/\*\*/g, '').replace(/\[.*?\]\(.*?\)/g, (m) => {
    const label = m.match(/\[(.*?)\]/)?.[1] ?? '';
    return label;
  });

  if (line.startsWith('# ')) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colors.primary);
    const text = doc.splitTextToSize(clean.replace(/^#\s+/, ''), 170);
    doc.text(text, 20, y);
    y += text.length * 7 + 2;
  } else if (line.startsWith('## ')) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.secondary);
    const text = doc.splitTextToSize(clean.replace(/^##\s+/, ''), 170);
    doc.text(text, 20, y);
    y += text.length * 6 + 2;
  } else if (line.startsWith('### ')) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colors.text);
    const text = doc.splitTextToSize(clean.replace(/^###\s+/, ''), 170);
    doc.text(text, 20, y);
    y += text.length * 5 + 1;
  } else if (/^[-•*]\s/.test(line)) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.text);
    const text = doc.splitTextToSize(clean.replace(/^[-•*]\s/, ''), 163);
    doc.text('•', 20, y);
    doc.text(text, 25, y);
    y += text.length * 5 + 1;
  } else if (line.trim() === '' || line.trim() === '---') {
    y += 3;
  } else if (line.includes('[**FALAR COM ADVOGADO')) {
    // ignora — CTA próprio é adicionado depois
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.text);
    const text = doc.splitTextToSize(clean, 170);
    doc.text(text, 20, y);
    y += text.length * 5 + 1;
  }

  return y;
}

// ─── Função principal ────────────────────────────────────────────────────────

export async function generateLegalReportPDF(options: PDFGenerationOptions): Promise<Blob> {
  const { area, userData, aiReport, totalScore, urgencyLevel, announcements = [] } = options;

  // 1. Pré-carrega imagens em paralelo antes de abrir o documento
  const imgCache = await preloadAnnouncementImages(announcements);
  const annByPos: Record<number, Announcement> = {};
  announcements.forEach((a) => { annByPos[a.position] = a; });

  // 2. Cria o documento PDF
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const colors: Colors = {
    primary:   '#1E40AF',
    secondary: '#059669',
    accent:    '#EA580C',
    text:      '#18181B',
    textLight: '#52525B',
    bgLight:   '#F4F4F5',
    warning:   '#F59E0B',
    success:   '#10B981',
    danger:    '#EF4444',
  };

  let y = 20;

  // ── Cabeçalho ──────────────────────────────────────────────────────────────
  doc.setFillColor(colors.primary);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO JURÍDICO', 105, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(area.name, 105, 30, { align: 'center' });

  y = 48;

  // ── Box de dados do cliente ────────────────────────────────────────────────
  doc.setFillColor(colors.bgLight);
  doc.rect(15, y, 180, 35, 'F');

  doc.setTextColor(colors.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DO CLIENTE', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nome: ${userData.fullName}`,              20,  y + 14);
  doc.text(`Email: ${userData.email}`,                20,  y + 20);
  doc.text(`WhatsApp: ${formatWhatsApp(userData.whatsapp)}`, 20, y + 26);

  if (userData.city && userData.state) {
    doc.text(`Localização: ${userData.city} - ${userData.state}`, 120, y + 14);
  }

  const urgencyLabels = { high: 'ALTA', medium: 'MÉDIA', low: 'BAIXA' };
  const urgencyHex    = { high: colors.danger, medium: colors.warning, low: colors.success };
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(urgencyHex[urgencyLevel]);
  doc.text(`Urgência: ${urgencyLabels[urgencyLevel]}`, 120, y + 20);
  doc.setTextColor(colors.text);
  doc.text(`Pontuação: ${totalScore} pontos`, 120, y + 26);

  y += 40;

  // ── Corpo do relatório ─────────────────────────────────────────────────────
  // Itera linha a linha; ao encontrar um marcador, insere o banner real
  const lines = aiReport.split('\n');
  let markersFound = 0;

  for (const line of lines) {
    const match = line.match(BANNER_MARKER_RE);

    if (match) {
      // Linha é um marcador de espaço publicitário
      const pos = parseInt(match[1], 10);
      markersFound++;
      y += 3; // espaço acima do banner
      y = renderBanner(doc, y, pos, annByPos[pos], imgCache[pos], colors);
      y += 3; // espaço abaixo do banner
    } else {
      // Linha de texto normal
      if (y > 272) {
        doc.addPage();
        y = 20;
      }
      y = renderTextLine(doc, line, y, colors);
    }
  }

  // ── Fallback: se o texto não tinha nenhum marcador, adiciona os 4 banners
  //    no final do relatório (compatibilidade com respostas de backend externo)
  if (markersFound === 0) {
    for (let pos = 1; pos <= 4; pos++) {
      y += 5;
      y = renderBanner(doc, y, pos, annByPos[pos], imgCache[pos], colors);
    }
  }

  // ── Seção: Fale com um advogado ────────────────────────────────────────────
  y += 5;
  if (y + 32 > 275) { doc.addPage(); y = 20; }

  doc.setFillColor(colors.secondary);
  doc.rect(15, y, 180, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSULTE UM ADVOGADO ESPECIALIZADO', 105, y + 11, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('WhatsApp: (11) 92148-6194', 105, y + 19, { align: 'center' });
  doc.textWithLink('wa.me/5511921486194', 105, y + 25, { url: 'https://wa.me/5511921486194', align: 'center' });

  y += 35;

  // ── Prazos legais ─────────────────────────────────────────────────────────
  if (y + 38 > 275) { doc.addPage(); y = 20; }

  doc.setFillColor(255, 237, 213);
  doc.rect(15, y, 180, 35, 'F');
  doc.setTextColor(colors.accent);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ PRAZOS LEGAIS — ATENÇÃO', 20, y + 7);
  doc.setTextColor(colors.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const deadlinesText =
    'IMPORTANTE: Muitas ações judiciais possuem prazos de prescrição que variam de acordo com o ' +
    'tipo de direito. Após esse prazo, você pode perder o direito de buscar reparação na justiça. ' +
    'Não deixe para depois! Consulte um advogado para verificar os prazos aplicáveis ao seu caso.';
  doc.text(doc.splitTextToSize(deadlinesText, 170), 20, y + 14);

  y += 38;

  // ── Aviso legal ───────────────────────────────────────────────────────────
  if (y + 42 > 275) { doc.addPage(); y = 20; }

  doc.setFillColor(255, 245, 235);
  doc.rect(15, y, 180, 38, 'F');
  doc.setTextColor(colors.warning);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ AVISO LEGAL IMPORTANTE', 20, y + 7);
  doc.setTextColor(colors.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const disclaimerText =
    'Este diagnóstico é uma análise preliminar gerada por inteligência artificial e pode conter ' +
    'imprecisões ou estar desatualizado. Não substitui consulta com advogado e não constitui ' +
    'aconselhamento jurídico formal. Para avaliação jurídica completa, precisa e adequada à sua ' +
    'situação específica, consulte sempre um advogado devidamente habilitado pela OAB.';
  doc.text(doc.splitTextToSize(disclaimerText, 170), 20, y + 14);

  y += 42;

  // ── Rodapé em todas as páginas ────────────────────────────────────────────
  const pageCount = (doc.internal as any).pages.length - 1;
  const dateStr   = new Date().toLocaleDateString('pt-BR');
  const timeStr   = new Date().toLocaleTimeString('pt-BR');

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(colors.textLight);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Gerado em ${dateStr} às ${timeStr} | Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

// ─── Download helper ──────────────────────────────────────────────────────────

export function downloadPDF(blob: Blob, filename: string): void {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}