import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BannerUpload } from '@/components/admin/BannerUpload';
import { TeamPhotosManager } from '@/components/admin/TeamPhotosManager';
import {
  announcementsService,
  diagnosticsService,
  referralsService,
  usersService,
  termsService,
  lgpdService,
  exportService,
  analyticsService,
  type Announcement as AnnouncementType,
} from '@/lib/data-service';
import {
  LogOut,
  Users,
  FileText,
  UserPlus,
  Download,
  AlertCircle,
  BarChart3,
  MessageCircle,
  FileCheck,
  Megaphone,
  Send,
  Calendar,
  Link as LinkIcon,
  Edit,
  Trash2,
  Plus,
  Save,
  Shield,
  TrendingUp,
  Activity,
  Image as ImageIcon
} from 'lucide-react';

// Default LGPD Terms Template
const DEFAULT_LGPD_TERMS = `TERMOS DE PROTEÇÃO DE DADOS PESSOAIS (LGPD)

Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), informamos como tratamos seus dados pessoais:

1. RESPONSÁVEL PELO TRATAMENTO DE DADOS

O responsável pela coleta e tratamento dos dados pessoais é:
- Nome: [Nome do Escritório/Empresa]
- CNPJ: [CNPJ]
- Endereço: [Endereço Completo]
- Email: [email@exemplo.com]
- WhatsApp: (11) 92148-6194

2. DADOS COLETADOS

Coletamos os seguintes dados pessoais:
• Nome completo
• Email
• Número de telefone (WhatsApp)
• Cidade e Estado
• Respostas ao questionário jurídico
• Nome e WhatsApp do amigo indicado (quando fornecido)
• Data e hora de acesso ao sistema
• Endereço IP (para fins de segurança)

3. FINALIDADES DO TRATAMENTO

Seus dados pessoais são utilizados exclusivamente para:
• Gerar diagnóstico jurídico personalizado
• Enviar relatório em PDF por email
• Enviar notificação via WhatsApp
• Enviar convite ao amigo indicado
• Análises estatísticas e melhoria do serviço
• Atendimento de obrigações legais e regulatórias
• Comunicações sobre o serviço prestado

4. BASE LEGAL PARA O TRATAMENTO

O tratamento dos seus dados está fundamentado em:
• Consentimento expresso (Art. 7º, I da LGPD)
• Execução de contrato (Art. 7º, V da LGPD)
• Exercício regular de direitos (Art. 7º, VI da LGPD)
• Cumprimento de obrigação legal (Art. 7º, II da LGPD)

Para exercer qualquer direito garantido pela LGPD, entre em contato através do WhatsApp: (11) 92148-6194`;

interface AdminDashboardProps {
  onLogout: () => void;
}

interface UserReport {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  legalArea: string;
  createdAt: string;
  responses: Array<{ question: string; answer: string }>;
}

interface ReferralReport {
  id: string;
  referrerName: string;
  referredName: string;
  referredWhatsapp: string;
  createdAt: string;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Terms of Use state
  const [termsContent, setTermsContent] = useState('Digite aqui os Termos de Uso do sistema...');

