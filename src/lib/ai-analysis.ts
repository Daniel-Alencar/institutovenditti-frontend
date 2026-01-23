import { type LegalArea, type QuestionnaireResponse } from '@/types/legal';

/**
 * AI Analysis Service
 * Generates structured legal diagnostics based on questionnaire responses
 */

export interface AIAnalysisInput {
  area: LegalArea;
  responses: QuestionnaireResponse[];
  totalScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

/**
 * System prompt for AI legal analysis
 * Defines the structure, tone, and requirements for the diagnostic report
 */
const ANALYSIS_SYSTEM_PROMPT = `
  OBJETIVO GERAL
  Elaborar um diagnóstico jurídico técnico e acessível, que ajude o usuário a compreender:
  1. Quais direitos podem ter sido violados;
  2. Quais medidas práticas deve tomar;
  3. Qual a urgência e a viabilidade de agir.

  ESTRUTURA OBRIGATÓRIA DO RELATÓRIO

  1. SUMÁRIO EXECUTIVO
  • Contexto breve do caso, identificando o problema central.
  • Principais direitos potencialmente envolvidos.
  • Nível de urgência com base nas respostas.

  2. ANÁLISE DETALHADA DAS RESPOSTAS
  • Interprete cada resposta, destacando fatos juridicamente relevantes.
  • Identifique condutas ilegais, abusivas ou omissões.
  • Avalie indícios de violação de direitos com base na legislação aplicável.
  • Se possível, indique prazo de prescrição ou decadência pertinente.
  • Aponte inconsistências ou informações que precisam ser comprovadas com documentos.

  3. FUNDAMENTAÇÃO LEGAL
  • Cite artigos específicos de lei (CLT, CC, CDC, CPC, CF, etc.).
  • Mencione jurisprudência exemplificativa quando for útil.
  • Inclua o fundamento jurídico de cada direito mencionado.
  • Evite exageros: mantenha o texto técnico, fiel ao direito vigente.

  4. RECOMENDAÇÕES PRÁTICAS
  • Liste documentos que o usuário deve reunir (ex: contrato, comprovantes, laudos, prints).
  • Indique quais órgãos procurar (Procon, Justiça do Trabalho, advogado especializado, etc.).
  • Recomende ações imediatas (registrar denúncia, notificar empresa, etc.).
  • Sugira alternativas viáveis: acordo, mediação, processo judicial, etc.

  5. AVALIAÇÃO DE VIABILIDADE
  • Indique, em linguagem simples:
    ○ Chances de êxito: Alta / Média / Baixa
    ○ Custos estimados: Baixo / Médio / Alto
    ○ Tempo médio de solução
    ○ Riscos e benefícios jurídicos
  • Justifique brevemente cada avaliação.

  6. CONCLUSÃO E ORIENTAÇÃO FINAL
  • Síntese clara do que o usuário deve fazer.
  • Tom de aconselhamento profissional, não apenas informativo.
  • Reforce a importância de consultar um advogado, sem substituir a atuação humana.
  • Feche com tom ético e tranquilizador.

  REQUISITOS DE QUALIDADE
  • Linguagem acessível, mas tecnicamente correta.
  • Evite jargões sem explicação.
  • Estruture o texto com subtítulos e seções bem destacadas.
  • Sem markdown (sem #, **, etc.).
  • Utilize títulos em maiúsculas e seções bem destacadas.
  • Texto entre 800 e 1500 palavras, dependendo da complexidade.
  • Evite qualquer opinião política, ideológica ou especulativa.
  • Adote tom de confiança e empatia profissional.

  INSTRUÇÕES DE ESTILO
  • Escrever como um advogado experiente redigindo um parecer consultivo.
  • Mistura ideal: 60% técnico / 40% explicativo e orientativo.
  • Priorizar sempre segurança jurídica, clareza e aplicabilidade prática.
  • Evitar redundâncias e floreios.
  • Se houver pontuação baixa ou respostas vagas, emitir alerta de dados insuficientes.
`;

/**
 * Prepares user data for AI analysis
 */
function prepareAnalysisData(input: AIAnalysisInput): string {
  const { area, responses, totalScore, urgencyLevel } = input;

  let context = `ÁREA DO DIREITO: ${area.name}\n`;
  context += `PONTUAÇÃO TOTAL: ${totalScore} pontos\n`;
  context += `NÍVEL DE URGÊNCIA: ${urgencyLevel === 'high' ? 'ALTA' : urgencyLevel === 'medium' ? 'MÉDIA' : 'BAIXA'}\n\n`;
  context += `RESPOSTAS DO QUESTIONÁRIO:\n\n`;

  responses.forEach((response, index) => {
    const question = area.questions.find(q => q.id === response.questionId);
    if (!question) return;

    context += `${index + 1}. ${question.text}\n`;

    if (question.type === 'radio' && typeof response.answer === 'string') {
      const option = question.options?.find(opt => opt.value === response.answer);
      context += `   Resposta: ${option?.label || response.answer}\n`;
      context += `   Pontuação: ${option?.points || 0} pontos\n`;
    } else if (question.type === 'checkbox' && Array.isArray(response.answer)) {
      const selectedOptions = question.options?.filter(opt => response.answer.includes(opt.value));
      context += `   Respostas selecionadas:\n`;
      selectedOptions?.forEach(opt => {
        context += `   - ${opt.label} (${opt.points} pontos)\n`;
      });
    } else if (question.type === 'textarea' && typeof response.answer === 'string') {
      context += `   Descrição do usuário:\n   "${response.answer}"\n`;
    }

    context += '\n';
  });

  return context;
}

/**
 * Generates AI-powered legal analysis
 *
 * ⚠️ SECURITY: This function calls a backend API endpoint.
 * AI analysis is handled server-side to protect API keys.
 * The backend endpoint should be configured at /api/analyze
 */
export async function generateAIAnalysis(input: AIAnalysisInput): Promise<string> {
  console.log('🤖 AI Analysis - Calling backend API:', {
    area: input.area.name,
    totalScore: input.totalScore,
    urgencyLevel: input.urgencyLevel,
  });

  try {

    const API_URL = import.meta.env.VITE_API_URL;

    // Call backend API endpoint
    // TODO: Configure your backend server to handle /api/analyze
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', errorText);

      // If backend is not configured, use fallback report
      if (response.status === 404) {
        console.warn('⚠️ Backend endpoint /api/analyze not found');
        console.log('📝 Using local fallback report generation');
        console.log('💡 Configure your backend server to handle AI analysis');

        // Prepare data for fallback analysis
        const analysisData = prepareAnalysisData(input);
        return generateStructuredReport(input, analysisData);
      }

      throw new Error('Failed to generate AI analysis');
    }

    const result = await response.json();
    console.log('✅ AI analysis received from backend');
    return result.analysis;
  } catch (error) {
    console.error('❌ Network error calling backend API:', error);

    // Fallback to local report generation if backend is unreachable
    console.warn('⚠️ Backend unreachable - using local fallback');
    console.log('📝 Generating structured report locally');
    console.log('💡 Configure your backend server to handle AI analysis');

    const analysisData = prepareAnalysisData(input);
    return generateStructuredReport(input, analysisData);
  }
}

