import { useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Droplets,
  Thermometer,
  Wind,
  FlaskConical,
  UtensilsCrossed,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Inbox,
  Loader2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import useSensorStore from '../store/sensorStore';

/* ──────────────────────────────────────────────
   Status theme configuration
   ────────────────────────────────────────────── */
const STATUS_THEME = {
  Optimal: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    bgGlow: 'bg-emerald-400/20',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    textBadge: 'text-white',
    icon: ShieldCheck,
    statusIcon: CheckCircle2,
    ringColor: 'ring-emerald-500/30',
    accentBar: 'bg-emerald-500',
    paramBadgeBg: 'bg-emerald-100',
    paramBadgeText: 'text-emerald-800',
    rekoBg: 'bg-emerald-50',
    rekoBorder: 'border-emerald-300',
    rekoText: 'text-emerald-900',
    rekoAccent: 'text-emerald-700',
  },
  Siaga: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-50',
    bgGlow: 'bg-amber-400/20',
    border: 'border-amber-200',
    text: 'text-amber-900',
    textBadge: 'text-white',
    icon: ShieldAlert,
    statusIcon: AlertTriangle,
    ringColor: 'ring-amber-500/30',
    accentBar: 'bg-amber-500',
    paramBadgeBg: 'bg-amber-100',
    paramBadgeText: 'text-amber-800',
    rekoBg: 'bg-amber-50',
    rekoBorder: 'border-amber-300',
    rekoText: 'text-amber-900',
    rekoAccent: 'text-amber-700',
  },
  Kritis: {
    bg: 'bg-red-600',
    bgLight: 'bg-red-50',
    bgGlow: 'bg-red-400/20',
    border: 'border-red-200',
    text: 'text-red-900',
    textBadge: 'text-white',
    icon: ShieldX,
    statusIcon: XCircle,
    ringColor: 'ring-red-500/30',
    accentBar: 'bg-red-600',
    paramBadgeBg: 'bg-red-100',
    paramBadgeText: 'text-red-800',
    rekoBg: 'bg-red-50',
    rekoBorder: 'border-red-400',
    rekoText: 'text-red-900',
    rekoAccent: 'text-red-700',
  },
};

/* ──────────────────────────────────────────────
   Thresholds for per-parameter status badges
   ────────────────────────────────────────────── */
const THRESHOLDS = {
  temperature: { min: 25, max: 32 },
  ph:          { min: 6.5, max: 8.0 },
  do:          { min: 4.0, max: 10.0 },
  nh3:         { min: 0, max: 0.05 },
};

function getParamStatus(value, key) {
  const t = THRESHOLDS[key];
  if (value === null || value === undefined) return 'Optimal';
  const num = Number(value);
  if (num >= t.min && num <= t.max) return 'Optimal';
  const diff = num < t.min ? t.min - num : num - t.max;
  const range = t.max - t.min;
  return diff > range * 0.5 ? 'Kritis' : 'Siaga';
}

const PARAM_META = [
  { key: 'temperature', label: 'Suhu', unit: '°C', icon: Thermometer, color: 'text-orange-600' },
  { key: 'ph', label: 'pH', unit: '', icon: Droplets, color: 'text-blue-600' },
  { key: 'do', label: 'DO', unit: 'mg/L', icon: Wind, color: 'text-teal-600' },
  { key: 'nh3', label: 'NH3', unit: 'mg/L', icon: FlaskConical, color: 'text-violet-600' },
];

/* ──────────────────────────────────────────────
   Helper: format ISO timestamp → readable
   ────────────────────────────────────────────── */
