import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, UserMinus, UserPlus, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRelawanList, useRelawanStats, useToggleAktifRelawan } from '@/hooks/useRelawan';
import { getInisialNama } from '@/lib/utils';
import { JABATAN_LABELS } from '@/types';
import type { Relawan, JabatanRelawan } from '@/types';
import { toast } from '@/store/toastStore';
import { usePermission, ReadOnlyBanner } from '@/hooks/PermGuard';

// ─── Avatar color ─────────────────────────────────────────────────────────────

const AV_COLORS = ['bg-blue-600','bg-indigo-600','bg-sky-600','bg-cyan-600','bg-teal-600','bg-violet-600','bg-purple-600'];
function avColor(nama: string) { let h = 0; for (let i = 0; i < nama.length; i++) h = nama.charCodeAt(i) + ((h << 5) - h); return AV_COLORS[Math.abs(h) % AV_COLORS.length]; }

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'data', label: 'Data Relawan' },
  { id: 'absensi', label: 'Absensi' },
  { id: 'shift', label: 'Jadwal Shift' },
  { id: 'gaji', label: 'Penggajihan' },
];

// ─── Jabatan options ──────────────────────────────────────────────────────────

const JAB_OPTIONS = Object.entries(JABATAN_LABELS) as [JabatanRelawan, string][];

// ═══════════════════════════════════════════════════════════════════════════════

