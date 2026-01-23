/**
 * Data Service - Centralized data persistence layer with Supabase
 *
 * This service handles all data storage operations for the application.
 * Uses Supabase for production-ready database persistence.
 */

import { type LegalArea, type QuestionnaireResponse, type UserData } from '@/types/legal';
import { supabase } from './supabase';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Announcement {
  id: string;
  imageUrl: string;
  validFrom: string;
  validTo: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  position: 1 | 2 | 3 | 4;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticRecord {
  id: string;
  userId: string;
  area: LegalArea;
  responses: QuestionnaireResponse[];
  userData: UserData;
  totalScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  aiReport: string;
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referrerWhatsapp: string;
  referredName: string;
  referredWhatsapp: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  legalArea: string;
  responses: QuestionnaireResponse[];
  createdAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert database snake_case to camelCase
function toCamelCase<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  
  return obj;
}

// Convert camelCase to database snake_case
function toSnakeCase<T>(obj: any): T {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  
  return obj;
}

// ============================================================================
// ANNOUNCEMENTS SERVICE
// ============================================================================

export const announcementsService = {
  getAll: async (): Promise<Announcement[]> => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return toCamelCase<Announcement[]>(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Announcement | null> => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return toCamelCase<Announcement>(data);
    } catch (error) {
      console.error('Error loading announcement:', error);
      return null;
    }
  },

  getActive: async (): Promise<Announcement[]> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .lte('valid_from', today)
        .gte('valid_to', today)
        .order('position', { ascending: true });

      if (error) throw error;
      return toCamelCase<Announcement[]>(data || []);
    } catch (error) {
      console.error('Error loading active announcements:', error);
      return [];
    }
  },

  create: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> => {
    try {
      const dbData = toSnakeCase(announcement);
      
      const { data, error } = await supabase
        .from('announcements')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return toCamelCase<Announcement>(data);
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Announcement>): Promise<Announcement | null> => {
    try {
      const dbData = toSnakeCase(updates);
      
      const { data, error } = await supabase
        .from('announcements')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return toCamelCase<Announcement>(data);
    } catch (error) {
      console.error('Error updating announcement:', error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return false;
    }
  },
};

// ============================================================================
// DIAGNOSTICS SERVICE
// ============================================================================

export const diagnosticsService = {
  getAll: async (): Promise<DiagnosticRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return toCamelCase<DiagnosticRecord[]>(data || []);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
      return [];
    }
  },

  create: async (diagnostic: Omit<DiagnosticRecord, 'id' | 'createdAt'>): Promise<DiagnosticRecord> => {
    try {
      // First, create or update the user
      const user = await usersService.createOrUpdate({
        fullName: diagnostic.userData.fullName,
        email: diagnostic.userData.email,
        whatsapp: diagnostic.userData.whatsapp,
        legalArea: diagnostic.area.name,
        responses: diagnostic.responses,
      });

      // Then create the diagnostic record
      const dbData = toSnakeCase({
        ...diagnostic,
        userId: user.id,
      });
      
      const { data, error } = await supabase
        .from('diagnostics')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return toCamelCase<DiagnosticRecord>(data);
    } catch (error) {
      console.error('Error creating diagnostic:', error);
      throw error;
    }
  },

  getByUser: async (userId: string): Promise<DiagnosticRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return toCamelCase<DiagnosticRecord[]>(data || []);
    } catch (error) {
      console.error('Error loading user diagnostics:', error);
      return [];
    }
  },

  getStats: async () => {
    try {
      const diagnostics = await diagnosticsService.getAll();
      const now = new Date();
      const thisMonth = diagnostics.filter(d => {
        const createdAt = new Date(d.createdAt);
        return createdAt.getMonth() === now.getMonth() &&
               createdAt.getFullYear() === now.getFullYear();
      });

      return {
        total: diagnostics.length,
        thisMonth: thisMonth.length,
        byArea: diagnostics.reduce((acc, d) => {
          acc[d.area.name] = (acc[d.area.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byUrgency: diagnostics.reduce((acc, d) => {
          acc[d.urgencyLevel] = (acc[d.urgencyLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      console.error('Error getting diagnostic stats:', error);
      return {
        total: 0,
        thisMonth: 0,
        byArea: {},
        byUrgency: {},
      };
    }
  },
};

// ============================================================================
// REFERRALS SERVICE
// ============================================================================

export const referralsService = {
  getAll: async (): Promise<ReferralRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return toCamelCase<ReferralRecord[]>(data || []);
    } catch (error) {
      console.error('Error loading referrals:', error);
      return [];
    }
  },

  create: async (referral: Omit<ReferralRecord, 'id' | 'createdAt'>): Promise<ReferralRecord> => {
    try {
      const dbData = toSnakeCase(referral);
      
      const { data, error } = await supabase
        .from('referrals')
        .insert(dbData)
        .select()
        .single();

      if (error) throw error;
      return toCamelCase<ReferralRecord>(data);
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const referrals = await referralsService.getAll();
      return {
        total: referrals.length,
        topReferrers: Object.entries(
          referrals.reduce((acc, r) => {
            acc[r.referrerName] = (acc[r.referrerName] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        total: 0,
        topReferrers: [],
      };
    }
  },
};

// ============================================================================
// USERS SERVICE
// ============================================================================

export const usersService = {
  getAll: async (): Promise<UserRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return toCamelCase<UserRecord[]>(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },

  createOrUpdate: async (user: Omit<UserRecord, 'id' | 'createdAt'>): Promise<UserRecord> => {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      const dbData = toSnakeCase(user);

      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update(dbData)
          .eq('email', user.email)
          .select()
          .single();

        if (error) throw error;
        return toCamelCase<UserRecord>(data);
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;
        return toCamelCase<UserRecord>(data);
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const users = await usersService.getAll();
      return {
        total: users.length,
        byArea: users.reduce((acc, u) => {
          acc[u.legalArea] = (acc[u.legalArea] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        total: 0,
        byArea: {},
      };
    }
  },
};

// ============================================================================
// TERMS SERVICE
// ============================================================================

export const termsService = {
  get: async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select('content')
        .eq('type', 'terms_of_use')
        .single();

      if (error) throw error;
      return data?.content || '';
    } catch (error) {
      console.error('Error loading terms:', error);
      return '';
    }
  },

  set: async (content: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('terms')
        .update({ content })
        .eq('type', 'terms_of_use');

      if (error) throw error;
    } catch (error) {
      console.error('Error updating terms:', error);
      throw error;
    }
  },
};

// ============================================================================
// LGPD TERMS SERVICE
// ============================================================================

export const lgpdService = {
  get: async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select('content')
        .eq('type', 'lgpd_terms')
        .single();

      if (error) throw error;
      return data?.content || '';
    } catch (error) {
      console.error('Error loading LGPD terms:', error);
      return '';
    }
  },

  set: async (content: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('terms')
        .update({ content })
        .eq('type', 'lgpd_terms');

      if (error) throw error;
    } catch (error) {
      console.error('Error updating LGPD terms:', error);
      throw error;
    }
  },
};

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export const exportService = {
  exportUsersToCSV: async (): Promise<string> => {
    const users = await usersService.getAll();
    const headers = ['Nome', 'Email', 'WhatsApp', 'Área Jurídica', 'Data Cadastro'];
    const rows = users.map(u => [
      u.fullName,
      u.email,
      u.whatsapp,
      u.legalArea,
      new Date(u.createdAt).toLocaleDateString('pt-BR'),
    ]);

    return [headers, ...rows].map(row => row.join(';')).join('\n');
  },

  exportReferralsToCSV: async (): Promise<string> => {
    const referrals = await referralsService.getAll();
    const headers = ['Nome do Indicado', 'WhatsApp do Indicado', 'Nome do Indicador', 'Data'];
    const rows = referrals.map(r => [
      r.referredName,
      r.referredWhatsapp,
      r.referrerName,
      new Date(r.createdAt).toLocaleDateString('pt-BR'),
    ]);

    return [headers, ...rows].map(row => row.join(';')).join('\n');
  },

  downloadCSV: (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },
};

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export interface AnalyticsData {
  totalAccesses: number;
  totalQuestionnaires: number;
  totalUsers: number;
  accessHistory: Array<{ date: string; count: number }>;
  questionnaireHistory: Array<{ date: string; count: number }>;
  areaDistribution: Record<string, number>;
}

export const analyticsService = {
  get: async (): Promise<AnalyticsData> => {
    try {
      // Get summary data
      const { data: summary, error: summaryError } = await supabase
        .from('analytics_summary')
        .select('*')
        .single();

      if (summaryError) throw summaryError;

      // Get last 30 days of analytics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .gte('date', thirtyDaysAgoStr)
        .order('date', { ascending: false });

      if (analyticsError) throw analyticsError;

      return {
        totalAccesses: summary?.total_accesses || 0,
        totalQuestionnaires: summary?.total_questionnaires || 0,
        totalUsers: summary?.total_users || 0,
        accessHistory: analytics?.map(a => ({
          date: a.date,
          count: a.access_count,
        })) || [],
        questionnaireHistory: analytics?.map(a => ({
          date: a.date,
          count: a.questionnaire_count,
        })) || [],
        areaDistribution: summary?.area_distribution || {},
      };
    } catch (error) {
      console.error('Error loading analytics:', error);
      return {
        totalAccesses: 0,
        totalQuestionnaires: 0,
        totalUsers: 0,
        accessHistory: [],
        questionnaireHistory: [],
        areaDistribution: {},
      };
    }
  },

  incrementAccess: async (): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update or create today's analytics
      const { data: existing } = await supabase
        .from('analytics')
        .select('*')
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('analytics')
          .update({ access_count: existing.access_count + 1 })
          .eq('date', today);
      } else {
        await supabase
          .from('analytics')
          .insert({ date: today, access_count: 1, questionnaire_count: 0 });
      }

      // Update summary
      const { data: summary } = await supabase
        .from('analytics_summary')
        .select('*')
        .single();

      if (summary) {
        await supabase
          .from('analytics_summary')
          .update({ total_accesses: summary.total_accesses + 1 })
          .eq('id', summary.id);
      }
    } catch (error) {
      console.error('Error incrementing access:', error);
    }
  },

  incrementQuestionnaire: async (area: string): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update or create today's analytics
      const { data: existing } = await supabase
        .from('analytics')
        .select('*')
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('analytics')
          .update({ questionnaire_count: existing.questionnaire_count + 1 })
          .eq('date', today);
      } else {
        await supabase
          .from('analytics')
          .insert({ date: today, access_count: 0, questionnaire_count: 1 });
      }

      // Update summary
      const { data: summary } = await supabase
        .from('analytics_summary')
        .select('*')
        .single();

      if (summary) {
        const newAreaDistribution = { ...summary.area_distribution };
        newAreaDistribution[area] = (newAreaDistribution[area] || 0) + 1;

        await supabase
          .from('analytics_summary')
          .update({
            total_questionnaires: summary.total_questionnaires + 1,
            total_users: summary.total_users + 1,
            area_distribution: newAreaDistribution,
          })
          .eq('id', summary.id);
      }
    } catch (error) {
      console.error('Error incrementing questionnaire:', error);
    }
  },

  getStats: async () => {
    try {
      const analytics = await analyticsService.get();
      const today = new Date();
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const thisMonthStartStr = thisMonthStart.toISOString().split('T')[0];

      // Calculate this month stats
      const thisMonthAccesses = analytics.accessHistory
        .filter(h => h.date >= thisMonthStartStr)
        .reduce((sum, h) => sum + h.count, 0);

      const thisMonthQuestionnaires = analytics.questionnaireHistory
        .filter(h => h.date >= thisMonthStartStr)
        .reduce((sum, h) => sum + h.count, 0);

      // Calculate last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      const last30DaysAccesses = analytics.accessHistory
        .filter(h => h.date >= thirtyDaysAgoStr)
        .reduce((sum, h) => sum + h.count, 0);

      return {
        total: analytics.totalAccesses,
        totalQuestionnaires: analytics.totalQuestionnaires,
        totalUsers: analytics.totalUsers,
        thisMonth: thisMonthAccesses,
        thisMonthQuestionnaires: thisMonthQuestionnaires,
        last30Days: last30DaysAccesses,
        areaDistribution: analytics.areaDistribution,
        dailyHistory: analytics.accessHistory,
        questionnaireHistory: analytics.questionnaireHistory,
      };
    } catch (error) {
      console.error('Error getting analytics stats:', error);
      return {
        total: 0,
        totalQuestionnaires: 0,
        totalUsers: 0,
        thisMonth: 0,
        thisMonthQuestionnaires: 0,
        last30Days: 0,
        areaDistribution: {},
        dailyHistory: [],
        questionnaireHistory: [],
      };
    }
  },

  reset: async (): Promise<void> => {
    try {
      // Delete all analytics records
      await supabase.from('analytics').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Reset summary
      const { data: summary } = await supabase
        .from('analytics_summary')
        .select('*')
        .single();

      if (summary) {
        await supabase
          .from('analytics_summary')
          .update({
            total_accesses: 0,
            total_questionnaires: 0,
            total_users: 0,
            area_distribution: {},
          })
          .eq('id', summary.id);
      }
    } catch (error) {
      console.error('Error resetting analytics:', error);
    }
  },
};
