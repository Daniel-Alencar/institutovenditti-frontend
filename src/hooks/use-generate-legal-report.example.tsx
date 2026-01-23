/**
 * Example usage of useGenerateLegalReport hook
 *
 * This file demonstrates how to integrate the legal report generation
 * hook into a React component.
 */

import { useState } from "react";
import { useGenerateLegalReport, type GenerateLegalReportInput } from "./use-generate-legal-report";

export function LegalReportGenerator() {
	const [reportContent, setReportContent] = useState<string>("");

	// Initialize the mutation hook
	const { mutateAsync: generateReport, isPending, error } = useGenerateLegalReport();

	const handleGenerateReport = async () => {
		try {
			// Prepare input data
			const input: GenerateLegalReportInput = {
				legalArea: "Trabalhista",
				responses: {
					"Houve demissão sem justa causa?": "Sim",
					"Qual foi o período de trabalho?": "3 anos e 2 meses",
					"Recebeu verbas rescisórias?": "Parcialmente",
					"Tinha carteira assinada?": "Sim",
					"Houve aviso prévio?": "Não",
				},
				urgencyLevel: "high",
				totalScore: 85,
			};

			// Call the API
			const result = await generateReport(input);

			// Handle success
			setReportContent(result.reportContent);
			console.log("Report generated successfully!");
			console.log("Completion ID:", result.completionId);
			console.log("Tokens used:", result.usage.totalTokens);
		} catch (err) {
			// Error is automatically handled by the hook
			console.error("Failed to generate report:", err);
		}
	};

	return (
		<div className="space-y-4 p-6">
			<h1 className="text-2xl font-bold">Gerador de Relatório Jurídico</h1>

			<button
				onClick={handleGenerateReport}
				disabled={isPending}
				className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
			>
				{isPending ? "Gerando relatório..." : "Gerar Relatório"}
			</button>

			{error && (
				<div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
					<strong>Erro:</strong> {error.message}
				</div>
			)}

			{reportContent && (
				<div className="p-4 bg-white border rounded">
					<h2 className="text-xl font-semibold mb-2">Relatório Gerado:</h2>
					<div className="prose max-w-none">
						{/* In a real app, you'd use a markdown renderer here */}
						<pre className="whitespace-pre-wrap">{reportContent}</pre>
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * Example with form integration
 */
export function LegalReportForm() {
	const [formData, setFormData] = useState<GenerateLegalReportInput>({
		legalArea: "Consumidor",
		responses: {},
		urgencyLevel: "medium",
		totalScore: 0,
	});

	const { mutate: generateReport, isPending, data, error } = useGenerateLegalReport();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		generateReport(formData, {
			onSuccess: (result) => {
				console.log("Report generated!", result.completionId);
				// You can add additional success handling here
			},
			onError: (error) => {
				console.error("Generation failed:", error);
				// You can add additional error handling here
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 p-6">
			<div>
				<label className="block text-sm font-medium mb-1">
					Área Jurídica
				</label>
				<input
					type="text"
					value={formData.legalArea}
					onChange={(e) => setFormData({ ...formData, legalArea: e.target.value })}
					className="w-full px-3 py-2 border rounded"
					required
				/>
			</div>

			<div>
				<label className="block text-sm font-medium mb-1">
					Nível de Urgência
				</label>
				<select
					value={formData.urgencyLevel}
					onChange={(e) =>
						setFormData({
							...formData,
							urgencyLevel: e.target.value as "high" | "medium" | "low"
						})
					}
					className="w-full px-3 py-2 border rounded"
				>
					<option value="low">Baixa</option>
					<option value="medium">Média</option>
					<option value="high">Alta</option>
				</select>
			</div>

			<button
				type="submit"
				disabled={isPending}
				className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
			>
				{isPending ? "Gerando..." : "Gerar Relatório"}
			</button>

			{error && (
				<div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
					{error.message}
				</div>
			)}

			{data && (
				<div className="p-4 bg-green-50 border border-green-200 rounded">
					<p className="font-semibold">Relatório gerado com sucesso!</p>
					<p className="text-sm text-gray-600">
						Tokens utilizados: {data.usage.totalTokens}
					</p>
				</div>
			)}
		</form>
	);
}
