/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions
export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string;
          image_url: string;
          valid_from: string;
          valid_to: string;
          website_url: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          valid_from: string;
          valid_to: string;
          website_url?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          valid_from?: string;
          valid_to?: string;
          website_url?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          whatsapp: string;
          legal_area: string;
          responses: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          whatsapp: string;
          legal_area: string;
          responses?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          whatsapp?: string;
          legal_area?: string;
          responses?: any;
          created_at?: string;
        };
      };
      diagnostics: {
        Row: {
          id: string;
          user_id: string;
          area: any;
          responses: any;
          user_data: any;
          total_score: number;
          urgency_level: 'low' | 'medium' | 'high';
          ai_report: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          area: any;
          responses: any;
          user_data: any;
          total_score: number;
          urgency_level: 'low' | 'medium' | 'high';
          ai_report: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          area?: any;
          responses?: any;
          user_data?: any;
          total_score?: number;
          urgency_level?: 'low' | 'medium' | 'high';
          ai_report?: string;
          created_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_name: string;
          referrer_email: string;
          referrer_whatsapp: string;
          referred_name: string;
          referred_whatsapp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_name: string;
          referrer_email: string;
          referrer_whatsapp: string;
          referred_name: string;
          referred_whatsapp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_name?: string;
          referrer_email?: string;
          referrer_whatsapp?: string;
          referred_name?: string;
          referred_whatsapp?: string;
          created_at?: string;
        };
      };
      terms: {
        Row: {
          id: string;
          type: 'terms_of_use' | 'lgpd_terms';
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'terms_of_use' | 'lgpd_terms';
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'terms_of_use' | 'lgpd_terms';
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          date: string;
          access_count: number;
          questionnaire_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          access_count?: number;
          questionnaire_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          access_count?: number;
          questionnaire_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_summary: {
        Row: {
          id: string;
          total_accesses: number;
          total_questionnaires: number;
          total_users: number;
          area_distribution: any;
          updated_at: string;
        };
        Insert: {
          id?: string;
          total_accesses?: number;
          total_questionnaires?: number;
          total_users?: number;
          area_distribution?: any;
          updated_at?: string;
        };
        Update: {
          id?: string;
          total_accesses?: number;
          total_questionnaires?: number;
          total_users?: number;
          area_distribution?: any;
          updated_at?: string;
        };
      };
    };
  };
}
