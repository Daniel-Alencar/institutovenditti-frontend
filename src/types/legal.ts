// Legal Diagnostic System Types

export type QuestionType = 'radio' | 'checkbox' | 'textarea';

export type UrgencyLevel = 'high' | 'medium' | 'low';

export interface QuestionOption {
  label: string;
  value: string;
  points: number;
}

export interface Question {
  id: string;
  text: string;
  note?: string;
  type: QuestionType;
  options?: QuestionOption[];
  weight: number; // multiplier for scoring
}

export type LegalAreaType = 'common' | 'special';

export interface LegalArea {
  id: string;
  name: string;
  type: LegalAreaType;
  description: string;
  icon: string; // lucide-react icon name
  questions: Question[];
}

export interface QuestionnaireResponse {
  questionId: string;
  answer: string | string[]; // single value or multiple for checkboxes
}

export interface DiagnosticScore {
  totalPoints: number;
  urgencyLevel: UrgencyLevel;
}

export interface UserData {
  fullName: string;
  city: string;
  state: string;
  email: string;
  whatsapp: string;
  referralName: string;
  referralWhatsapp: string;
}

export interface DiagnosticReport {
  areaId: string;
  areaName: string;
  responses: QuestionnaireResponse[];
  score: DiagnosticScore;
  userData: UserData;
  aiAnalysis: string; // Markdown format
  generatedAt: Date;
}

export interface Advertisement {
  id: string;
  advertiserName: string;
  validFrom: Date;
  validTo: Date;
  bannerUrl: string;
  websiteUrl?: string;
  socialMediaUrl?: string;
  videoUrl?: string;
  position: 1 | 2 | 3 | 4; // top, middle1, middle2, bottom
}
