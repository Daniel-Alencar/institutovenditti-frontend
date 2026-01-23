# useGenerateLegalReport Hook

Production-ready React hook for generating legal diagnostic reports using **Google Gemini 2.5 Flash** API.

## Overview

This hook provides a type-safe interface for generating Brazilian legal diagnostic reports with proper error handling, retry logic, and token usage tracking. It uses TanStack Query (React Query) for optimal state management and caching.

## Features

- ✅ **Full TypeScript support** with comprehensive type definitions
- ✅ **Google Gemini 2.5 Flash** - Ultra-fast and cost-effective AI
- ✅ **Automatic retry logic** with exponential backoff (2 retries)
- ✅ **Input validation** for all required parameters
- ✅ **Error handling** with descriptive error messages
- ✅ **Token usage tracking** for cost monitoring
- ✅ **Law Design formatting** with structured markdown output
- ✅ **Portuguese language** optimized for Brazilian legal system

## Installation

This hook is already included in the project. No additional installation needed.

### Required Dependencies

- `@tanstack/react-query` (already installed)
- `@google/generative-ai` (already installed)
- Gemini API key (configure in `.env.local`)

## Configuration

### 1. Set up your Gemini API Key

Create or update `.env.local` in the project root:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

Get your **FREE** API key from: https://aistudio.google.com/app/apikey

### 2. Ensure TanStack Query is configured

The hook requires a `QueryClient` to be provided in your app. This is already set up in `src/main.tsx`.

## Usage

### Basic Example

```typescript
import { useGenerateLegalReport } from '@/hooks/use-generate-legal-report';

function MyComponent() {
  const { mutateAsync: generateReport, isPending, error } = useGenerateLegalReport();

  const handleGenerate = async () => {
    try {
      const result = await generateReport({
        legalArea: "Trabalhista",
        responses: {
          "Houve demissão sem justa causa?": "Sim",
          "Qual foi o período de trabalho?": "3 anos"
        },
        urgencyLevel: "high",
        totalScore: 85
      });

      console.log(result.reportContent); // Markdown-formatted report
      console.log(result.usage.totalTokens); // Token usage for monitoring
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={isPending}>
      {isPending ? "Generating..." : "Generate Report"}
    </button>
  );
}
```

### With Callbacks

```typescript
const { mutate: generateReport } = useGenerateLegalReport();

const handleClick = () => {
  generateReport(
    {
      legalArea: "Consumidor",
      responses: { /* ... */ },
      urgencyLevel: "medium",
      totalScore: 70
    },
    {
      onSuccess: (data) => {
        console.log("Report generated!", data.completionId);
        // Save to database, show in UI, etc.
      },
      onError: (error) => {
        console.error("Generation failed:", error.message);
        // Show error toast, log to monitoring, etc.
      }
    }
  );
};
```

## API Reference

### Input Type: `GenerateLegalReportInput`

```typescript
interface GenerateLegalReportInput {
  legalArea: string;              // e.g., "Trabalhista", "Consumidor", "Civil"
  responses: Record<string, any>; // Questionnaire answers
  urgencyLevel: "high" | "medium" | "low";
  totalScore: number;             // Questionnaire score (0-100)
}
```

### Output Type: `GenerateLegalReportOutput`

```typescript
interface GenerateLegalReportOutput {
  reportContent: string;  // Markdown-formatted legal report
  completionId: string;   // Gemini completion ID for tracking
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;  // For monitoring
  };
}
```

### Return Type

```typescript
UseMutationResult<
  GenerateLegalReportOutput,  // Success data type
  Error,                      // Error type
  GenerateLegalReportInput    // Input variables type
>
```

**Properties:**
- `mutate` - Trigger mutation with callbacks
- `mutateAsync` - Trigger mutation with promises
- `isPending` - Loading state
- `isError` - Error state
- `error` - Error object (if failed)
- `data` - Result data (if successful)
- `reset` - Reset mutation state

## Report Structure

Generated reports follow Law Design principles with this structure:

