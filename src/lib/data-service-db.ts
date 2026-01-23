import { databaseService } from "@/lib/database-service";
import { DiagnosticResultUrgencyLevel } from "@/components/data/orm/orm_diagnostic_result";

export const diagnosticsServiceDB = {
  async getAll() {
    return await databaseService.getAllDiagnostics();
  },

  async getStats() {
    const diagnostics = await databaseService.getAllDiagnostics();
    const now = new Date();

    const thisMonth = diagnostics.filter(d => {
      const createdAt = new Date(Number(d.create_time) * 1000);
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    });

    return {
      total: diagnostics.length,
      thisMonth: thisMonth.length,
      byArea: diagnostics.reduce((acc, d) => {
        acc[d.legal_area] = (acc[d.legal_area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byUrgency: diagnostics.reduce((acc, d) => {
        const key =
          d.urgency_level === DiagnosticResultUrgencyLevel.High
            ? "high"
            : d.urgency_level === DiagnosticResultUrgencyLevel.Medium
            ? "medium"
            : "low";

        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
};