/**
 * Generates a structured report following the AI prompt guidelines
 */
function generateStructuredReport(
  input: AIAnalysisInput, analysisData: string
): string {
  const { area, responses, totalScore, urgencyLevel } = input;

  const urgencyText = urgencyLevel === 'high'
    ? 'ALTA - Requer atenção jurídica imediata'
    : urgencyLevel === 'medium'
    ? 'MÉDIA - Recomenda-se orientação jurídica em breve'
    : 'BAIXA - Situação deve ser monitorada';

  let report = `RELATÓRIO JURÍDICO - ${area.name.toUpperCase()}\n\n`;

  // 1. SUMÁRIO EXECUTIVO
  report += `SUMÁRIO EXECUTIVO\n\n`;
  report += generateExecutiveSummary(area, responses, totalScore, urgencyLevel);
  report += `\n\n`;

  // 🎯 ESPAÇO PUBLICITÁRIO 1 - Após Sumário Executivo
  report += `[ESPAÇO_PUBLICITARIO_1]\n\n`;

  // 2. ANÁLISE DETALHADA DAS RESPOSTAS
  report += `ANÁLISE DETALHADA DAS RESPOSTAS\n\n`;
  report += generateDetailedAnalysis(area, responses);
  report += `\n\n`;

  // 3. FUNDAMENTAÇÃO LEGAL
  report += `FUNDAMENTAÇÃO LEGAL\n\n`;
  report += generateLegalFoundation(area, responses);
  report += `\n\n`;

  // 4. RECOMENDAÇÕES PRÁTICAS
  report += `RECOMENDAÇÕES PRÁTICAS\n\n`;
  report += generatePracticalRecommendations(area, responses, urgencyLevel);
  report += `\n\n`;

  // 5. AVALIAÇÃO DE VIABILIDADE
  report += `AVALIAÇÃO DE VIABILIDADE\n\n`;
  report += generateViabilityAssessment(area, responses, totalScore, urgencyLevel);
  report += `\n\n`;

  // 6. CONCLUSÃO E ORIENTAÇÃO FINAL
  report += `CONCLUSÃO E ORIENTAÇÃO FINAL\n\n`;
  report += generateConclusion(area, urgencyLevel);
  report += `\n\n`;

  report += `---\n`;
  report += `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n`;

  return report;
}

