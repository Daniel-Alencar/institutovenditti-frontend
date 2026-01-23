import { type DiagnosticScore, type Question, type QuestionnaireResponse, type UrgencyLevel } from '@/types/legal';

export function calculateScore(
  questions: Question[],
  responses: QuestionnaireResponse[]
): DiagnosticScore {
  let totalPoints = 0;

  responses.forEach((response) => {
    const question = questions.find((q) => q.id === response.questionId);
    if (!question) return;

    if (question.type === 'checkbox' && Array.isArray(response.answer)) {
      // For checkboxes, sum up points for all selected options
      response.answer.forEach((selectedValue) => {
        const option = question.options?.find((opt) => opt.value === selectedValue);
        if (option) {
          totalPoints += option.points * question.weight;
        }
      });
    } else if (question.type === 'radio' && typeof response.answer === 'string') {
      // For radio buttons, add points for the selected option
      const option = question.options?.find((opt) => opt.value === response.answer);
      if (option) {
        totalPoints += option.points * question.weight;
      }
    }
    // For textarea, we don't add points (just qualitative data)
  });

  const urgencyLevel = getUrgencyLevel(totalPoints);

  return {
    totalPoints,
    urgencyLevel,
  };
}

export function getUrgencyLevel(points: number): UrgencyLevel {
  if (points >= 70) return 'high';
  if (points >= 40) return 'medium';
  return 'low';
}

export function getUrgencyColor(level: UrgencyLevel): string {
  switch (level) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
  }
}

export function getUrgencyLabel(level: UrgencyLevel): string {
  switch (level) {
    case 'high':
      return 'Alta Urgência';
    case 'medium':
      return 'Média Urgência';
    case 'low':
      return 'Baixa Urgência';
  }
}

export function formatWhatsApp(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (DDD) XXXXX-XXXX or (DDD) XXXX-XXXX (without leading 0 in DDD)
  if (cleaned.length === 11) {
    const ddd = cleaned.slice(0, 2);
    return `(${ddd}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    const ddd = cleaned.slice(0, 2);
    return `(${ddd}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

export function formatWhatsAppInput(value: string): string {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');

  // Limit to 11 digits
  const limited = cleaned.slice(0, 11);

  // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX while typing
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 7) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  } else if (limited.length <= 11) {
    const isNineDigit = limited.length === 11;
    if (isNineDigit) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    }
  }

  return limited;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateWhatsApp(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}
