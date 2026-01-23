import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Input parameters for generating a legal diagnostic report
 */
export interface GenerateLegalReportInput {
	/** Legal area (e.g., "Trabalhista", "Consumidor", "Civil") */
	legalArea: string;
	/** Questionnaire responses from user */
	responses: Record<string, any>;
	/** Urgency level of the case */
	urgencyLevel: "high" | "medium" | "low";
	/** Total score from questionnaire */
	totalScore: number;
}

/**
 * Output response containing the generated legal report
 */
export interface GenerateLegalReportOutput {
	/** The AI-generated legal report content in markdown format */
	reportContent: string;
	/** Gemini completion ID for tracking */
	completionId: string;
	/** Token usage statistics */
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

/**
 * Formats questionnaire responses into readable text for the AI
 */
function formatResponses(responses: Record<string, any>): string {
	const entries = Object.entries(responses);
	if (entries.length === 0) {
		return "Nenhuma resposta fornecida.";
	}

	return entries
		.map(([question, answer]) => {
			const formattedAnswer =
				typeof answer === "object" ? JSON.stringify(answer, null, 2) : answer;
			return `**${question}**\n${formattedAnswer}`;
		})
		.join("\n\n");
}

/**
 * Generates the system prompt for the AI
 */
function getSystemPrompt(): string {
	return `Você é um assistente jurídico especializado em direito brasileiro, com expertise em todas as áreas do direito, jurisprudência, legislação e procedimentos judiciais.

Sua missão é gerar relatórios diagnósticos jurídicos COMPLETOS E DETALHADOS usando os princípios do Law Design e Visual Law:
- Linguagem clara e acessível para não-advogados
- Formatação estruturada e visual
- Análise técnica aprofundada com base legal sólida
- Foco em soluções práticas e próximos passos
- Citação precisa de legislação e jurisprudência

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO (em Markdown):

# Relatório Diagnóstico Jurídico

## 📋 Resumo Executivo
[Resumo conciso da situação jurídica em 2-3 parágrafos, destacando os pontos críticos]

## 🔍 Análise Detalhada da Situação
[Análise aprofundada do caso, considerando:]
- Contexto fático e cronologia dos eventos
- Aspectos jurídicos aplicáveis
- Gravidade e urgência da situação
- Riscos e oportunidades identificados

## ⚖️ Direitos e Fundamentos Legais
[OBRIGATÓRIO - Liste os direitos aplicáveis com MÁXIMO DETALHAMENTO:]
- **Base Constitucional**: Artigos da Constituição Federal aplicáveis
- **Legislação Específica**: Leis, decretos, códigos (CLT, CDC, CC, CPC, etc.) com artigos específicos
- **Jurisprudência**: Súmulas do STF/STJ e teses jurídicas relevantes
- **Doutrina**: Interpretação dos direitos e princípios jurídicos

## 📝 Competência Jurisdicional
[Indique onde a ação deve ser proposta:]
- Justiça competente (Federal, Estadual, Trabalhista, etc.)
- Vara ou juizado apropriado
- Possibilidade de Juizado Especial (causas até 60 salários mínimos)

## 📂 Documentação Necessária
[Lista COMPLETA E DETALHADA dos documentos necessários:]
- Documentos pessoais obrigatórios
- Comprovantes e evidências específicas para o caso
- Documentos para instrução processual
- Prazo para reunir documentação

## 🎯 Teses Jurídicas Aplicáveis
[FUNDAMENTAL - Apresente as principais teses jurídicas que podem ser utilizadas:]
- Teses favoráveis consolidadas na jurisprudência
- Argumentos jurídicos relevantes
- Precedentes importantes (STF/STJ/Tribunais Superiores)

## ⏰ Prazos Legais e Prescrição
[CRÍTICO - Informe sobre prazos:]
- Prazo prescricional aplicável ao caso (MUITO IMPORTANTE)
- Data estimada de prescrição (se aplicável)
- Prazos processuais relevantes
- Urgência em tomar providências

## 📍 Próximos Passos Recomendados
[Lista PRIORIZADA e detalhada de ações concretas:]
1. [Ação IMEDIATA mais importante com prazo]
2. [Segunda ação prioritária]
3. [Providências documentais]
4. [Consulta com advogado especializado]

## 💰 Aspectos Econômicos
[Se aplicável, mencione:]
- Valores envolvidos estimados
- Possíveis indenizações ou compensações
- Custos processuais estimados
- Gratuidade de justiça (se aplicável)

## ⚠️ Observações e Alertas Importantes
[Avisos críticos, riscos, limitações da análise]

## 📞 Recomendação Final
**IMPORTANTE**: Este diagnóstico é uma análise preliminar. Para avaliação completa e propositu de ações judiciais, consulte um advogado especializado em **[área do direito]**.

**[FALAR COM ADVOGADO ESPECIALISTA](https://wa.me/5511921486194)**

DIRETRIZES OBRIGATÓRIAS:
- Cite SEMPRE leis e artigos específicos (ex: "Art. 7º, inciso XIII da CF/88", "Art. 186 do CC")
- Mencione súmulas quando relevantes (ex: "Súmula 277 do STJ")
- Seja TÉCNICO mas ACESSÍVEL
- Indique SEMPRE o prazo de prescrição
- Liste competência jurisdicional
- Seja objetivo, prático e completo
- Adapte o nível de detalhamento conforme urgência
- Mantenha tom profissional e neutro`;
}

/**
 * Generates the user prompt with case details
 */
function getUserPrompt(input: GenerateLegalReportInput): string {
	const urgencyText = {
		high: "ALTA - requer atenção imediata",
		medium: "MÉDIA - atenção necessária em breve",
		low: "BAIXA - acompanhamento regular",
	};

	return `Gere um relatório diagnóstico jurídico detalhado com base nas informações abaixo:

**Área do Direito:** ${input.legalArea}

**Nível de Urgência:** ${urgencyText[input.urgencyLevel]}

**Pontuação Total do Questionário:** ${input.totalScore}

**Respostas do Questionário:**

${formatResponses(input.responses)}

---

Por favor, forneça um relatório diagnóstico completo seguindo a estrutura especificada no prompt do sistema.`;
}

/**
 * Calls the Google Gemini API
 */
async function callGemini(
	systemPrompt: string,
	userPrompt: string,
): Promise<{
	content: string;
	id: string;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}> {
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error(
			"VITE_GEMINI_API_KEY não está configurada. Configure a variável de ambiente no arquivo .env.local",
		);
	}