function generateExecutiveSummary(
  area: LegalArea, 
  responses: QuestionnaireResponse[], 
  totalScore: number, 
  urgencyLevel: string
): string {
  let summary = '';

  // Identify main issues based on high-scoring responses
  const highScoreResponses = responses.filter(r => {
    const question = area.questions.find(q => q.id === r.questionId);
    if (!question) return false;

    if (question.type === 'radio' && typeof r.answer === 'string') {
      const option = question.options?.find(opt => opt.value === r.answer);
      return (option?.points || 0) > 15;
    }
    return false;
  });

  summary += `O caso apresentado na área de ${area.name} revela `;

  if (totalScore >= 60) {
    summary += `indícios significativos de violação de direitos, com pontuação total de ${totalScore} pontos, `;
    summary += `indicando necessidade de atenção jurídica. `;
  } else if (totalScore >= 30) {
    summary += `alguns pontos de atenção que merecem análise jurídica, com pontuação de ${totalScore} pontos. `;
  } else {
    summary += `uma situação que deve ser monitorada, com pontuação de ${totalScore} pontos. `;
  }

  summary += `\n\nPrincipais direitos potencialmente envolvidos: `;
  summary += getMainRights(area, highScoreResponses);

  summary += `\n\nNível de urgência: ${urgencyLevel === 'high' ? 'ALTO' : urgencyLevel === 'medium' ? 'MÉDIO' : 'BAIXO'} - `;
  summary += urgencyLevel === 'high'
    ? 'Recomenda-se buscar orientação jurídica imediatamente, pois há indícios de violações graves que podem estar sujeitas a prazos prescricionais.'
    : urgencyLevel === 'medium'
    ? 'Recomenda-se consultar um advogado em breve para avaliar medidas cabíveis e evitar agravamento da situação.'
    : 'A situação deve ser monitorada. Consulte um advogado para esclarecimentos e orientações preventivas.';

  return summary;
}

function getMainRights(
  area: LegalArea, 
  highScoreResponses: QuestionnaireResponse[]
): string {
  const rights: string[] = [];

  if (area.id === 'trabalhista') {
    if (highScoreResponses.some(r => r.questionId === 'trab_1')) {
      rights.push('direito às verbas rescisórias (art. 477 da CLT)');
    }
    if (highScoreResponses.some(r => r.questionId === 'trab_2')) {
      rights.push('direito ao pagamento de horas extras (art. 59 da CLT)');
    }
    if (highScoreResponses.some(r => r.questionId === 'trab_3')) {
      rights.push('direito ao registro em carteira de trabalho (art. 29 da CLT)');
    }
    if (highScoreResponses.some(r => r.questionId === 'trab_4')) {
      rights.push('direito à integridade moral e dignidade no trabalho (art. 483 da CLT e art. 5º da CF)');
    }
  } else if (area.id === 'consumidor') {
    rights.push('direitos básicos do consumidor (arts. 6º e 18 do CDC)');
    rights.push('direito à reparação de danos (art. 6º, VI do CDC)');
  } else if (area.id === 'previdenciario') {
    rights.push('direito aos benefícios previdenciários (Lei 8.213/91)');
    rights.push('direito ao devido processo administrativo (art. 5º, LV da CF)');
  }

  return rights.length > 0 ? rights.join(', ') : 'direitos fundamentais constitucionais';
}

