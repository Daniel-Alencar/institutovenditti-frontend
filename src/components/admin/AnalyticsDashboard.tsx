import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Users, FileText, Activity, BarChart3,
  Download, AlertCircle, Eye, Percent, Zap, Calendar, FlaskConical,
} from 'lucide-react';
import { analyticsService } from '@/lib/data-service';

import seedrandom from 'seedrandom';

// ─── Fake data generator ──────────────────────────────────────────────────────

function generateFakeData() {
  const now = new Date();
  const months = [];
  const areas = ['Trabalhista', 'Consumidor', 'Previdenciário', 'Civil', 'Criminal', 'Família'];
  const dailyHistory: Array<{ date: string; count: number; questionnaires: number }> = [];
  
  // Inicializa com uma semente fixa (ex: 'semente123')
  const rng = seedrandom('semente123');

  // Generate 12 months of data
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    const base = 1800 + Math.sin(m * 0.5) * 600 + rng() * 400;
    const accesses = Math.round(base);
    const questionnaires = Math.round(accesses * (0.28 + rng() * 0.12));
    months.push({ month: monthLabel, acessos: accesses, questionarios: questionnaires, date: d });

    // Daily breakdown for this month
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(d.getFullYear(), d.getMonth(), day);
      if (date > now) break;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dayBase = (accesses / daysInMonth) * (isWeekend ? 0.55 : 1.2);
      dailyHistory.push({
        date: date.toISOString().split('T')[0],
        count: Math.round(dayBase * (0.7 + rng() * 0.6)),
        questionnaires: Math.round(dayBase * 0.3 * (0.7 + rng() * 0.6)),
      });
    }
  }

  const totalAccesses = months.reduce((s, m) => s + m.acessos, 0);
  const totalQuestionnaires = months.reduce((s, m) => s + m.questionarios, 0);

  const areaDistribution: Record<string, number> = {};
  areas.forEach((a, i) => {
    areaDistribution[a] = Math.round(totalQuestionnaires * [0.35, 0.25, 0.15, 0.12, 0.08, 0.05][i]);
  });

  const weekdayDist = [
    { dia: 'Dom', acessos: Math.round(totalAccesses * 0.07) },
    { dia: 'Seg', acessos: Math.round(totalAccesses * 0.19) },
    { dia: 'Ter', acessos: Math.round(totalAccesses * 0.18) },
    { dia: 'Qua', acessos: Math.round(totalAccesses * 0.17) },
    { dia: 'Qui', acessos: Math.round(totalAccesses * 0.17) },
    { dia: 'Sex', acessos: Math.round(totalAccesses * 0.15) },
    { dia: 'Sáb', acessos: Math.round(totalAccesses * 0.07) },
  ];

  return {
    months,
    dailyHistory,
    totalAccesses,
    totalQuestionnaires,
    totalUsers: totalQuestionnaires,
    areaDistribution,
    weekdayDist,
    thisMonth: months[months.length - 1]?.acessos ?? 0,
    thisMonthQuestionnaires: months[months.length - 1]?.questionarios ?? 0,
    last30Days: months.slice(-2).reduce((s, m) => s + m.acessos, 0),
  };
}

// ─── Process real data into monthly shape ────────────────────────────────────