export default function DataRelawan() {
  const navigate = useNavigate();
  const sppg = useAuthStore((s) => s.sppg);
  const canEdit = usePermission('sdm.edit_relawan');
  const canToggle = usePermission('sdm.edit_relawan');
  const { data: list = [], isLoading } = useRelawanList(sppg?.id);
  const stats = useRelawanStats(sppg?.id);
  const toggleMut = useToggleAktifRelawan();

  const [tab, setTab] = useState('data');
  const [search, setSearch] = useState('');
  const [filterJab, setFilterJab] = useState<string>('');
  const [showAktif, setShowAktif] = useState(true);

  // Filter
  const filtered = useMemo(() => {
    let arr = list.filter((r) => (showAktif ? r.aktif : !r.aktif));
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((r) => r.nama.toLowerCase().includes(q));
    }
    if (filterJab) arr = arr.filter((r) => r.jabatan === filterJab);
    return arr;
  }, [list, search, filterJab, showAktif]);

  const handleToggle = async (r: Relawan) => {
    const next = !r.aktif;
    if (!confirm(`${next ? 'Aktifkan' : 'Nonaktifkan'} ${r.nama}?`)) return;
    try {
      await toggleMut.mutateAsync({ id: r.id, aktif: next });
      toast.sukses(next ? 'Relawan diaktifkan' : 'Relawan dinonaktifkan');
    } catch { toast.error('Gagal mengubah status'); }
  };

  const dokProgress = (dok: Record<string, boolean>) => {
    const vals = Object.values(dok || {});
    const done = vals.filter(Boolean).length;
    return { done, total: 5, pct: Math.round((done / 5) * 100) };
  };

  // ─── Placeholder tabs ────────────────────────────────────────────────────
  if (tab !== 'data') {
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <TabHeader tab={tab} setTab={setTab} onAdd={() => navigate('/sdm/relawan/baru')} />
        <div className="card p-8 text-center">
          <p className="text-5xl mb-3">🚧</p>
          <p className="font-medium" style={{ color: '#0f172a' }}>{TABS.find((t) => t.id === tab)?.label}</p>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Dalam pengembangan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header + Tabs */}
      <TabHeader tab={tab} setTab={setTab} onAdd={() => navigate('/sdm/relawan/baru')} canAdd={canEdit} />
      {!canEdit && <ReadOnlyBanner message="Role Anda hanya bisa melihat data relawan. Edit & toggle status memerlukan izin Ka. SPPG atau Pengawas Keuangan." />}

      {/* Stats strip */}
      <div className="card-surface p-3 flex flex-wrap gap-4 text-sm" style={{ color: '#475569' }}>
        <span>Total aktif: <strong style={{ color: '#0f172a' }}>{stats.totalAktif}</strong></span>
        <span className="flex items-center gap-1.5">
          Desil 1-2: <strong style={{ color: '#0f172a' }}>{stats.desilSatu + stats.desilDua}</strong> orang ({stats.persentaseDesil}%)
          {stats.memenuhiSyarat
            ? <span className="badge-success">✓ Memenuhi</span>
            : <span className="badge-danger">✗ Kurang</span>
          }
        </span>
        {!stats.memenuhiSyarat && <span className="text-xs" style={{ color: '#991b1b' }}>— kurang dari syarat minimal 30%</span>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
          <input className="input pl-9" placeholder="Cari nama relawan..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select min-w-[160px]" value={filterJab} onChange={(e) => setFilterJab(e.target.value)}>
          <option value="">Semua Jabatan</option>
          {JAB_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
        <button onClick={() => setShowAktif(!showAktif)}
          className={showAktif ? 'btn-secondary text-xs' : 'btn-ghost text-xs'}
          style={!showAktif ? { color: '#991b1b' } : undefined}>
          {showAktif ? 'Tampilkan Nonaktif' : 'Tampilkan Aktif'}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="card overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3" style={{ borderBottom: '0.5px solid #e2e8f0' }}>
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2"><div className="skeleton h-3 w-32" /><div className="skeleton h-2 w-20" /></div>
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium" style={{ color: '#0f172a' }}>{search || filterJab ? 'Tidak ada hasil' : 'Belum ada data relawan'}</p>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
            {search || filterJab ? 'Coba ubah filter pencarian Anda' : 'Tambahkan relawan pertama Anda.'}
          </p>
          {!search && !filterJab && canEdit && (
            <button onClick={() => navigate('/sdm/relawan/baru')} className="btn-primary mt-4"><Plus size={15} /> Tambah Relawan</button>
          )}
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && filtered.length > 0 && (
        <>
          <div className="hidden md:block table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>HP</th>
                  <th>BPJS</th>
                  <th>Desil</th>
                  <th>Dok</th>
                  <th style={{ width: 80 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const dok = dokProgress(r.dokumen);
                  return (
                    <tr key={r.id}>
                      <td style={{ color: '#94a3b8' }}>{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0 ${avColor(r.nama)}`}>
                            {getInisialNama(r.nama)}
                          </div>
                          <span className="font-medium" style={{ color: '#0f172a' }}>{r.nama}</span>
                        </div>
                      </td>
                      <td><span className="badge-info">{JABATAN_LABELS[r.jabatan] || r.jabatan}</span></td>
                      <td style={{ color: '#475569' }}>{r.hp}</td>
                      <td>{r.bpjs_aktif ? <span style={{ color: '#14532d' }}>✅</span> : <span style={{ color: '#991b1b' }}>❌</span>}</td>
                      <td>
                        {r.desil === '1' ? <span className="badge-danger">D1</span>
                          : r.desil === '2' ? <span className="badge-warning">D2</span>
                          : <span style={{ color: '#94a3b8' }}>—</span>}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="w-[60px] h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                            <div className="h-full rounded-full" style={{ width: `${dok.pct}%`, background: dok.pct === 100 ? '#22c55e' : '#3b82f6' }} />
                          </div>
                          <span className="text-[10px]" style={{ color: '#94a3b8' }}>{dok.done}/5</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <button onClick={() => navigate(`/sdm/relawan/${r.id}`)} className="btn-ghost p-1.5" title="Edit"><Pencil size={14} /></button>
                          )}
                          {canToggle && (
                            <button onClick={() => handleToggle(r)} className="btn-ghost p-1.5" title={r.aktif ? 'Nonaktifkan' : 'Aktifkan'}>
                              {r.aktif ? <UserMinus size={14} style={{ color: '#991b1b' }} /> : <UserPlus size={14} style={{ color: '#14532d' }} />}
                            </button>
                          )}
                          {!canEdit && <span className="text-xs text-slate-400 italic px-1">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((r) => {
              const dok = dokProgress(r.dokumen);
              return (
                <div key={r.id} className="card p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${avColor(r.nama)}`}>
                      {getInisialNama(r.nama)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: '#0f172a' }}>{r.nama}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>{JABATAN_LABELS[r.jabatan]}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {r.desil === '1' && <span className="badge-danger">D1</span>}
                      {r.desil === '2' && <span className="badge-warning">D2</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '0.5px solid #e2e8f0' }}>
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#475569' }}>
                      <a href={`https://wa.me/62${r.hp.replace(/^0/, '')}`} target="_blank" rel="noreferrer" style={{ color: '#1e6fbf' }}>{r.hp}</a>
                      <span>{r.bpjs_aktif ? '✅ BPJS' : '❌ BPJS'}</span>
                      <span>Dok {dok.done}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {canEdit && (
                        <button onClick={() => navigate(`/sdm/relawan/${r.id}`)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                      )}
                      {canToggle && (
                        <button onClick={() => handleToggle(r)} className="btn-ghost p-1.5">
                          {r.aktif ? <UserMinus size={14} style={{ color: '#991b1b' }} /> : <UserPlus size={14} style={{ color: '#14532d' }} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab Header sub-component ─────────────────────────────────────────────────

function TabHeader({ tab, setTab, onAdd, canAdd }: { tab: string; setTab: (t: string) => void; onAdd: () => void; canAdd: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-semibold" style={{ color: '#0f172a' }}>Relawan & Absensi</h1>
        <div className="flex gap-1 mt-2 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => t.id === 'absensi' ? navigate('/sdm/absensi') : t.id === 'shift' ? navigate('/sdm/shift') : t.id === 'data' ? navigate('/sdm') : t.id === 'gaji' ? navigate('/sdm/gaji') : setTab(t.id)}
              className="btn-ghost text-xs whitespace-nowrap"
              style={tab === t.id ? { background: '#eff6ff', color: '#1e6fbf', fontWeight: 500 } : undefined}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {canAdd && (
        <button onClick={onAdd} className="btn-primary text-xs self-start sm:self-auto"><Plus size={14} /> Tambah Relawan</button>
      )}
    </div>
  );
}