function generateDetailedAnalysis(
  area: LegalArea, 
  responses: QuestionnaireResponse[]
): string {
  let analysis = 'Com base nas informações fornecidas, observam-se os seguintes pontos juridicamente relevantes:\n\n';

  responses.forEach((response, index) => {
    const question = area.questions.find(q => q.id === response.questionId);
    if (!question || question.type === 'textarea') return;

    if (question.type === 'radio' && typeof response.answer === 'string') {
      const option = question.options?.find(opt => opt.value === response.answer);
      if ((option?.points || 0) > 10) {
        analysis += `${index + 1}. ${question.text}\n`;
        analysis += `   Situação identificada: ${option?.label}\n`;
        analysis += `   ${getDetailedInterpretation(area.id, question.id, response.answer)}\n\n`;
      }
    } else if (question.type === 'checkbox' && Array.isArray(response.answer) && response.answer.length > 0) {
      const selectedOptions = question.options?.filter(opt => response.answer.includes(opt.value));
      if (selectedOptions && selectedOptions.length > 0) {
        analysis += `${index + 1}. ${question.text}\n`;
        selectedOptions.forEach(opt => {
          analysis += `   - ${opt.label}\n`;
        });
        analysis += `   ${getDetailedInterpretation(area.id, question.id, 'multiple')}\n\n`;
      }
    }
  });

  // Add narrative if provided
  const narrativeResponse = responses.find(r => {
    const q = area.questions.find(q => q.id === r.questionId);
    return q?.type === 'textarea';
  });

  if (narrativeResponse && typeof narrativeResponse.answer === 'string' && narrativeResponse.answer.trim()) {
    analysis += `\nDESCRIÇÃO FORNECIDA PELO USUÁRIO:\n`;
    analysis += `"${narrativeResponse.answer}"\n\n`;
    analysis += `Esta descrição adiciona contexto importante ao caso e deve ser considerada juntamente com as demais respostas para uma avaliação completa.\n\n`;
    // 🎯 ESPAÇO PUBLICITÁRIO 2 - Após Descrição Fornecida pelo Usuário
    analysis += `[ESPAÇO_PUBLICITARIO_2]\n`;
  }

  return analysis;
}

function getDetailedInterpretation(areaId: string, questionId: string, answer: string): string {
  // Area-specific interpretations
  if (areaId === 'trabalhista') {
    if (questionId === 'trab_1') {
      if (answer === 'sim_nada') {
        return 'A ausência de pagamento das verbas rescisórias configura infração ao art. 477 da CLT. O empregador tem até 10 dias após o término do contrato para realizar o pagamento, sob pena de multa equivalente ao salário do empregado. Além disso, o trabalhador pode buscar o pagamento na Justiça do Trabalho, que incluirá correção monetária e juros.';
      } else if (answer === 'parcial') {
        return 'O pagamento parcial das verbas rescisórias pode indicar irregularidade. É importante verificar quais verbas foram pagas e quais foram omitidas, comparando com o cálculo correto previsto na legislação trabalhista.';
      }
    } else if (questionId === 'trab_2') {
      if (answer === 'frequente') {
        return 'O trabalho em horas extras sem a devida remuneração viola o art. 59 da CLT, que garante adicional mínimo de 50% sobre o valor da hora normal. É importante reunir evidências como controles de ponto, emails, mensagens ou testemunhas que comprovem a jornada extraordinária.';
      }
    } else if (questionId === 'trab_3') {
      if (answer === 'sem_registro') {
        return 'O trabalho sem registro em carteira configura grave violação trabalhista. O empregado tem direito ao reconhecimento do vínculo empregatício e a todos os direitos decorrentes (FGTS, férias, 13º, etc.). A prescrição é de 5 anos a partir do término do contrato (art. 7º, XXIX da CF).';
      } else if (answer === 'salario_menor') {
        return 'O registro com salário menor que o efetivamente pago caracteriza fraude trabalhista. Esta prática prejudica o cálculo de férias, 13º salário, FGTS e outros direitos, além de configurar possível sonegação previdenciária.';
      }
    } else if (questionId === 'trab_4') {
      if (answer === 'sim_evidencias') {
        return 'O assédio moral no ambiente de trabalho, quando comprovado, pode gerar direito a indenização por danos morais, além de possibilitar a rescisão indireta do contrato (art. 483 da CLT). A existência de provas fortalece significativamente o caso.';
      }
    } else if (questionId === 'trab_5') {
      return 'A ausência de pagamento de benefícios trabalhistas constitui infração à CLT. Cada benefício possui regras específicas de cálculo e prazos prescricionais. É fundamental reunir documentos como contracheques, extratos do FGTS e demais comprovantes.';
    }
  } else if (areaId === 'consumidor') {
    if (questionId === 'cons_1') {
      return 'O Código de Defesa do Consumidor (art. 18) garante o direito à troca, reparo ou devolução do valor pago em caso de produto com defeito. O fornecedor tem 30 dias para solucionar o problema, após o que o consumidor pode exigir uma das três opções previstas em lei.';
    }
  } else if (areaId === 'previdenciario') {
    if (questionId === 'prev_1') {
      return 'A negativa de benefício previdenciário deve ser fundamentada. O segurado tem direito ao devido processo administrativo e pode contestar a decisão através de recurso administrativo ou ação judicial. É importante verificar se todos os requisitos legais foram efetivamente cumpridos.';
    }
  }

  return 'Esta situação merece análise detalhada por profissional qualificado para avaliar todos os aspectos jurídicos envolvidos.';
}