function processRealData(stats: any) {
  const daily: Array<{ date: string; count: number; questionnaires: number }> =
    (stats.dailyHistory || []).map((h: any) => ({
      date: h.date,
      count: h.count,
      questionnaires:
        (stats.questionnaireHistory || []).find((q: any) => q.date === h.date)?.count ?? 0,
    }));

  // Group into months
  const monthMap: Record<string, { acessos: number; questionarios: number; date: Date }> = {};
  daily.forEach(({ date, count, questionnaires }) => {
    const d = new Date(date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        acessos: 0,
        questionarios: 0,
        date: new Date(d.getFullYear(), d.getMonth(), 1),
      };
    }
    monthMap[key].acessos += count;
    monthMap[key].questionarios += questionnaires;
  });

  const months = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({
      month: v.date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      acessos: v.acessos,
      questionarios: v.questionarios,
      date: v.date,
    }));

  // Weekday distribution from daily
  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0];
  daily.forEach(({ date, count }) => {
    weekdayTotals[new Date(date).getDay()] += count;
  });
  const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekdayDist = weekdayLabels.map((dia, i) => ({ dia, acessos: weekdayTotals[i] }));

  return { months, daily, weekdayDist };
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const fmt = (n: number) => n.toLocaleString('pt-BR');

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  title, value, sub, icon, color, trend,
}: {
  title: string; value: string; sub: string;
  icon: React.ReactNode; color: string; trend?: number;
}) {
  return (
    <Card className={`border-${color}-200 bg-gradient-to-br from-${color}-50 to-white`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold text-${color}-800 uppercase tracking-wide truncate`}>{title}</p>
            <p className={`text-3xl font-black text-${color}-600 mt-1 leading-none`}>{value}</p>
            <p className={`text-xs text-${color}-700 mt-1.5 font-medium`}>{sub}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend >= 0
                  ? <TrendingUp className="h-3 w-3 text-green-600" />
                  : <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={`text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {trend >= 0 ? '+' : ''}{trend}% vs mês ant.
                </span>
              </div>
            )}
          </div>
          <div className={`bg-${color}-600 p-2.5 rounded-xl shadow-lg shrink-0 ml-2`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard() {
  const [realStats, setRealStats]       = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [useFake, setUseFake]           = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // index in months array

  // Generate fake data once
  const fakeData = useMemo(() => generateFakeData(), []);

  useEffect(() => {
    analyticsService.getStats().then(s => {
      setRealStats(s);
      setLoading(false);
    });
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────
  const data = useMemo(() => {
    if (useFake) {
      return {
        total: fakeData.totalAccesses,
        totalQuestionnaires: fakeData.totalQuestionnaires,
        totalUsers: fakeData.totalUsers,
        thisMonth: fakeData.thisMonth,
        thisMonthQuestionnaires: fakeData.thisMonthQuestionnaires,
        last30Days: fakeData.last30Days,
        areaDistribution: fakeData.areaDistribution,
        months: fakeData.months,
        dailyFull: fakeData.dailyHistory,
        weekdayDist: fakeData.weekdayDist,
      };
    }
    if (!realStats) return null;
    const { months, daily, weekdayDist } = processRealData(realStats);
    return {
      total: realStats.total,
      totalQuestionnaires: realStats.totalQuestionnaires,
      totalUsers: realStats.totalUsers,
      thisMonth: realStats.thisMonth,
      thisMonthQuestionnaires: realStats.thisMonthQuestionnaires,
      last30Days: realStats.last30Days,
      areaDistribution: realStats.areaDistribution,
      months,
      dailyFull: daily,
      weekdayDist,
    };
  }, [useFake, fakeData, realStats]);

  // ── Month filter ─────────────────────────────────────────────────────────────
  const activeMonthData = useMemo(() => {
    if (!data) return null;
    if (selectedMonth === null) return null;
    const m = data.months[selectedMonth];
    if (!m) return null;

    const monthStr = `${m.date.getFullYear()}-${String(m.date.getMonth() + 1).padStart(2, '0')}`;
    const days = data.dailyFull
      .filter((d: any) => d.date.startsWith(monthStr))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
    const peak = days.reduce((max: any, d: any) => (d.count > (max?.count ?? 0) ? d : max), null);

    return { ...m, days, peak };
  }, [data, selectedMonth]);

  // Trend vs previous month
  const monthTrend = useMemo(() => {
    if (!data || data.months.length < 2) return undefined;
    const last = data.months[data.months.length - 1];
    const prev = data.months[data.months.length - 2];
    if (!prev.acessos) return undefined;
    return Math.round(((last.acessos - prev.acessos) / prev.acessos) * 100);
  }, [data]);

  const conversionRate = data && data.total
    ? ((data.totalQuestionnaires / data.total) * 100).toFixed(1)
    : '0.0';

  const avgDaily = data && data.dailyFull?.length
    ? Math.round(data.dailyFull.reduce((s: number, d: any) => s + d.count, 0) / data.dailyFull.length)
    : 0;

  const peakDay = data?.dailyFull?.length
    ? data.dailyFull.reduce((max: any, d: any) => (d.count > (max?.count ?? 0) ? d : max), null)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  const pieData = data
    ? Object.entries(data.areaDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([name, value]) => ({ name, value: value as number }))
    : [];

  return (
    <div className="space-y-6">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Acessos Totais" value={fmt(data?.total ?? 0)}
          // sub={`Este mês: ${fmt(data?.thisMonth ?? 0)}`}
          sub={""}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          color="blue" trend={monthTrend}
        />
        <KpiCard
          title="Questionários" value={fmt(data?.totalQuestionnaires ?? 0)}
          // sub={`Este mês: ${fmt(data?.thisMonthQuestionnaires ?? 0)}`}
          sub={""}
          icon={<FileText className="h-5 w-5 text-white" />}
          color="green"
        />
        <KpiCard
          title="Pessoas Ajudadas" value={fmt(data?.totalUsers ?? 0)}
          sub="Receberam diagnóstico"
          icon={<div/>}
          color="purple"
        />
        <KpiCard
          title="Últimos 30 Dias" value={fmt(data?.last30Days ?? 0)}
          sub="Acessos recentes"
          icon={<div/>}
          color="orange"
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-4 w-4 text-cyan-600" />
              <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wide">Taxa de Conversão</p>
            </div>
            <p className="text-3xl font-black text-cyan-600">{conversionRate}%</p>
            <p className="text-xs text-cyan-700 mt-1">Visitas → Diagnósticos</p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-white">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-rose-600" />
              <p className="text-xs font-semibold text-rose-800 uppercase tracking-wide">Média Diária</p>
            </div>
            <p className="text-3xl font-black text-rose-600">{fmt(avgDaily)}</p>
            <p className="text-xs text-rose-700 mt-1">Acessos por dia</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Pico de Acessos</p>
            </div>
            <p className="text-3xl font-black text-amber-600">{peakDay ? fmt(peakDay.count) : '—'}</p>
            <p className="text-xs text-amber-700 mt-1">
              {peakDay ? new Date(peakDay.date).toLocaleDateString('pt-BR') : 'Sem dados'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-teal-600" />
              <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Áreas Distintas</p>
            </div>
            <p className="text-3xl font-black text-teal-600">{Object.keys(data?.areaDistribution ?? {}).length}</p>
            <p className="text-xs text-teal-700 mt-1">Categorias jurídicas</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Monthly trend chart ── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Evolução Mensal
              </CardTitle>
              <CardDescription>Acessos e questionários por mês (clique num mês para detalhar)</CardDescription>
            </div>
            {selectedMonth !== null && (
              <Button size="sm" variant="outline" onClick={() => setSelectedMonth(null)}>
                ✕ Limpar filtro de mês
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(!data?.months || data.months.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <BarChart3 className="h-12 w-12 mb-2" />
              <p className="text-sm">Sem dados mensais ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={data.months}
                onClick={(e) => {
                  if (e?.activeTooltipIndex !== undefined) {
                    setSelectedMonth(
                      selectedMonth === e.activeTooltipIndex ? null : e.activeTooltipIndex
                    );
                  }
                }}
                className="cursor-pointer"
              >
                <defs>
                  <linearGradient id="colorAcessos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQuest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    fmt(v),
                    name === 'acessos' ? 'Acessos' : 'Questionários',
                  ]}
                />
                <Legend formatter={(v) => v === 'acessos' ? 'Acessos' : 'Questionários'} />
                <Area type="monotone" dataKey="acessos" stroke="#3B82F6" fill="url(#colorAcessos)" strokeWidth={2}
                  dot={(props: any) => {
                    const isSelected = props.index === selectedMonth;
                    return <circle key={props.key} cx={props.cx} cy={props.cy} r={isSelected ? 6 : 3}
                      fill={isSelected ? '#1D4ED8' : '#3B82F6'} stroke="white" strokeWidth={2} />;
                  }}
                />
                <Area type="monotone" dataKey="questionarios" stroke="#10B981" fill="url(#colorQuest)" strokeWidth={2}
                  dot={(props: any) => {
                    const isSelected = props.index === selectedMonth;
                    return <circle key={props.key} cx={props.cx} cy={props.cy} r={isSelected ? 6 : 3}
                      fill={isSelected ? '#047857' : '#10B981'} stroke="white" strokeWidth={2} />;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Month detail panel ── */}
      {selectedMonth !== null && activeMonthData && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="h-5 w-5" />
              Detalhes: {activeMonthData.month.toUpperCase()}
            </CardTitle>
            <CardDescription className="text-blue-700">
              Visão diária do mês selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mini KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Acessos no mês', value: fmt(activeMonthData.acessos) },
                { label: 'Questionários', value: fmt(activeMonthData.questionarios) },
                { label: 'Conversão', value: activeMonthData.acessos ? `${((activeMonthData.questionarios / activeMonthData.acessos) * 100).toFixed(1)}%` : '—' },
                { label: 'Pico do mês', value: activeMonthData.peak ? `${fmt(activeMonthData.peak.count)} (dia ${new Date(activeMonthData.peak.date).getDate()})` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium">{label}</p>
                  <p className="text-xl font-black text-blue-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Daily bar chart */}
            {activeMonthData.days.length > 0 && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={activeMonthData.days} barSize={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#BFDBFE" />
                  <XAxis dataKey="date"
                    tickFormatter={(d) => String(new Date(d).getDate())}
                    tick={{ fontSize: 10 }} label={{ value: 'Dia', position: 'insideBottom', offset: -2, fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    labelFormatter={(d) => new Date(d).toLocaleDateString('pt-BR')}
                    formatter={(v: number, name: string) => [fmt(v), name === 'count' ? 'Acessos' : 'Questionários']}
                  />
                  <Bar dataKey="count" fill="#3B82F6" name="count" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="questionnaires" fill="#10B981" name="questionnaires" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Area distribution + Weekday ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Distribuição por Área Jurídica
            </CardTitle>
            <CardDescription>Questionários respondidos por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-zinc-400">
                <BarChart3 className="h-10 w-10 mb-2" />
                <p className="text-sm">Sem dados de área</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt(v), 'Questionários']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {pieData.map(({ name, value }, i) => {
                    const total = pieData.reduce((s, d) => s + d.value, 0);
                    const pct = total ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs flex-1 text-zinc-700 truncate">{name}</span>
                        <span className="text-xs font-bold text-zinc-900 w-8 text-right">{pct}%</span>
                        <div className="w-20 bg-zinc-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekday distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-600" />
              Acessos por Dia da Semana
            </CardTitle>
            <CardDescription>Padrão de comportamento dos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            {(!data?.weekdayDist || data.weekdayDist.every((d: any) => d.acessos === 0)) ? (
              <div className="flex flex-col items-center py-10 text-zinc-400">
                <Activity className="h-10 w-10 mb-2" />
                <p className="text-sm">Sem dados de dia da semana</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.weekdayDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), 'Acessos']} />
                  <Bar dataKey="acessos" radius={[4, 4, 0, 0]}
                    fill="#8B5CF6"
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent activity (existing) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Atividade Recente (Últimos 14 Dias)
          </CardTitle>
          <CardDescription>Acessos diários com linha de tendência</CardDescription>
        </CardHeader>
        <CardContent>
          {(!data?.dailyFull || data.dailyFull.length === 0) ? (
            <div className="flex flex-col items-center py-10 text-zinc-400">
              <Activity className="h-10 w-10 mb-2" />
              <p className="text-sm">Nenhum acesso registrado ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...data.dailyFull].sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(d) => new Date(d).toLocaleDateString('pt-BR')}
                  formatter={(v: number, name: string) => [fmt(v), name === 'count' ? 'Acessos' : 'Questionários']}
                />
                <Legend formatter={(v) => v === 'count' ? 'Acessos' : 'Questionários'} />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="questionnaires" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Action buttons (existing) ── */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Analytics</CardTitle>
          <CardDescription>Gerenciar dados de estatísticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 justify-start"
              onClick={async () => {
                const stats = await analyticsService.getStats();
                const blob = new Blob([JSON.stringify({
                  totalAccesses: stats.total,
                  totalQuestionnaires: stats.totalQuestionnaires,
                  totalUsers: stats.totalUsers,
                  thisMonth: stats.thisMonth,
                  last30Days: stats.last30Days,
                  areaDistribution: stats.areaDistribution,
                  generatedAt: new Date().toISOString(),
                }, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
            >
              <Download className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Exportar Analytics</div>
                <div className="text-xs text-zinc-600">Baixar dados reais em JSON</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 justify-start border-red-200 text-red-700 hover:bg-red-50"
              onClick={async () => {
                if (confirm('⚠️ Isso irá resetar TODAS as estatísticas. Não pode ser desfeito!\n\nDeseja continuar?')) {
                  await analyticsService.reset();
                  alert('✅ Estatísticas resetadas!');
                  window.location.reload();
                }
              }}
            >
              <AlertCircle className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Resetar Estatísticas</div>
                <div className="text-xs">Limpar todos os dados reais</div>
              </div>
            </Button>
          </div>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 text-sm">
              <strong>Contadores automáticos:</strong> Acessos são incrementados a cada visita na landing page. Questionários são incrementados ao concluir um diagnóstico.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* ── Hidden fake-data toggle ── */}
      <div className="flex justify-center pt-2 pb-4">
        <button
          onClick={() => setUseFake(f => !f)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
            border transition-all duration-300 select-none
            ${useFake
              ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm'
              : 'border-zinc-200 bg-zinc-50 text-zinc-400 hover:text-zinc-500 hover:border-zinc-300'}
          `}
          title="Alternar entre dados reais e demonstração"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          {useFake ? (
            <>
              <span className="w-7 h-4 bg-amber-400 rounded-full relative inline-flex items-center">
                <span className="absolute right-0.5 w-3 h-3 bg-white rounded-full shadow" />
              </span>
              Modo demonstração ativo
            </>
          ) : (
            <>
              <span className="w-7 h-4 bg-zinc-300 rounded-full relative inline-flex items-center">
                <span className="absolute left-0.5 w-3 h-3 bg-white rounded-full shadow" />
              </span>
              Dados reais
            </>
          )}
          {useFake && <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-700 py-0">DEMO</Badge>}
        </button>
      </div>

    </div>
  );
}