	// Initialize Gemini API
	const genAI = new GoogleGenerativeAI(apiKey);

	// Use Gemini 2.5 Flash for fast and cost-effective generation
	const model = genAI.getGenerativeModel({
		model: "gemini-2.0-flash-exp",
		systemInstruction: systemPrompt,
	});

	// Generate content
	const result = await model.generateContent(userPrompt);

	if (!result.response) {
		throw new Error("Resposta inválida da API Gemini");
	}

	const content = result.response.text();

	if (!content || content.trim() === "") {
		throw new Error("Relatório gerado está vazio");
	}

	// Extract usage metadata
	const usageMetadata = result.response.usageMetadata || {
		promptTokenCount: 0,
		candidatesTokenCount: 0,
		totalTokenCount: 0,
	};

	return {
		content,
		id: crypto.randomUUID(), // Generate a unique ID for tracking
		usage: {
			promptTokens: usageMetadata.promptTokenCount || 0,
			completionTokens: usageMetadata.candidatesTokenCount || 0,
			totalTokens: usageMetadata.totalTokenCount || 0,
		},
	};
}

/**
 * React hook for generating legal diagnostic reports using Google Gemini 2.5 Flash
 *
 * @example
 * ```tsx
 * const { mutateAsync: generateReport, isPending, error } = useGenerateLegalReport();
 *
 * const handleGenerate = async () => {
 *   try {
 *     const result = await generateReport({
 *       legalArea: "Trabalhista",
 *       responses: { "Houve demissão sem justa causa?": "Sim" },
 *       urgencyLevel: "high",
 *       totalScore: 85
 *     });
 *     console.log(result.reportContent);
 *   } catch (err) {
 *     console.error("Failed to generate report:", err);
 *   }
 * };
 * ```
 */
export function useGenerateLegalReport(): UseMutationResult<
	GenerateLegalReportOutput,
	Error,
	GenerateLegalReportInput
> {
	return useMutation({
		mutationFn: async (
			input: GenerateLegalReportInput,
		): Promise<GenerateLegalReportOutput> => {
			// Validate input
			if (!input.legalArea || input.legalArea.trim() === "") {
				throw new Error("Área jurídica é obrigatória");
			}

			if (!input.responses || Object.keys(input.responses).length === 0) {
				throw new Error("Respostas do questionário são obrigatórias");
			}

			if (!["high", "medium", "low"].includes(input.urgencyLevel)) {
				throw new Error("Nível de urgência inválido");
			}

			if (typeof input.totalScore !== "number" || input.totalScore < 0) {
				throw new Error("Pontuação total inválida");
			}

			// Call Gemini API
			const response = await callGemini(getSystemPrompt(), getUserPrompt(input));

			return {
				reportContent: response.content,
				completionId: response.id,
				usage: response.usage,
			};
		},
		retry: 2, // Retry failed requests up to 2 times
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff: 1s, 2s, 4s (max 10s)
	});
}