function generateLegalFoundation(area: LegalArea, responses: QuestionnaireResponse[]): string {
  let foundation = 'A análise fundamenta-se nos seguintes dispositivos legais:\n\n';

  if (area.id === 'trabalhista') {
    foundation += 'LEGISLAÇÃO APLICÁVEL:\n\n';
    foundation += '• Consolidação das Leis do Trabalho (CLT) - Decreto-Lei nº 5.452/1943\n';
    foundation += '  - Art. 29: Obrigatoriedade de anotação na CTPS\n';
    foundation += '  - Art. 59: Horas extras e adicional de 50%\n';
    foundation += '  - Art. 129 a 138: Férias anuais remuneradas\n';
    foundation += '  - Art. 477: Prazo e forma de pagamento das verbas rescisórias\n';
    foundation += '  - Art. 483: Rescisão indireta por falta grave do empregador\n\n';
    foundation += '• Constituição Federal de 1988\n';
    foundation += '  - Art. 5º: Direitos fundamentais, dignidade da pessoa humana\n';
    foundation += '  - Art. 7º: Direitos dos trabalhadores urbanos e rurais\n';
    foundation += '  - Art. 7º, XXIX: Prazo prescricional de 5 anos\n\n';
    foundation += '• Lei nº 8.036/1990 - FGTS\n';
    foundation += '  - Arts. 15 a 18: Depósito obrigatório de 8% do salário\n\n';
  } else if (area.id === 'consumidor') {
    foundation += 'LEGISLAÇÃO APLICÁVEL:\n\n';
    foundation += '• Lei nº 8.078/1990 - Código de Defesa do Consumidor (CDC)\n';
    foundation += '  - Art. 6º: Direitos básicos do consumidor\n';
    foundation += '  - Art. 18: Responsabilidade por vício do produto\n';
    foundation += '  - Art. 20: Responsabilidade por vício do serviço\n';
    foundation += '  - Art. 42: Cobrança de dívidas, vedação ao constrangimento\n';
    foundation += '  - Art. 42, parágrafo único: Repetição em dobro do indébito\n\n';
    foundation += '• Constituição Federal de 1988\n';
    foundation += '  - Art. 5º, XXXII: Defesa do consumidor como direito fundamental\n\n';
  } else if (area.id === 'previdenciario') {
    foundation += 'LEGISLAÇÃO APLICÁVEL:\n\n';
    foundation += '• Lei nº 8.213/1991 - Plano de Benefícios da Previdência Social\n';
    foundation += '  - Arts. 18 a 47: Benefícios previdenciários\n';
    foundation += '  - Art. 42: Aposentadoria por idade\n';
    foundation += '  - Art. 57: Aposentadoria especial\n\n';
    foundation += '• Lei nº 8.212/1991 - Organização da Seguridade Social\n';
    foundation += '  - Arts. 11 a 16: Segurados da Previdência Social\n\n';
    foundation += '• Constituição Federal de 1988\n';
    foundation += '  - Arts. 201 e 202: Previdência social\n\n';
  }

  foundation += 'JURISPRUDÊNCIA RELEVANTE:\n\n';
  foundation += 'Os tribunais superiores têm entendimento consolidado sobre temas semelhantes, reforçando a proteção dos direitos fundamentais e a aplicação dos princípios constitucionais. Consulte um advogado para análise de precedentes específicos aplicáveis ao seu caso.\n';

  return foundation;
}

