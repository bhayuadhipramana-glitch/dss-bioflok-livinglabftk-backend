import { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import useSensorStore from '../store/sensorStore';

/* ──────────────────────────────────────────────
   Parameter config for the form fields
   (keys match the API contract: temperature, ph, do, nh3)
   ────────────────────────────────────────────── */
const PARAMS = [
  { key: 'temperature', label: 'Suhu', unit: '°C', icon: Thermometer, color: 'text-orange-600', step: '0.1', min: 0, max: 45 },
  { key: 'ph', label: 'pH', unit: '', icon: Droplets, color: 'text-blue-600', step: '0.1', min: 0, max: 14 },
  { key: 'do', label: 'DO', unit: 'mg/L', icon: Wind, color: 'text-teal-600', step: '0.1', min: 0, max: 20 },
  { key: 'nh3', label: 'NH3', unit: 'mg/L', icon: FlaskConical, color: 'text-violet-600', step: '0.01', min: 0, max: 5 },
];

const EMPTY_FORM = { temperature: '', ph: '', do: '', nh3: '' };

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
   Error Banner
   ────────────────────────────────────────────── */
function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">Terjadi Kesalahan</p>
        <p className="text-xs text-red-600 mt-0.5">{message}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        )}
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
   Main Component
   ────────────────────────────────────────────── */
export default function SensorData() {
  const {
    readings,
    isLoading,
    error,
    fetchReadings,
    addReading,
    updateReading,
    deleteReading,
    clearError,
  } = useSensorStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real data from the database on mount
  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  /* ── Form handlers ── */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      pond_id: 1, // default pond per API contract
      temperature: +form.temperature,
      ph: +form.ph,
      do: +form.do,
      nh3: +form.nh3,
    };

    if (editingId !== null) {
      // Update existing — API first, then state
      const result = await updateReading(editingId, payload);
      if (result) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
    } else {
      // Add new — API first, then state
      const result = await addReading(payload);
      if (result) {
        setForm(EMPTY_FORM);
      }
    }
    setIsSubmitting(false);
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setForm({
      temperature: String(record.temperature),
      ph: String(record.ph),
      do: String(record.do),
      nh3: String(record.nh3),
    });
    // Scroll to form on mobile
    document.getElementById('sensor-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const confirmDelete = async (id) => {
    const success = await deleteReading(id);
    if (success) {
      setShowDeleteModal(null);
    }
  };

  const isFormValid =
    form.temperature !== '' && form.ph !== '' && form.do !== '' && form.nh3 !== '';

  // Display records in reverse chronological (newest first for the table)
  const displayRecords = [...readings].reverse();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Data Sensor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Input dan kelola data pembacaan sensor kualitas air
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

        {/* ── Input Form ── */}
        <section
          id="sensor-form"
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {editingId ? 'Edit Data Sensor' : 'Input Data Baru'}
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            {editingId
              ? 'Ubah nilai parameter sensor di bawah ini'
              : 'Masukkan hasil pembacaan sensor kolam bioflok'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {PARAMS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.key}>
                    <label
                      htmlFor={`input-${p.key}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      <Icon className={`w-4 h-4 ${p.color}`} />
                      {p.label}
                      {p.unit && (
                        <span className="text-xs font-normal text-slate-400">
                          ({p.unit})
                        </span>
                      )}
                    </label>
                    <input
                      id={`input-${p.key}`}
                      type="number"
                      step={p.step}
                      min={p.min}
                      max={p.max}
                      value={form[p.key]}
                      onChange={(e) => handleChange(p.key, e.target.value)}
                      placeholder={`Masukkan ${p.label}`}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      required
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                id="sensor-submit-btn"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan…
                  </>
                ) : editingId ? (
                  <>
                    <Check className="w-4 h-4" /> Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Tambah Data
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Batal
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── Data Table ── */}
        <section
          id="sensor-table-section"
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Riwayat Data Sensor</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading ? 'Memuat data…' : `${readings.length} data pembacaan sensor`}
            </p>
          </div>

          {/* Loading skeleton */}
          {isLoading && readings.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Memuat data sensor…</p>
            </div>
          )}

          {/* Desktop table */}
          {!isLoading && displayRecords.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Suhu (°C)
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> pH
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-teal-500" /> DO (mg/L)
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-violet-500" /> NH3 (mg/L)
                      </span>
                    </th>
                    <th className="text-center px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecords.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                    >
                      <td className="px-6 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {formatTimestamp(row.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.temperature}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.ph}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.do}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.nh3}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(row)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(row.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile card list */}
          {!isLoading && displayRecords.length > 0 && (
            <div className="md:hidden divide-y divide-slate-100">
              {displayRecords.map((row) => (
                <div key={row.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {formatTimestamp(row.created_at)}
                    </span>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => startEdit(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(row.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Suhu</p>
                        <p className="text-sm font-bold text-slate-900">{row.temperature}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">pH</p>
                        <p className="text-sm font-bold text-slate-900">{row.ph}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-teal-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">DO</p>
                        <p className="text-sm font-bold text-slate-900">{row.do} mg/L</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-violet-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">NH3</p>
                        <p className="text-sm font-bold text-slate-900">{row.nh3} mg/L</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && readings.length === 0 && !error && (
            <div className="px-6 py-16 text-center">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">
                Belum ada data sensor
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan form di atas untuk menambahkan data pembacaan
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Data?</h3>
                <p className="text-xs text-slate-500">Aksi ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => confirmDelete(showDeleteModal)}
                id="confirm-delete-btn"
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
