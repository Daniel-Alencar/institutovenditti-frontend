import { type Question } from '@/types/legal';

/**
 * Common questions that should be added to ALL questionnaires
 */

// Question about existing lawyer/process
export const lawyerProcessQuestion = (areaPrefix: string): Question => ({
  id: `${areaPrefix}_lawyer`,
  text: 'Você já tem advogado contratado ou processo em andamento sobre este assunto?',
  type: 'radio',
  weight: 1,
  options: [
    { label: 'Sim, já tenho advogado contratado', value: 'tem_advogado', points: 5 },
    { label: 'Sim, já tenho processo em andamento', value: 'tem_processo', points: 10 },
    { label: 'Sim, tenho ambos', value: 'tem_ambos', points: 10 },
    { label: 'Não', value: 'nao', points: 0 },
  ],
});

// Narrative question (last question in all questionnaires)
export const narrativeQuestion = (areaPrefix: string): Question => ({
  id: `${areaPrefix}_narrative`,
  text: 'Descreva sua situação com suas próprias palavras. Inclua todos os detalhes que considerar importantes:',
  type: 'textarea',
  weight: 0, // No points, just qualitative data
});