function generatePracticalRecommendations(area: LegalArea, responses: QuestionnaireResponse[], urgencyLevel: string): string {
  let recommendations = '';

  recommendations += '1. DOCUMENTAÇÃO NECESSÁRIA\n\n';
  recommendations += 'Reúna os seguintes documentos para subsidiar análise jurídica completa:\n\n';

  if (area.id === 'trabalhista') {
    recommendations += '• Carteira de Trabalho (CTPS) - todas as páginas\n';
    recommendations += '• Contracheques de todo o período trabalhado\n';
    recommendations += '• Termo de Rescisão do Contrato de Trabalho (TRCT)\n';
    recommendations += '• Extratos do FGTS\n';
    recommendations += '• Controles de ponto (se houver)\n';
    recommendations += '• Mensagens, emails ou comunicações com empregador\n';
    recommendations += '• Testemunhas que possam confirmar a jornada e condições de trabalho\n\n';
  } else if (area.id === 'consumidor') {
    recommendations += '• Nota fiscal ou comprovante de compra\n';
    recommendations += '• Contrato ou termos de adesão\n';
    recommendations += '• Comprovantes de pagamento\n';
    recommendations += '• Protocolo de reclamações junto ao fornecedor\n';
    recommendations += '• Emails, mensagens ou gravações de atendimento\n';
    recommendations += '• Fotos ou vídeos do produto/serviço defeituoso\n';
    recommendations += '• Laudos técnicos (se houver)\n\n';
  } else if (area.id === 'previdenciario') {
    recommendations += '• Documento de identidade e CPF\n';
    recommendations += '• CNIS - Cadastro Nacional de Informações Sociais\n';
    recommendations += '• Carta de indeferimento ou cessação do benefício\n';
    recommendations += '• Comprovantes de contribuição previdenciária\n';
    recommendations += '• Laudos médicos e exames (se aplicável)\n';
    recommendations += '• Carteira de trabalho e contracheques\n\n';
  }

  recommendations += '2. ÓRGÃOS E ENTIDADES COMPETENTES\n\n';

  if (area.id === 'trabalhista') {
    recommendations += '• Ministério do Trabalho e Emprego (MTE) - denúncias e fiscalização\n';
    recommendations += '• Sindicato da categoria - orientação e assistência\n';
    recommendations += '• Justiça do Trabalho - ações judiciais\n';
    recommendations += '• Defensoria Pública - assistência jurídica gratuita (se aplicável)\n';
    recommendations += '• Advogado especializado em Direito do Trabalho\n\n';
  } else if (area.id === 'consumidor') {
    recommendations += '• Procon - reclamações e mediação\n';
    recommendations += '• Consumidor.gov.br - plataforma online de reclamações\n';
    recommendations += '• Juizados Especiais Cíveis - ações até 40 salários mínimos\n';
    recommendations += '• Ministério Público - defesa de interesses coletivos\n';
    recommendations += '• Advogado especializado em Direito do Consumidor\n\n';
  } else if (area.id === 'previdenciario') {
    recommendations += '• INSS - Agência da Previdência Social ou portal Meu INSS\n';
    recommendations += '• Junta de Recursos do INSS - recurso administrativo\n';
    recommendations += '• Justiça Federal - ações contra o INSS\n';
    recommendations += '• Defensoria Pública - assistência jurídica gratuita\n';
    recommendations += '• Advogado especializado em Direito Previdenciário\n\n';
  }

  recommendations += '3. AÇÕES IMEDIATAS RECOMENDADAS\n\n';

  if (urgencyLevel === 'high') {
    recommendations += '⚠️ URGENTE - Sua situação exige providências imediatas:\n\n';
    recommendations += '• Consulte um advogado especializado o mais breve possível\n';
    recommendations += '• Verifique prazos prescricionais aplicáveis ao seu caso\n';
    recommendations += '• Preserve todas as provas e documentos\n';
    recommendations += '• Evite acordos verbais sem orientação jurídica\n';
    recommendations += '• Registre formalmente sua reclamação nos órgãos competentes\n\n';
  } else if (urgencyLevel === 'medium') {
    recommendations += '• Agende consulta com advogado especializado em breve\n';
    recommendations += '• Organize toda a documentação disponível\n';
    recommendations += '• Formalize reclamação por escrito junto à parte contrária\n';
    recommendations += '• Busque orientação no órgão competente para seu caso\n\n';
  } else {
    recommendations += '• Mantenha a documentação organizada e acessível\n';
    recommendations += '• Monitore eventuais mudanças na situação\n';
    recommendations += '• Busque orientação preventiva com advogado\n';
    recommendations += '• Informe-se sobre seus direitos\n\n';
  }

  recommendations += '4. ALTERNATIVAS DE SOLUÇÃO\n\n';
  recommendations += '• Acordo extrajudicial - mais rápido e econômico\n';
  recommendations += '• Mediação - com auxílio de terceiro imparcial\n';
  recommendations += '• Processo administrativo - junto ao órgão competente\n';
  recommendations += '• Ação judicial - quando esgotadas as vias anteriores ou em casos urgentes\n';

  return recommendations;
}