  // LGPD Terms state
  const [lgpdContent, setLgpdContent] = useState(DEFAULT_LGPD_TERMS);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementType | null>(null);

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDiagnostics: 0,
    totalReferrals: 0,
    thisMonth: 0,
  });

  // Analytics state
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);

  // Users and Referrals state
  const [users, setUsers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      // Load terms
      const terms = await termsService.get();
      setTermsContent(terms || 'Digite aqui os Termos de Uso do sistema...');

      // Load LGPD terms
      const lgpd = await lgpdService.get();
      setLgpdContent(lgpd || DEFAULT_LGPD_TERMS);

      // Load announcements
      const announcementsData = await announcementsService.getAll();
      setAnnouncements(announcementsData);

      // Load users and referrals
      const usersData = await usersService.getAll();
      setUsers(usersData);
      const referralsData = await referralsService.getAll();
      setReferrals(referralsData);

      // Load stats
      const diagnosticStats = await diagnosticsService.getStats();
      const referralStats = await referralsService.getStats();
      const userStats = await usersService.getStats();
      const analyticsData = await analyticsService.getStats();

      setStats({
        totalUsers: userStats.total,
        totalDiagnostics: diagnosticStats.total,
        totalReferrals: referralStats.total,
        thisMonth: diagnosticStats.thisMonth,
      });

      setAnalyticsStats(analyticsData);
    };

    loadData();
  }, [activeTab]);

  // WhatsApp messaging state
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappRecipients, setWhatsappRecipients] = useState<'all' | 'users' | 'referrals'>('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Painel Administrativo</h1>
              <p className="text-sm text-zinc-600">Diagnóstico Jurídico</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* 
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Importante:</strong> Conecte o banco de dados para visualizar dados reais.
            Atualmente mostrando interface de demonstração.
          </AlertDescription>
        </Alert> 
        */}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-10 mb-6 h-auto">
            <TabsTrigger value="overview" className="flex-col py-3">
              <BarChart3 className="h-4 w-4 mb-1" />
              <span className="text-xs">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-col py-3">
              <Activity className="h-4 w-4 mb-1" />
              <span className="text-xs">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="team-photos" className="flex-col py-3">
              <ImageIcon className="h-4 w-4 mb-1" />
              <span className="text-xs">Equipe</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex-col py-3">
              <FileCheck className="h-4 w-4 mb-1" />
              <span className="text-xs">Termos</span>
            </TabsTrigger>
            <TabsTrigger value="lgpd" className="flex-col py-3">
              <Shield className="h-4 w-4 mb-1" />
              <span className="text-xs">LGPD</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex-col py-3">
              <Megaphone className="h-4 w-4 mb-1" />
              <span className="text-xs">Anúncios</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-col py-3">
              <Users className="h-4 w-4 mb-1" />
              <span className="text-xs">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex-col py-3">
              <FileText className="h-4 w-4 mb-1" />
              <span className="text-xs">Diagnósticos</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex-col py-3">
              <UserPlus className="h-4 w-4 mb-1" />
              <span className="text-xs">Indicações</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex-col py-3">
              <MessageCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <StatsCard
                title="Total de Usuários"
                value={stats.totalUsers.toString()}
                description="Usuários cadastrados"
                icon={<Users className="h-8 w-8 text-blue-600" />}
              />
              <StatsCard
                title="Diagnósticos"
                value={stats.totalDiagnostics.toString()}
                description="Total de diagnósticos"
                icon={<FileText className="h-8 w-8 text-green-600" />}
              />
              <StatsCard
                title="Indicações"
                value={stats.totalReferrals.toString()}
                description="Total de indicações"
                icon={<UserPlus className="h-8 w-8 text-orange-600" />}
              />
              <StatsCard
                title="Este Mês"
                value={stats.thisMonth.toString()}
                description="Novos diagnósticos"
                icon={<BarChart3 className="h-8 w-8 text-purple-600" />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Funcionalidades administrativas</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto py-4">
                  <Download className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Exportar Relatório Excel</div>
                    <div className="text-xs text-zinc-600">Indicações com nome e telefone</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-4" disabled>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Envio WhatsApp em Massa</div>
                    <div className="text-xs text-zinc-600">Disponível em breve</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Photos Tab */}
          <TabsContent value="team-photos">
            <TeamPhotosManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Acessos Totais</p>
                      <p className="text-4xl font-black text-blue-600 mt-2">
                        {analyticsStats?.total?.toLocaleString('pt-BR') || '0'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1 font-semibold">
                        Este mês: {analyticsStats?.thisMonth?.toLocaleString('pt-BR') || '0'}
                      </p>
                    </div>
                    <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-900">Questionários</p>
                      <p className="text-4xl font-black text-green-600 mt-2">
                        {analyticsStats?.totalQuestionnaires?.toLocaleString('pt-BR') || '0'}
                      </p>
                      <p className="text-xs text-green-700 mt-1 font-semibold">
                        Este mês: {analyticsStats?.thisMonthQuestionnaires?.toLocaleString('pt-BR') || '0'}
                      </p>
                    </div>
                    <div className="bg-green-600 p-3 rounded-xl shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-900">Pessoas Ajudadas</p>
                      <p className="text-4xl font-black text-purple-600 mt-2">
                        {analyticsStats?.totalUsers?.toLocaleString('pt-BR') || '0'}
                      </p>
                      <p className="text-xs text-purple-700 mt-1 font-semibold">
                        Receberam diagnóstico
                      </p>
                    </div>
                    <div className="bg-purple-600 p-3 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-900">Últimos 30 Dias</p>
                      <p className="text-4xl font-black text-orange-600 mt-2">
                        {analyticsStats?.last30Days?.toLocaleString('pt-BR') || '0'}
                      </p>
                      <p className="text-xs text-orange-700 mt-1 font-semibold">
                        Acessos recentes
                      </p>
                    </div>
                    <div className="bg-orange-600 p-3 rounded-xl shadow-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Area Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Distribuição por Área Jurídica
                  </CardTitle>
                  <CardDescription>Questionários respondidos por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  {!analyticsStats?.areaDistribution || Object.keys(analyticsStats.areaDistribution).length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <BarChart3 className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
                      <p className="text-sm">Nenhum questionário respondido ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(analyticsStats?.areaDistribution || {})
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .map(([area, count]) => (
                          <div key={area} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-zinc-700">{area}</span>
                              <span className="font-bold text-zinc-900">{count as number}</span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all"
                                style={{
                                  width: `${((count as number) / Math.max(...Object.values(analyticsStats?.areaDistribution || {}).map(v => v as number))) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>Acessos nos últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  {!analyticsStats?.dailyHistory || analyticsStats.dailyHistory.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <Activity className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
                      <p className="text-sm">Nenhum acesso registrado ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(analyticsStats?.dailyHistory || [])
                        .slice(0, 7)
                        .map((entry: any) => (
                          <div key={entry.date} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                            <span className="text-sm text-zinc-700">
                              {new Date(entry.date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-zinc-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min((entry.count / Math.max(...(analyticsStats?.dailyHistory || []).map((h: any) => h.count))) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-bold text-zinc-900 w-12 text-right">
                                {entry.count}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-200">
              <CardHeader>
                <CardTitle>Ações de Analytics</CardTitle>
                <CardDescription>Gerenciar dados de estatísticas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const stats = await analyticsService.getStats();
                      const data = {
                        totalAccesses: stats.total,
                        totalQuestionnaires: stats.totalQuestionnaires,
                        totalUsers: stats.totalUsers,
                        thisMonth: stats.thisMonth,
                        last30Days: stats.last30Days,
                        areaDistribution: stats.areaDistribution,
                        generatedAt: new Date().toISOString(),
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
                      link.click();
                    }}
                    className="h-auto py-4 justify-start"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Exportar Analytics</div>
                      <div className="text-xs text-zinc-600">Baixar dados em JSON</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (confirm('⚠️ ATENÇÃO: Isso irá resetar TODAS as estatísticas para zero. Esta ação NÃO pode ser desfeita!\n\nDeseja continuar?')) {
                        await analyticsService.reset();
                        alert('✅ Estatísticas resetadas com sucesso!');
                        window.location.reload();
                      }
                    }}
                    className="h-auto py-4 justify-start border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <AlertCircle className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Resetar Estatísticas</div>
                      <div className="text-xs">Limpar todos os dados</div>
                    </div>
                  </Button>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>Informação:</strong> Os contadores são atualizados automaticamente:
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li><strong>Acessos:</strong> Incrementado toda vez que alguém abre a landing page</li>
                      <li><strong>Questionários:</strong> Incrementado quando alguém completa um diagnóstico</li>
                      <li><strong>Pessoas Ajudadas:</strong> Igual ao número de questionários respondidos</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms of Use Tab */}
          <TabsContent value="terms">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Termos de Uso</CardTitle>
                <CardDescription>Edite os termos de uso exibidos aos usuários</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="terms-content">Conteúdo dos Termos de Uso</Label>
                  <Textarea
                    id="terms-content"
                    value={termsContent}
                    onChange={(e) => setTermsContent(e.target.value)}
                    rows={20}
                    className="font-mono text-sm mt-2"
                    placeholder="Digite aqui os Termos de Uso..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      localStorage.setItem('adminTermsOfUse', termsContent);
                      alert('Termos de Uso salvos com sucesso!');
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Termos de Uso
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTermsContent(localStorage.getItem('adminTermsOfUse') || '');
                    }}
                  >
                    Cancelar Alterações
                  </Button>
                </div>
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    Os termos editados aqui serão exibidos no modal quando o usuário iniciar um diagnóstico.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LGPD Terms Tab */}
          <TabsContent value="lgpd">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Gerenciar Termos LGPD
                </CardTitle>
                <CardDescription>
                  Edite os termos de proteção de dados pessoais (LGPD) exibidos aos usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>IMPORTANTE:</strong> Os termos LGPD são <strong>obrigatórios</strong> por lei.
                    O aceite é necessário para que o usuário possa receber o relatório.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="lgpd-content">Conteúdo dos Termos LGPD</Label>
                  <Textarea
                    id="lgpd-content"
                    value={lgpdContent}
                    onChange={(e) => setLgpdContent(e.target.value)}
                    rows={25}
                    className="font-mono text-sm mt-2"
                    placeholder="Digite aqui os Termos de Proteção de Dados (LGPD)..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      await lgpdService.set(lgpdContent);
                      alert('✅ Termos LGPD salvos com sucesso!');
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Termos LGPD
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const lgpd = await lgpdService.get();
                      setLgpdContent(lgpd || DEFAULT_LGPD_TERMS);
                    }}
                  >
                    Cancelar Alterações
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLgpdContent(DEFAULT_LGPD_TERMS);
                    }}
                  >
                    Restaurar Template Padrão
                  </Button>
                </div>

                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-base">Informações sobre LGPD</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Aceites obrigatórios para o usuário:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700">
                      <li>✅ Aceite dos Termos LGPD (proteção de dados)</li>
                      <li>✅ Autorização para receber contato (email e WhatsApp)</li>
                    </ul>
                    <p className="mt-3 text-zinc-600">
                      <strong>Onde são exibidos:</strong> Os termos LGPD são exibidos em um modal
                      obrigatório antes do usuário gerar o relatório, após preencher o formulário.
                    </p>
                    <p className="mt-2 text-zinc-600">
                      <strong>Dados salvos:</strong> Data e hora do aceite são armazenados automaticamente
                      no localStorage.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Anúncios</CardTitle>
                <CardDescription>Configure os 4 espaços publicitários do relatório</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={() => {
                    const newPos = (announcements.length + 1) as 1 | 2 | 3 | 4;
                    if (newPos <= 4) {
                      setEditingAnnouncement({
                        id: Date.now().toString(),
                        imageUrl: '',
                        validFrom: new Date().toISOString().split('T')[0],
                        validTo: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                        websiteUrl: '',
                        facebookUrl: '',
                        instagramUrl: '',
                        position: newPos,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                    }
                  }}
                  disabled={announcements.length >= 4}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Anúncio {announcements.length < 4 ? `(${announcements.length}/4)` : '(Limite atingido)'}
                </Button>

                {editingAnnouncement && (
                  <Card className="border-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Editar Anúncio - Posição {editingAnnouncement.position}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <BannerUpload
                        currentImageUrl={editingAnnouncement.imageUrl}
                        onImageChange={(imageUrl) => setEditingAnnouncement({...editingAnnouncement, imageUrl})}
                        label={`Banner do Espaço Publicitário ${editingAnnouncement.position}`}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Válido de</Label>
                          <Input
                            type="date"
                            value={editingAnnouncement.validFrom}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, validFrom: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Até</Label>
                          <Input
                            type="date"
                            value={editingAnnouncement.validTo}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, validTo: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>URLs de Destino</Label>
                        <div className="grid gap-2">
                          <Input
                            value={editingAnnouncement.websiteUrl}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, websiteUrl: e.target.value})}
                            placeholder="Site: https://seusite.com.br"
                          />
                          <Input
                            value={editingAnnouncement.facebookUrl}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, facebookUrl: e.target.value})}
                            placeholder="Facebook: https://facebook.com/sua-pagina"
                          />
                          <Input
                            value={editingAnnouncement.instagramUrl}
                            onChange={(e) => setEditingAnnouncement({...editingAnnouncement, instagramUrl: e.target.value})}
                            placeholder="Instagram: https://instagram.com/seu-perfil"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={async () => {
                          // Check if it's a new announcement or existing
                          const existingAnn = await announcementsService.getById(editingAnnouncement.id);

                          if (existingAnn) {
                            // Update existing
                            await announcementsService.update(editingAnnouncement.id, editingAnnouncement);
                          } else {
                            // Create new
                            await announcementsService.create(editingAnnouncement);
                          }

                          // Reload announcements
                          const announcementsData = await announcementsService.getAll();
                          setAnnouncements(announcementsData);
                          setEditingAnnouncement(null);
                          alert('Anúncio salvo com sucesso!');
                        }}>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Anúncio
                        </Button>
                        <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {announcements.map((ann) => (
                    <Card key={ann.id}>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>Espaço Publicitário {ann.position}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingAnnouncement(ann)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                if (confirm('Deseja excluir este anúncio?')) {
                                  await announcementsService.delete(ann.id);
                                  const announcementsData = await announcementsService.getAll();
                                  setAnnouncements(announcementsData);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-zinc-500" />
                          <span className="text-xs text-zinc-600">
                            {new Date(ann.validFrom).toLocaleDateString()} até {new Date(ann.validTo).toLocaleDateString()}
                          </span>
                        </div>
                        {ann.imageUrl && (
                          <img src={ann.imageUrl} alt={`Banner ${ann.position}`} className="w-full h-24 object-cover rounded" />
                        )}
                        <div className="flex gap-2">
                          {ann.websiteUrl && <LinkIcon className="h-4 w-4 text-blue-600" />}
                          {ann.facebookUrl && <span className="text-xs text-blue-600">FB</span>}
                          {ann.instagramUrl && <span className="text-xs text-pink-600">IG</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Usuários Cadastrados</CardTitle>
                <CardDescription>
                  Todos os usuários que responderam questionários com dados completos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Button onClick={async () => {
                    const csv = await exportService.exportUsersToCSV();
                    exportService.downloadCSV(csv, `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
                    alert('Relatório de usuários exportado com sucesso!');
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button variant="outline" onClick={() => {
                    alert('Em produção, este botão exportaria para Excel (.xlsx)');
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Área Jurídica</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Respostas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="h-12 w-12 text-zinc-400" />
                              <p className="font-medium">Nenhum usuário cadastrado ainda</p>
                              <p className="text-sm">
                                Os usuários que responderem questionários aparecerão aqui
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.whatsapp}</TableCell>
                            <TableCell>{user.legalArea}</TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">Ver</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <strong>Campos incluídos na exportação:</strong> Nome completo, Email, WhatsApp,
                    Área Jurídica, Data de cadastro, Todas as perguntas e respostas do questionário
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics">
            <Card>
              <CardHeader>
                <CardTitle>Diagnósticos Gerados</CardTitle>
                <CardDescription>Histórico completo de diagnósticos jurídicos</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={<FileText className="h-12 w-12 text-zinc-400" />}
                  title="Nenhum diagnóstico encontrado"
                  description=""
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Indicações</CardTitle>
                <CardDescription>
                  Todos os amigos indicados com nome e WhatsApp para integração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Button onClick={async () => {
                    const csv = await exportService.exportReferralsToCSV();
                    exportService.downloadCSV(csv, `indicacoes_${new Date().toISOString().split('T')[0]}.csv`);
                    alert('Relatório de indicações exportado!');
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button variant="outline" onClick={() => {
                    alert('Exportação Excel será implementada em produção com biblioteca específica');
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Excel (.xlsx)
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Indicado</TableHead>
                        <TableHead>WhatsApp do Indicado</TableHead>
                        <TableHead>Indicado por</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                            <div className="flex flex-col items-center gap-2">
                              <UserPlus className="h-12 w-12 text-zinc-400" />
                              <p className="font-medium">Nenhuma indicação cadastrada ainda</p>
                              <p className="text-sm">
                                As indicações de amigos aparecerão aqui
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell>{referral.referredName}</TableCell>
                            <TableCell>{referral.referredWhatsapp}</TableCell>
                            <TableCell>{referral.referrerName}</TableCell>
                            <TableCell>{new Date(referral.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Alert className="mt-4 border-green-200 bg-green-50">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    <strong>Integração com WhatsApp:</strong> Os dados exportados podem ser
                    importados diretamente em sistemas de disparo como Evolution API, Z-API, etc.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Messaging Tab */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Envio WhatsApp</CardTitle>
                <CardDescription>
                  Envio em massa de mensagens (configuração prévia necessária)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-900">
                    <strong>Atenção:</strong> Este sistema requer integração com API de WhatsApp
                    (Evolution API, Z-API, Baileys, etc.) configurada nas variáveis de ambiente.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label>Destinatários</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant={whatsappRecipients === 'all' ? 'default' : 'outline'}
                        onClick={() => setWhatsappRecipients('all')}
                      >
                        Todos
                      </Button>
                      <Button
                        variant={whatsappRecipients === 'users' ? 'default' : 'outline'}
                        onClick={() => setWhatsappRecipients('users')}
                      >
                        Apenas Usuários
                      </Button>
                      <Button
                        variant={whatsappRecipients === 'referrals' ? 'default' : 'outline'}
                        onClick={() => setWhatsappRecipients('referrals')}
                      >
                        Apenas Indicados
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="whatsapp-message">Mensagem</Label>
                    <Textarea
                      id="whatsapp-message"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      rows={8}
                      placeholder="Digite a mensagem que será enviada via WhatsApp..."
                      className="mt-2"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Variáveis disponíveis: {'{nome}'}, {'{area_juridica}'}, {'{data}'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (!whatsappMessage.trim()) {
                          alert('Digite uma mensagem primeiro!');
                          return;
                        }
                        if (confirm(`Deseja enviar para: ${whatsappRecipients === 'all' ? 'TODOS' : whatsappRecipients === 'users' ? 'USUÁRIOS' : 'INDICADOS'}?`)) {
                          alert('Em produção, este botão dispararia mensagens via API do WhatsApp configurada no .env');
                        }
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagens
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWhatsappMessage('');
                        setWhatsappRecipients('all');
                      }}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base">Configuração de API</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>APIs Suportadas:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700">
                      <li>Evolution API (Recomendado)</li>
                      <li>Z-API</li>
                      <li>Baileys</li>
                      <li>Venom Bot</li>
                      <li>WPPConnect</li>
                    </ul>
                    <p className="mt-3 text-zinc-600">
                      Configure as variáveis no arquivo <code className="bg-white px-1 py-0.5 rounded">.env.local</code>:
                    </p>
                    <pre className="bg-white p-2 rounded text-xs mt-2">
{`VITE_WHATSAPP_API_URL=https://sua-api.com
VITE_WHATSAPP_API_KEY=sua-chave-aqui`}
                    </pre>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600">{title}</p>
            <p className="text-3xl font-bold text-zinc-900 mt-2">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{description}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 max-w-md mx-auto">{description}</p>
    </div>
  );
}
