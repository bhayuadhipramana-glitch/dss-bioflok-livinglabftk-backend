import { useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
  Inbox,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useSensorStore from '../store/sensorStore';

/* ──────────────────────────────────────────────
   KPI card configuration (visual tokens only)
   ────────────────────────────────────────────── */
const KPI_CONFIG = [
  {
    id: 'kpi-suhu',
    key: 'temperature',
    label: 'Suhu',
    unit: '°C',
    icon: Thermometer,
    color: 'text-orange-600',
    bgGradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    thresholds: { min: 25, max: 32 }, // optimal range for biofloc
  },
  {
    id: 'kpi-ph',
    key: 'ph',
    label: 'pH',
    unit: '',
    icon: Droplets,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    thresholds: { min: 6.5, max: 8.0 },
  },
  {
    id: 'kpi-do',
    key: 'do',
    label: 'DO',
    unit: 'mg/L',
    icon: Wind,
    color: 'text-teal-600',
    bgGradient: 'from-teal-50 to-emerald-50',
    borderColor: 'border-teal-200',
    thresholds: { min: 4.0, max: 10.0 },
  },
  {
    id: 'kpi-nh3',
    key: 'nh3',
    label: 'NH3',
    unit: 'mg/L',
    icon: FlaskConical,
    color: 'text-violet-600',
    bgGradient: 'from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
    thresholds: { min: 0, max: 0.05 },
  },
];

/* ──────────────────────────────────────────────
   Helper: determine status from thresholds
   ────────────────────────────────────────────── */
function getStatus(value, thresholds) {
  if (value === null || value === undefined) return 'optimal';
  const num = Number(value);
  if (num >= thresholds.min && num <= thresholds.max) return 'optimal';
  const diff = num < thresholds.min
    ? thresholds.min - num
    : num - thresholds.max;
  const range = thresholds.max - thresholds.min;
  return diff > range * 0.5 ? 'kritis' : 'siaga';
}

const STATUS_STYLE = {
  optimal: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  siaga:   { bg: 'bg-amber-100',   text: 'text-amber-800' },
  kritis:  { bg: 'bg-red-100',     text: 'text-red-800' },
};

const STATUS_LABEL = {
  optimal: 'Optimal',
  siaga: 'Siaga',
  kritis: 'Kritis',
};

/* ──────────────────────────────────────────────
   Helper: format ISO timestamp → HH:mm
   ────────────────────────────────────────────── */
function formatTime(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/* ──────────────────────────────────────────────
   Build KPI data from live readings
   ────────────────────────────────────────────── */
function buildKpiCards(readings) {
  const latest = readings.length > 0 ? readings[readings.length - 1] : null;
  const prev   = readings.length > 1 ? readings[readings.length - 2] : null;

  return KPI_CONFIG.map((cfg) => {
    const currentVal = latest ? Number(latest[cfg.key]) : 0;
    const prevVal    = prev   ? Number(prev[cfg.key])   : currentVal;
    const delta      = currentVal - prevVal;
    const trendDir   = delta >= 0 ? 'up' : 'down';
    const status     = getStatus(currentVal, cfg.thresholds);
    const style      = STATUS_STYLE[status];

    return {
      ...cfg,
      value: latest ? currentVal.toFixed(cfg.key === 'nh3' ? 2 : 1) : '-',
      trend: (delta >= 0 ? '+' : '') + delta.toFixed(cfg.key === 'nh3' ? 3 : 1),
      trendDir,
      status,
      statusBg: style.bg,
      statusText: style.text,
    };
  });
}

/* ──────────────────────────────────────────────
   Custom recharts tooltip (preserved from original)
   ────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
          {entry.dataKey === 'suhu' ? '°C' : ''}
          {entry.dataKey === 'do_val' ? ' mg/L' : ''}
          {entry.dataKey === 'nh3' ? ' mg/L' : ''}
        </p>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   KPI Card component (preserved from original)
   ────────────────────────────────────────────── */
function KpiCard({ card }) {
  const Icon = card.icon;
  const TrendIcon = card.trendDir === 'up' ? TrendingUp : TrendingDown;

  return (
    <div
      id={card.id}
      className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl shadow-sm border ${card.borderColor} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm ${card.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${card.statusBg} ${card.statusText}`}
        >
          {STATUS_LABEL[card.status]}
        </span>
      </div>

      {/* Value */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-0.5">{card.label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {card.value}
          </span>
          {card.unit && (
            <span className="text-sm font-semibold text-slate-500">{card.unit}</span>
          )}
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
        <TrendIcon className={`w-3.5 h-3.5 ${card.trendDir === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
        <span className={card.trendDir === 'up' ? 'text-emerald-600' : 'text-red-600'}>
          {card.trend}
        </span>
        <span className="text-slate-400 ml-1">dari pembacaan terakhir</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Skeleton loaders (pulse animation)
   ────────────────────────────────────────────── */
function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="w-16 h-5 rounded-full bg-slate-200" />
      </div>
      <div>
        <div className="w-12 h-3 rounded bg-slate-200 mb-2" />
        <div className="w-24 h-8 rounded bg-slate-200" />
      </div>
      <div className="w-32 h-3 rounded bg-slate-200" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-36 h-5 rounded bg-slate-200 mb-2" />
          <div className="w-52 h-3 rounded bg-slate-200" />
        </div>
        <div className="flex gap-4">
          <div className="w-20 h-4 rounded bg-slate-200" />
          <div className="w-16 h-4 rounded bg-slate-200" />
        </div>
      </div>
      <div className="w-full h-[340px] rounded-xl bg-slate-100" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Error toast banner
   ────────────────────────────────────────────── */
function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm animate-in fade-in">
      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">Gagal Memuat Data</p>
        <p className="text-xs text-red-600 mt-0.5">{message}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Coba Lagi
        </button>
        <button
          onClick={onDismiss}
          className="text-xs font-medium text-red-400 hover:text-red-600 px-2 py-1.5 transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Empty state
   ────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700">Belum Ada Data Sensor</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">
        Kirim data pembacaan sensor melalui halaman Input Data untuk melihat grafik di sini.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Dashboard Component
   ────────────────────────────────────────────── */
export default function Dashboard() {
  const { readings, isLoading, error, fetchReadings, clearError } = useSensorStore();

  // Fetch on mount
  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  // Derive KPI cards from live data
  const kpiCards = buildKpiCards(readings);

  // Transform readings → chart data shape for Recharts
  const trendData = readings.map((r) => ({
    waktu: formatTime(r.created_at),
    suhu: Number(r.temperature),
    pH: Number(r.ph),
  }));

  const doNh3Data = readings.map((r) => ({
    waktu: formatTime(r.created_at),
    do_val: Number(r.do),
    nh3: Number(r.nh3),
  }));

  const hasData = readings.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── Page Content ── */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Dashboard Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau kondisi kualitas air kolam bioflok secara real-time
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <ErrorBanner
            message={error}
            onRetry={fetchReadings}
            onDismiss={clearError}
          />
        )}

        {/* ── KPI Cards Grid ── */}
        <section id="kpi-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </>
          ) : hasData ? (
            kpiCards.map((card) => (
              <KpiCard key={card.id} card={card} />
            ))
          ) : (
            !error && <EmptyState />
          )}
        </section>

        {/* ── Trend Chart: Suhu & pH ── */}
        {isLoading ? (
          <ChartSkeleton />
        ) : hasData && (
          <section
            id="trend-chart-section"
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tren Suhu &amp; pH</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Data pembacaan sensor terbaru
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  Suhu (°C)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  pH
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={340}>
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis
                  dataKey="waktu"
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="suhu"
                  orientation="left"
                  domain={[26, 33]}
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: '°C',
                    position: 'top',
                    offset: 14,
                    style: { fontSize: 11, fontWeight: 600, fill: '#ea580c' },
                  }}
                />
                <YAxis
                  yAxisId="ph"
                  orientation="right"
                  domain={[6, 8]}
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'pH',
                    position: 'top',
                    offset: 14,
                    style: { fontSize: 11, fontWeight: 600, fill: '#2563eb' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
                />
                <Line
                  yAxisId="suhu"
                  type="monotone"
                  dataKey="suhu"
                  name="Suhu"
                  stroke="#ea580c"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ea580c', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 3 }}
                />
                <Line
                  yAxisId="ph"
                  type="monotone"
                  dataKey="pH"
                  name="pH"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* ── Trend Chart: DO & NH3 ── */}
        {isLoading ? (
          <ChartSkeleton />
        ) : hasData && (
          <section
            id="do-nh3-chart-section"
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tren DO &amp; NH3</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dissolved Oxygen &amp; Ammonia
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-500" />
                  DO (mg/L)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-violet-500" />
                  NH3 (mg/L)
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={340}>
              <LineChart
                data={doNh3Data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis
                  dataKey="waktu"
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="do"
                  orientation="left"
                  domain={[0, 12]}
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'mg/L',
                    position: 'top',
                    offset: 14,
                    style: { fontSize: 11, fontWeight: 600, fill: '#14b8a6' },
                  }}
                />
                <YAxis
                  yAxisId="nh3"
                  orientation="right"
                  domain={[0, 0.1]}
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'mg/L',
                    position: 'top',
                    offset: 14,
                    style: { fontSize: 11, fontWeight: 600, fill: '#8b5cf6' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
                />
                <Line
                  yAxisId="do"
                  type="monotone"
                  dataKey="do_val"
                  name="DO"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 3 }}
                />
                <Line
                  yAxisId="nh3"
                  type="monotone"
                  dataKey="nh3"
                  name="NH3"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}
      </main>
    </div>
  );
}