function generateViabilityAssessment(area: LegalArea, responses: QuestionnaireResponse[], totalScore: number, urgencyLevel: string): string {
  let assessment = '';

  // Success chances
  assessment += 'CHANCES DE ÊXITO: ';
  if (totalScore >= 70) {
    assessment += 'ALTA\n\n';
    assessment += 'A pontuação elevada indica fortes indícios de violação de direitos. Com documentação adequada e orientação jurídica apropriada, as chances de êxito em eventual ação são favoráveis. A existência de provas robustas é fundamental para consolidar o direito.\n\n';
  } else if (totalScore >= 40) {
    assessment += 'MÉDIA\n\n';
    assessment += 'O caso apresenta elementos que justificam análise jurídica mais aprofundada. As chances de êxito dependem da qualidade das provas disponíveis e da estratégia adotada. Uma avaliação detalhada por advogado é essencial para determinar a viabilidade.\n\n';
  } else {
    assessment += 'BAIXA A MÉDIA\n\n';
    assessment += 'Com base nas informações fornecidas, o caso pode não configurar violação significativa de direitos ou pode apresentar dificuldades probatórias. Uma consulta jurídica permitirá avaliar nuances não capturadas neste questionário.\n\n';
  }

  // 🎯 ESPAÇO PUBLICITÁRIO 3 - Após Chances de Êxito
  assessment += '[ESPAÇO_PUBLICITARIO_3]\n\n';

  // Estimated costs
  assessment += 'CUSTOS ESTIMADOS: ';
  if (area.id === 'trabalhista') {
    assessment += 'BAIXO A MÉDIO\n\n';
    assessment += 'Na Justiça do Trabalho, o trabalhador que recebe até dois salários mínimos ou declara insuficiência econômica tem direito à gratuidade de justiça. Honorários advocatícios podem ser baseados em percentual do valor obtido (êxito). Não há custas iniciais para ajuizar ação trabalhista.\n\n';
  } else if (area.id === 'consumidor') {
    assessment += 'BAIXO\n\n';
    assessment += 'Causas de até 20 salários mínimos podem ser propostas no Juizado Especial Cível sem necessidade de advogado e sem custas iniciais (se não houver recurso). Para valores maiores ou maior complexidade, os custos variam conforme o profissional contratado.\n\n';
  } else {
    assessment += 'MÉDIO\n\n';
    assessment += 'Os custos variam conforme a complexidade do caso e a necessidade de perícias ou outros procedimentos. A assistência da Defensoria Pública é gratuita para quem não pode arcar com advogado particular.\n\n';
  }

  // Estimated time
  assessment += 'TEMPO MÉDIO DE SOLUÇÃO: ';
  if (area.id === 'trabalhista') {
    assessment += '6 a 18 MESES\n\n';
    assessment += 'Processos trabalhistas em 1ª instância costumam durar entre 6 meses e 1 ano em média, podendo se estender se houver recursos. Acordos podem resolver o caso em semanas ou poucos meses.\n\n';
  } else if (area.id === 'consumidor') {
    assessment += '3 a 12 MESES\n\n';
    assessment += 'No Juizado Especial Cível, processos costumam ser mais céleres (3 a 6 meses). Na justiça comum, pode levar de 1 a 2 anos. Soluções administrativas (Procon) podem ocorrer em 30 a 60 dias.\n\n';
  } else {
    assessment += '12 a 36 MESES\n\n';
    assessment += 'Ações previdenciárias podem ser mais demoradas, especialmente se houver necessidade de perícia médica. Recursos administrativos no INSS levam de 90 a 180 dias. Processos judiciais podem durar de 1 a 3 anos.\n\n';
  }

  // Risks and benefits
  assessment += 'RISCOS E BENEFÍCIOS:\n\n';
  assessment += 'Benefícios:\n';
  assessment += '• Reconhecimento e reparação de direitos violados\n';
  assessment += '• Possibilidade de recebimento de valores retroativos\n';
  assessment += '• Efeito pedagógico e inibitório de novas violações\n';
  assessment += '• Acesso à justiça e efetivação de direitos fundamentais\n\n';

  assessment += 'Riscos:\n';
  assessment += '• Possibilidade de improcedência se não houver provas suficientes\n';
  assessment += '• Tempo de tramitação do processo\n';
  assessment += '• Desgaste emocional inerente a processos judiciais\n';
  assessment += '• Necessidade de acompanhamento processual constante\n\n';

  assessment += 'A relação custo-benefício deve ser avaliada individualmente com advogado, considerando as particularidades do caso, as provas disponíveis e os valores envolvidos.\n';

  return assessment;
}