```markdown
# Relatório Diagnóstico Jurídico

## 📋 Resumo Executivo
[Concise 2-3 paragraph summary]

## 🔍 Análise Detalhada da Situação
[In-depth analysis with context and legal aspects]

## ⚖️ Direitos e Fundamentos Legais
[Applicable rights with legal references and articles]

## 📝 Competência Jurisdicional
[Where to file the case]

## 📂 Documentação Necessária
[Required documents list]

## 🎯 Teses Jurídicas Aplicáveis
[Legal theses and precedents]

## ⏰ Prazos Legais e Prescrição
[Deadlines and statute of limitations]

## 📍 Próximos Passos Recomendados
[Prioritized action items]

## 💰 Aspectos Econômicos
[Costs and potential compensation]

## ⚠️ Observações Importantes
[Critical warnings and considerations]

## 📞 Recomendação Final
[Final recommendation with contact]
```

## Error Handling

The hook validates input and provides descriptive error messages:

```typescript
// Missing legal area
Error: "Área jurídica é obrigatória"

// Empty responses
Error: "Respostas do questionário são obrigatórias"

// Invalid urgency level
Error: "Nível de urgência inválido"

// Missing API key
Error: "VITE_GEMINI_API_KEY não está configurada..."

// Gemini API errors
Error: "Resposta inválida da API Gemini"
```

## Retry Logic

- **Retries:** 2 attempts on failure
- **Backoff:** Exponential (1s, 2s, 4s, max 10s)
- **Configurable:** Modify `retry` and `retryDelay` in hook

## Performance & Cost

### Why Gemini 2.5 Flash?

- ⚡ **Ultra-fast:** 2-5 second response times
- 💰 **Cost-effective:** Much cheaper than GPT-4
- 📊 **Large context:** 1 million token window
- 🆓 **Generous free tier:** 1500 requests/day
- 🎯 **High quality:** Excellent for legal analysis

### Token Usage Monitoring

Track token usage for monitoring:

```typescript
const result = await generateReport(input);

console.log(`Tokens used: ${result.usage.totalTokens}`);
console.log(`Prompt: ${result.usage.promptTokens}`);
console.log(`Completion: ${result.usage.completionTokens}`);

// Average usage: ~2500-3500 tokens per report
```

## Migration from OpenAI

### What Changed

- ✅ API provider: OpenAI → Google Gemini
- ✅ Environment variable: `VITE_OPENAI_API_KEY` → `VITE_GEMINI_API_KEY`
- ✅ Model: `gpt-4` → `gemini-2.0-flash-exp`
- ✅ Better cost efficiency and faster responses

### What Stayed the Same

- ✅ Hook interface remains identical
- ✅ Input/output types unchanged
- ✅ Report structure and quality maintained
- ✅ Error handling behavior consistent

### Migration Steps

1. Get Gemini API key from https://aistudio.google.com/app/apikey
2. Replace `VITE_OPENAI_API_KEY` with `VITE_GEMINI_API_KEY` in `.env.local`
3. No code changes needed - hook interface is identical!

## Troubleshooting

### "VITE_GEMINI_API_KEY não está configurada"

**Solution:** Add your Gemini API key to `.env.local`:

```env
VITE_GEMINI_API_KEY=your-actual-api-key
```

Restart your development server after adding the key.

### Rate limit errors

**Solution:** Gemini has generous limits (1500 req/day free tier). For production, consider upgrading or implementing request throttling.

### Empty report content

**Solution:** Check that your responses contain meaningful data. The AI needs sufficient context to generate a report.

## Security Best Practices

1. **Never commit API keys** - Use `.env.local` (already in `.gitignore`)
2. **Validate user input** - The hook validates, but add UI validation too
3. **Monitor usage** - Track token usage to stay within quotas
4. **Rate limiting** - Consider adding request throttling in production
5. **Error logging** - Log errors to monitoring service (Sentry, etc.)

## Performance Tips

1. **Debounce requests** - Don't trigger on every keystroke
2. **Cache results** - Use React Query's caching (already enabled)
3. **Show progress** - Use `isPending` to show loading states
4. **Optimize prompts** - Shorter prompts = fewer tokens = faster responses

## Support

For issues or questions:
1. Check this documentation
2. Verify your API key is correctly configured
3. Check Google AI status: https://ai.google.dev/
4. Review Gemini API documentation: https://ai.google.dev/docs

## License

This hook is part of the vite-template project. See project LICENSE for details.
