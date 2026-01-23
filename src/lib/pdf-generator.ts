import { jsPDF } from 'jspdf';
import type { LegalArea, QuestionnaireResponse, UserData } from '@/types/legal';
import { formatWhatsApp } from '@/lib/scoring';

interface PDFGenerationOptions {
  area: LegalArea;
  userData: UserData;
  aiReport: string;
  totalScore: number;
  urgencyLevel: 'high' | 'medium' | 'low';
}

/**
 * Generates a professional PDF report with Visual Law formatting
 * Includes advertisement banners and lawyer contact information
 */
export async function generateLegalReportPDF(options: PDFGenerationOptions): Promise<Blob> {
  const { area, userData, aiReport, totalScore, urgencyLevel } = options;

  // Create new PDF document - A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Visual Law color palette
  const colors = {
    primary: '#1E40AF',      // Blue institutional
    secondary: '#059669',    // Green legal
    accent: '#EA580C',       // Orange highlight
    text: '#18181B',         // Zinc-900
    textLight: '#52525B',    // Zinc-600
    bgLight: '#F4F4F5',      // Zinc-100
    warning: '#F59E0B',      // Amber
    success: '#10B981',      // Green
    danger: '#EF4444'        // Red
  };

  let yPosition = 20;

  // HEADER - Logo and title
  doc.setFillColor(colors.primary);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO JURÍDICO', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(area.name, 105, 30, { align: 'center' });

  yPosition = 50;

  // USER INFORMATION BOX
  doc.setFillColor(colors.bgLight);
  doc.rect(15, yPosition, 180, 35, 'F');

  doc.setTextColor(colors.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DO CLIENTE', 20, yPosition + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nome: ${userData.fullName}`, 20, yPosition + 14);
  doc.text(`Email: ${userData.email}`, 20, yPosition + 20);
  doc.text(`WhatsApp: ${formatWhatsApp(userData.whatsapp)}`, 20, yPosition + 26);

  if (userData.city && userData.state) {
    doc.text(`Localização: ${userData.city} - ${userData.state}`, 120, yPosition + 14);
  }

  const urgencyLabels = {
    high: 'ALTA',
    medium: 'MÉDIA',
    low: 'BAIXA'
  };

  const urgencyColors = {
    high: colors.danger,
    medium: colors.warning,
    low: colors.success
  };

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(urgencyColors[urgencyLevel]);
  doc.text(`Urgência: ${urgencyLabels[urgencyLevel]}`, 120, yPosition + 20);

  doc.setTextColor(colors.text);
  doc.text(`Pontuação: ${totalScore} pontos`, 120, yPosition + 26);

  yPosition += 40;

  // ADVERTISEMENT BANNER 1 - After user info
  yPosition = addAdvertisementBanner(doc, yPosition, 1, colors);
  yPosition += 5;

  // AI REPORT CONTENT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.primary);
  doc.text('RELATÓRIO DIAGNÓSTICO', 20, yPosition);
  yPosition += 8;

  // Process and add report content
  const reportLines = aiReport.split('\n');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.text);

  for (const line of reportLines) {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    if (line.startsWith('# ')) {
      // Main heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(colors.primary);
      const text = line.replace('# ', '');
      doc.text(text, 20, yPosition);
      yPosition += 8;
    } else if (line.startsWith('## ')) {
      // Section heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.secondary);
      const text = line.replace('## ', '');
      doc.text(text, 20, yPosition);
      yPosition += 6;
    } else if (line.startsWith('### ')) {
      // Subsection heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      const text = line.replace('### ', '');
      doc.text(text, 20, yPosition);
      yPosition += 5;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Bullet point
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      const text = line.replace(/^[*-]\s/, '');
      const splitText = doc.splitTextToSize(text, 170);
      doc.text('•', 20, yPosition);
      doc.text(splitText, 25, yPosition);
      yPosition += splitText.length * 5;
    } else if (line.includes('**') && line.length > 0) {
      // Bold text (simplified - just treat as regular for now)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      const cleanText = line.replace(/\*\*/g, '');
      const splitText = doc.splitTextToSize(cleanText, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 5;
    } else if (line.trim() === '') {
      // Empty line
      yPosition += 3;
    } else if (line.includes('[**FALAR COM ADVOGADO')) {
      // Special lawyer contact section - skip (we'll add custom)
      continue;
    } else {
      // Regular paragraph
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.text);
      const splitText = doc.splitTextToSize(line, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 5;
    }
  }

  // ADVERTISEMENT BANNER 2 - Mid report
  if (yPosition > 270) {
    doc.addPage();
    yPosition = 20;
  }
  yPosition = addAdvertisementBanner(doc, yPosition, 2, colors);
  yPosition += 10;

  // LAWYER CONTACT SECTION
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(colors.secondary);
  doc.rect(15, yPosition, 180, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSULTE UM ADVOGADO ESPECIALIZADO', 105, yPosition + 10, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('WhatsApp: (11) 92148-6194', 105, yPosition + 18, { align: 'center' });
  doc.text('wa.me/5511921486194', 105, yPosition + 24, { align: 'center' });

  yPosition += 35;

  // ADVERTISEMENT BANNER 3
  yPosition = addAdvertisementBanner(doc, yPosition, 3, colors);
  yPosition += 10;

  // LEGAL DEADLINES WARNING (Item 2 - Prazos Legais)
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(255, 237, 213); // Orange light
  const deadlinesHeight = 35; // Increased height for proper text fit
  doc.rect(15, yPosition, 180, deadlinesHeight, 'F');

  doc.setTextColor(colors.accent);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠️ PRAZOS LEGAIS - ATENÇÃO', 20, yPosition + 7);

  doc.setTextColor(colors.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const deadlinesText = 'IMPORTANTE: Muitas ações judiciais possuem prazos de prescrição que variam de acordo com o tipo de direito. Após esse prazo, você pode perder o direito de buscar reparação na justiça. Não deixe para depois! Consulte um advogado para verificar os prazos aplicáveis ao seu caso.';
  const deadlinesLines = doc.splitTextToSize(deadlinesText, 170);
  doc.text(deadlinesLines, 20, yPosition + 14);

  yPosition += deadlinesHeight + 5;

  // DISCLAIMER (Aviso Legal)
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  const disclaimerHeight = 40; // Increased height for proper text fit
  doc.setFillColor(255, 245, 235); // Amber light
  doc.rect(15, yPosition, 180, disclaimerHeight, 'F');

  doc.setTextColor(colors.warning);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ AVISO LEGAL IMPORTANTE', 20, yPosition + 7);

  doc.setTextColor(colors.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const disclaimerText = 'Este diagnóstico é uma análise preliminar gerada por inteligência artificial e pode conter imprecisões ou estar desatualizado. Não substitui consulta com advogado e não constitui aconselhamento jurídico formal. Para avaliação jurídica completa, precisa e adequada à sua situação específica, consulte sempre um advogado devidamente habilitado pela OAB.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, 170);
  doc.text(disclaimerLines, 20, yPosition + 14);

  yPosition += disclaimerHeight;

  // ADVERTISEMENT BANNER 4 - Final
  yPosition = addAdvertisementBanner(doc, yPosition, 4, colors);

  // FOOTER - Generation date
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(colors.textLight);
    doc.setFont('helvetica', 'italic');
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');
    doc.text(`Gerado em ${date} às ${time} | Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }

  // Return PDF as blob
  return doc.output('blob');
}

/**
 * Adds an advertisement banner placeholder to the PDF
 */
function addAdvertisementBanner(
  doc: jsPDF,
  yPosition: number,
  position: number,
  colors: Record<string, string>
): number {
  const bannerColors = [
    '#DBEAFE', // Blue
    '#F3E8FF', // Purple
    '#D1FAE5', // Green
    '#FED7AA'  // Orange
  ];

  const bannerBorderColors = [
    '#3B82F6',
    '#A855F7',
    '#10B981',
    '#F97316'
  ];

  const colorIndex = (position - 1) % 4;

  // Check if we need a new page (banner is 50mm tall now)
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }

  // Draw banner background
  doc.setFillColor(bannerColors[colorIndex]);
  doc.rect(15, yPosition, 180, 50, 'F');

  // Draw banner border
  doc.setDrawColor(bannerBorderColors[colorIndex]);
  doc.setLineWidth(0.5);
  doc.rect(15, yPosition, 180, 50, 'S');

  // Add banner text
  doc.setTextColor(colors.textLight);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(`Espaço Publicitário ${position}`, 20, yPosition + 8);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text);
  doc.text('Banner 180mm x 50mm', 105, yPosition + 20, { align: 'center' });

  doc.setFontSize(9);
  doc.text('Anúncio Disponível', 105, yPosition + 28, { align: 'center' });

  return yPosition + 50;
}

/**
 * Downloads a PDF blob with a given filename
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