function generateConclusion(area: LegalArea, urgencyLevel: string): string {
  let conclusion = '';

  if (urgencyLevel === 'high') {
    conclusion += 'Com base na análise realizada, sua situação apresenta elementos que merecem atenção jurídica IMEDIATA. ';
    conclusion += 'Os indícios de violação de direitos identificados justificam a busca de orientação profissional o quanto antes, ';
    conclusion += 'especialmente considerando os prazos prescricionais que podem limitar o exercício de seus direitos.\n\n';
  } else if (urgencyLevel === 'medium') {
    conclusion += 'Sua situação apresenta aspectos que recomendam a busca de orientação jurídica em breve. ';
    conclusion += 'Embora não haja urgência extrema, é importante não postergar a consulta a um advogado especializado, ';
    conclusion += 'pois a passagem do tempo pode prejudicar a produção de provas ou até mesmo o próprio direito de ação.\n\n';
  } else {
    conclusion += 'Com base nas informações fornecidas, sua situação não aparenta gravidade imediata, mas merece acompanhamento. ';
    conclusion += 'Recomenda-se manter a documentação organizada e, na dúvida, consultar um advogado para esclarecimentos preventivos.\n\n';
  }

  conclusion += 'RECOMENDAÇÃO PROFISSIONAL:\n\n';
  conclusion += 'Este diagnóstico preliminar tem caráter orientativo e educacional, baseando-se em análise automatizada ';
  conclusion += 'das respostas fornecidas. Cada caso concreto possui particularidades que somente podem ser adequadamente ';
  conclusion += 'avaliadas por profissional habilitado, mediante análise detalhada de toda documentação e contextualização completa dos fatos.\n\n';

  conclusion += 'Um advogado especializado em ' + area.name + ' poderá:\n';
  conclusion += '• Analisar detalhadamente toda a documentação disponível\n';
  conclusion += '• Identificar todos os direitos aplicáveis à sua situação específica\n';
  conclusion += '• Orientar sobre a melhor estratégia jurídica a ser adotada\n';
  conclusion += '• Representá-lo perante órgãos administrativos e judiciais\n';
  conclusion += '• Acompanhar todo o procedimento até a solução final\n\n';

  // 🎯 ESPAÇO PUBLICITÁRIO 4 - Após Recomendação Profissional
  conclusion += '[ESPAÇO_PUBLICITARIO_4]\n\n';

  conclusion += 'CONSIDERAÇÕES FINAIS:\n\n';
  conclusion += 'A busca pela efetivação de direitos é um caminho legítimo e amparado pela Constituição Federal. ';
  conclusion += 'Agir com conhecimento, documentação organizada e orientação profissional adequada aumenta significativamente ';
  conclusion += 'as chances de êxito e reduz os riscos e custos envolvidos.\n\n';

  conclusion += 'Mantenha-se informado sobre seus direitos, preserve todas as provas e documentos relevantes, ';
  conclusion += 'e não hesite em buscar orientação jurídica quando necessário. A prevenção e a ação tempestiva ';
  conclusion += 'são os melhores aliados na defesa de seus interesses.\n\n';

  conclusion += 'Lembre-se: este relatório não substitui consulta com advogado e não constitui parecer jurídico formal. ';
  conclusion += 'Para uma avaliação precisa e confiável, procure sempre um profissional qualificado e devidamente inscrito na OAB.\n';

  return conclusion;
}

/**
 * Export the system prompt for external use if needed
 */
export { ANALYSIS_SYSTEM_PROMPT };