function formatTimestamp(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString('id-ID', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

/* ──────────────────────────────────────────────
   Parameter status mini-badge
   ────────────────────────────────────────────── */
function ParamStatusBadge({ status }) {
  const t = STATUS_THEME[status];
  if (!t) return null;
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.paramBadgeBg} ${t.paramBadgeText}`}
    >
      {status}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Main Classification Component
   ────────────────────────────────────────────── */
export default function Classification() {
  const { readings, isLoading, error, fetchReadings, clearError } = useSensorStore();

  // Fetch real data on mount
  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  // Use the latest reading (last in chronological array)
  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  // Map API water_condition to theme key (Optimal / Siaga / Kritis)
  const kondisi = latest?.water_condition || 'Optimal';
  const theme = STATUS_THEME[kondisi] || STATUS_THEME.Optimal;
  const ShieldIcon = theme.icon;
  const StatusIcon = theme.statusIcon;

  const recommendation = latest?.recommendation || 'Belum ada rekomendasi. Kirim data sensor untuk mendapatkan analisis.';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              Hasil Klasifikasi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kondisi kualitas air dan rekomendasi pakan berdasarkan pembacaan terakhir
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchReadings}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Gagal Memuat Data</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-xs font-medium text-red-400 hover:text-red-600 px-2 py-1.5 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ── Loading State ── */}
        {isLoading && !latest && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-500">Memuat data klasifikasi…</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!isLoading && !latest && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Belum Ada Data Klasifikasi</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">
              Kirim data pembacaan sensor melalui halaman Data Sensor untuk melihat hasil klasifikasi di sini.
            </p>
          </div>
        )}

        {/* ── Classification Results (only shown when data exists) ── */}
        {latest && (
          <>
            {/* HERO STATUS BADGE */}
            <section
              id="classification-hero"
              className={`relative overflow-hidden rounded-2xl shadow-sm border ${theme.border} mb-6`}
            >
              {/* Glow background */}
              <div className={`absolute inset-0 ${theme.bgGlow}`} />
              <div className={`absolute top-0 left-0 w-full h-1.5 ${theme.accentBar}`} />

              <div className="relative px-6 py-8 sm:px-10 sm:py-10">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Large icon badge */}
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 ${theme.bg} rounded-3xl flex items-center justify-center shadow-lg ring-4 ${theme.ringColor} shrink-0`}
                  >
                    <ShieldIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                  </div>

                  {/* Status text */}
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
                      Kondisi Air Saat Ini
                    </p>
                    <h2
                      className={`text-5xl sm:text-6xl font-black tracking-tight ${theme.text}`}
                    >
                      {kondisi}
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5 justify-center sm:justify-start">
                      <StatusIcon className={`w-4 h-4 ${theme.rekoAccent}`} />
                      Klasifikasi berdasarkan data sensor — {formatTimestamp(latest.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PARAMETER BREAKDOWN */}
            <section
              id="param-breakdown"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
            >
              {PARAM_META.map((p) => {
                const Icon = p.icon;
                const value = latest[p.key];
                const paramStatus = getParamStatus(value, p.key);
                return (
                  <div
                    key={p.key}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col items-center gap-2"
                  >
                    <Icon className={`w-6 h-6 ${p.color}`} />
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {p.label}
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {value}
                      {p.unit && (
                        <span className="text-xs font-semibold text-slate-400 ml-1">
                          {p.unit}
                        </span>
                      )}
                    </p>
                    <ParamStatusBadge status={paramStatus} />
                  </div>
                );
              })}
            </section>

            {/* FEEDING RECOMMENDATION */}
            <section
              id="feeding-recommendation"
              className={`rounded-2xl shadow-sm border-2 ${theme.rekoBorder} ${theme.rekoBg} overflow-hidden`}
            >
              {/* Header bar */}
              <div className={`px-6 py-4 ${theme.bg} flex items-center gap-3`}>
                <UtensilsCrossed className="w-6 h-6 text-white" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Rekomendasi Pakan
                </h2>
              </div>

              {/* Content — large, readable text */}
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <p
                  className={`text-base sm:text-lg leading-relaxed font-semibold ${theme.rekoText}`}
                  style={{ lineHeight: '1.8' }}
                >
                  {recommendation}
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
