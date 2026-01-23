import { UserDataORM, type UserDataModel } from '@/components/data/orm/orm_user_data';
import { DiagnosticResultORM, type DiagnosticResultModel, DiagnosticResultUrgencyLevel } from '@/components/data/orm/orm_diagnostic_result';
import { ReferralNotificationORM, type ReferralNotificationModel } from '@/components/data/orm/orm_referral_notification';
import type { UserData, QuestionnaireResponse } from '@/types/legal';

/**
 * Database service for managing user data, diagnostics, and referrals
 * Uses the RAF ORM for data persistence
 */
export class DatabaseService {
  private static instance: DatabaseService | null = null;
  private userDataORM: UserDataORM;
  private diagnosticORM: DiagnosticResultORM;
  private referralORM: ReferralNotificationORM;

  private constructor() {
    this.userDataORM = UserDataORM.getInstance();
    this.diagnosticORM = DiagnosticResultORM.getInstance();
    this.referralORM = ReferralNotificationORM.getInstance();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Saves user data to the database
   */
  async saveUserData(userData: UserData): Promise<UserDataModel> {
    try {
      const userDataModel: Partial<UserDataModel> = {
        full_name: userData.fullName,
        email: userData.email,
        whatsapp: userData.whatsapp,
        city: userData.city || null,
        state: userData.state || null,
        referral_friend_name: userData.referralName || null,
        referral_friend_whatsapp: userData.referralWhatsapp || null,
      };

      const result = await this.userDataORM.insertUserData([userDataModel as UserDataModel]);
      return result[0];
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Saves diagnostic result to the database
   */
  async saveDiagnostic(options: {
    userId: string;
    legalArea: string;
    responses: QuestionnaireResponse[];
    totalScore: number;
    urgencyLevel: 'high' | 'medium' | 'low';
    aiReport?: string;
  }): Promise<DiagnosticResultModel> {
    try {
      const urgencyMapping = {
        high: DiagnosticResultUrgencyLevel.High,
        medium: DiagnosticResultUrgencyLevel.Medium,
        low: DiagnosticResultUrgencyLevel.Low,
      };

      const diagnosticModel: Partial<DiagnosticResultModel> = {
        user_id: options.userId,
        legal_area: options.legalArea,
        response: JSON.stringify(options.responses),
        total_score: options.totalScore,
        urgency_level: urgencyMapping[options.urgencyLevel],
        ai_report: options.aiReport || null,
      };

      const result = await this.diagnosticORM.insertDiagnosticResult([diagnosticModel as DiagnosticResultModel]);
      return result[0];
    } catch (error) {
      console.error('Error saving diagnostic:', error);
      throw new Error('Failed to save diagnostic');
    }
  }

  /**
   * Saves referral notification to the database
   */
  async saveReferral(options: {
    referredByUserId: string;
    friendName: string;
    friendWhatsapp: string;
  }): Promise<ReferralNotificationModel> {
    try {
      const referralModel: Partial<ReferralNotificationModel> = {
        referred_by_user_id: options.referredByUserId,
        friend_name: options.friendName,
        friend_whatsapp: options.friendWhatsapp,
        notification_sent: false,
        sent_at: null,
      };

      const result = await this.referralORM.insertReferralNotification([referralModel as ReferralNotificationModel]);
      return result[0];
    } catch (error) {
      console.error('Error saving referral:', error);
      throw new Error('Failed to save referral');
    }
  }

  /**
   * Gets all user data records
   */
  async getAllUsers(): Promise<UserDataModel[]> {
    try {
      return await this.userDataORM.getAllUserData();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Gets all diagnostic results
   */
  async getAllDiagnostics(): Promise<DiagnosticResultModel[]> {
    try {
      return await this.diagnosticORM.getAllDiagnosticResult();
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      return [];
    }
  }

  /**
   * Gets all referrals
   */
  async getAllReferrals(): Promise<ReferralNotificationModel[]> {
    try {
      return await this.referralORM.getAllReferralNotification();
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
  }

  /**
   * Gets diagnostics by user ID
   */
  async getDiagnosticsByUserId(userId: string): Promise<DiagnosticResultModel[]> {
    try {
      return await this.diagnosticORM.getDiagnosticResultByUserId(userId);
    } catch (error) {
      console.error('Error fetching user diagnostics:', error);
      return [];
    }
  }

  /**
   * Gets user by email
   */
  async getUserByEmail(email: string): Promise<UserDataModel[]> {
    try {
      return await this.userDataORM.getUserDataByEmail(email);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return [];
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
