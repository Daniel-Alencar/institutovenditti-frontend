/**
 * Visual Law / Law Design Color Palette
 *
 * This color system follows Visual Law principles:
 * - Professional and trustworthy institutional colors
 * - Clear hierarchy and contrast
 * - Accessible and readable
 * - Aligned with legal/juridical aesthetics
 */

export const visualLawColors = {
  // Primary - Institutional Blue (trust, professionalism, law)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#1E40AF',  // Main blue
    700: '#1E3A8A',
    800: '#1E3A8A',
    900: '#172554',
  },

  // Secondary - Legal Green (growth, rights, justice)
  secondary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',  // Main green
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Accent - Orange (attention, urgency, call-to-action)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',  // Main orange
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Neutral - Sophisticated grays (readability, balance)
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',  // Main dark text
  },

  // Status colors
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#065F46',
  },

  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#92400E',
  },

  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#991B1B',
  },

  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1E3A8A',
  },
} as const;

/**
 * Urgency level colors mapping
 */
export const urgencyColors = {
  high: visualLawColors.error.main,
  medium: visualLawColors.warning.main,
  low: visualLawColors.success.main,
} as const;

/**
 * Legal area color mapping
 * Assigns specific colors to different legal areas for visual distinction
 */
export const legalAreaColors = {
  trabalhista: visualLawColors.primary[600],
  consumidor: visualLawColors.secondary[600],
  previdenciario: visualLawColors.accent[600],
  civil: visualLawColors.primary[700],
  familia: visualLawColors.secondary[500],
  saude: visualLawColors.error.main,
  imobiliario: visualLawColors.accent[500],
  transito: visualLawColors.warning.main,
  bancario: visualLawColors.primary[500],
  golpes: visualLawColors.error.dark,
  outros: visualLawColors.neutral[600],
} as const;

/**
 * Tailwind CSS class utilities for Visual Law colors
 */
export const visualLawClasses = {
  // Backgrounds
  bg: {
    primary: 'bg-[#1E40AF]',
    secondary: 'bg-[#059669]',
    accent: 'bg-[#EA580C]',
    light: 'bg-[#F4F4F5]',
    white: 'bg-white',
  },

  // Text colors
  text: {
    primary: 'text-[#1E40AF]',
    secondary: 'text-[#059669]',
    accent: 'text-[#EA580C]',
    dark: 'text-[#18181B]',
    light: 'text-[#52525B]',
    white: 'text-white',
  },

  // Border colors
  border: {
    primary: 'border-[#1E40AF]',
    secondary: 'border-[#059669]',
    accent: 'border-[#EA580C]',
    light: 'border-[#E4E4E7]',
  },

  // Button variants
  button: {
    primary: 'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white',
    secondary: 'bg-[#059669] hover:bg-[#047857] text-white',
    accent: 'bg-[#EA580C] hover:bg-[#C2410C] text-white',
    outline: 'border-2 border-[#1E40AF] text-[#1E40AF] hover:bg-[#EFF6FF]',
  },
} as const;
