import { useState } from 'react';
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Check,
  Shield,
  ShieldCheck,
  Mail,
  Search,
} from 'lucide-react';
import Navbar from '../components/Navbar';

/* ──────────────────────────────────────────────
   Static demo data (no backend logic)
   ────────────────────────────────────────────── */
const INITIAL_USERS = [
  { id: 1, nama: 'Dr. I Wayan Suarjana',  email: 'suarjana@undiksha.ac.id',  role: 'Admin',    status: 'Aktif' },
  { id: 2, nama: 'Ni Luh Putu Arimbi',    email: 'arimbi@undiksha.ac.id',    role: 'Operator', status: 'Aktif' },
  { id: 3, nama: 'I Made Agus Wirawan',    email: 'agus.wirawan@undiksha.ac.id', role: 'Operator', status: 'Aktif' },
  { id: 4, nama: 'Kadek Dwi Bagus Pramana', email: 'dwi.bagus@undiksha.ac.id', role: 'Viewer',  status: 'Nonaktif' },
  { id: 5, nama: 'Putu Sri Lestari',       email: 'sri.lestari@undiksha.ac.id', role: 'Operator', status: 'Aktif' },
  { id: 6, nama: 'I Gede Mahardika',       email: 'mahardika@undiksha.ac.id',  role: 'Viewer',   status: 'Nonaktif' },
];

const ROLES = ['Admin', 'Operator', 'Viewer'];

const ROLE_THEME = {
  Admin:    { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: ShieldCheck },
  Operator: { bg: 'bg-violet-100', text: 'text-violet-800', icon: Shield },
  Viewer:   { bg: 'bg-slate-100',  text: 'text-slate-700',  icon: Shield },
};

const STATUS_THEME = {
  Aktif:    { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  Nonaktif: { bg: 'bg-red-100',     text: 'text-red-800',     dot: 'bg-red-500' },
};

const EMPTY_FORM = { nama: '', email: '', role: 'Operator', status: 'Aktif' };

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [search, setSearch] = useState('');

  /* ── Filtered users ── */
  const filtered = users.filter(
    (u) =>
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Counters ── */
  const activeCount = users.filter((u) => u.status === 'Aktif').length;
  const inactiveCount = users.filter((u) => u.status === 'Nonaktif').length;

  /* ── Handlers ── */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId !== null) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...form } : u))
      );
      setEditingId(null);
    } else {
      setUsers((prev) => [{ id: Date.now(), ...form }, ...prev]);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({ nama: user.nama, email: user.email, role: user.role, status: user.status });
    setShowForm(true);
    document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const confirmDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setShowDeleteModal(null);
  };

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
          : u
      )
    );
  };

  const isFormValid = form.nama.trim() !== '' && form.email.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page title + action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Manajemen Pengguna
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola akun pengguna sistem monitoring
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) cancelForm();
            }}
            id="add-user-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        </div>

        {/* ── Summary counters ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total</p>
              <p className="text-xl font-extrabold text-slate-900">{users.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Aktif</p>
              <p className="text-xl font-extrabold text-emerald-700">{activeCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Nonaktif</p>
              <p className="text-xl font-extrabold text-red-700">{inactiveCount}</p>
            </div>
          </div>
        </div>

        {/* ── Add/Edit Form (collapsible) ── */}
        {showForm && (
          <section
            id="user-form"
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              {editingId ? 'Ubah informasi pengguna' : 'Isi data pengguna baru di bawah ini'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Nama */}
                <div>
                  <label htmlFor="input-nama" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    id="input-nama"
                    type="text"
                    value={form.nama}
                    onChange={(e) => handleChange('nama', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="input-email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="input-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@undiksha.ac.id"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                {/* Role */}
                <div>
                  <label htmlFor="input-role" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Role
                  </label>
                  <select
                    id="input-role"
                    value={form.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {/* Status */}
                <div>
                  <label htmlFor="input-status" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Status
                  </label>
                  <select
                    id="input-status"
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  id="user-submit-btn"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {editingId ? (
                    <><Check className="w-4 h-4" /> Simpan Perubahan</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Tambah Pengguna</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Batal
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── User Table ── */}
        <section
          id="user-table-section"
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          {/* Header + Search */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daftar Pengguna</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length} pengguna ditemukan
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="user-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pengguna..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const role = ROLE_THEME[user.role];
                  const status = STATUS_THEME[user.status];
                  const RoleIcon = role.icon;
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-900">{user.nama}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${role.bg} ${role.text}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className="cursor-pointer"
                          title="Klik untuk ubah status"
                        >
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${status.bg} ${status.text}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                            {user.status}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(user)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(user.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((user) => {
              const role = ROLE_THEME[user.role];
              const status = STATUS_THEME[user.status];
              const RoleIcon = role.icon;
              return (
                <div key={user.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{user.nama}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => startEdit(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(user.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${role.bg} ${role.text}`}
                    >
                      <RoleIcon className="w-3 h-3" />
                      {user.role}
                    </span>
                    <button onClick={() => toggleStatus(user.id)} className="cursor-pointer">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${status.bg} ${status.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {user.status}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">
                Tidak ada pengguna ditemukan
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Coba ubah kata kunci pencarian
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
                <h3 className="text-base font-bold text-slate-900">Hapus Pengguna?</h3>
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
                id="confirm-delete-user-btn"
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
