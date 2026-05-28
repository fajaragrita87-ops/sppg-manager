import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRelawanById, useSaveRelawan } from '@/hooks/useRelawan';
import { formatRupiah } from '@/lib/utils';
import { JABATAN_LABELS, JABATAN_RELAWAN_LIST } from '@/types';
import type { JabatanRelawan } from '@/types';
import AlertBanner from '@/components/ui/AlertBanner';
import { toast } from '@/store/toastStore';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  nama:           z.string().min(2, 'Nama minimal 2 karakter'),
  nik:            z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  jenis_kelamin:  z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin' }),
  usia:           z.coerce.number().min(17, 'Minimal 17 tahun').max(65, 'Maksimal 65 tahun'),
  hp:             z.string().min(10, 'No HP minimal 10 karakter'),
  jabatan:        z.string().min(1, 'Pilih jabatan'),
  desil:          z.enum(['1', '2', 'lainnya'], { required_error: 'Pilih desil' }),
  rate_insentif:  z.coerce.number().min(100000, 'Min Rp 100.000').max(200000, 'Max Rp 200.000'),
  tanggal_mulai:  z.string().optional(),
  bpjs_aktif:     z.boolean(),
  bpjs_no:        z.string().optional(),
  sim_a:          z.boolean(),
  sim_c:          z.boolean(),
  dok_ktp:        z.boolean(),
  dok_ijazah:     z.boolean(),
  dok_skck:       z.boolean(),
  dok_sehat:      z.boolean(),
  dok_narkoba:    z.boolean(),
});

type FormData = z.infer<typeof schema>;

// ═══════════════════════════════════════════════════════════════════════════════

export default function FormRelawan() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'baru';
  const navigate = useNavigate();
  const sppg = useAuthStore((s) => s.sppg);
  const { data: existing, isLoading: loadingExisting } = useRelawanById(isEdit ? id : undefined);
  const saveMut = useSaveRelawan();

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama: '', nik: '', jenis_kelamin: undefined, usia: undefined as any, hp: '',
      jabatan: '', desil: undefined, rate_insentif: 150000, tanggal_mulai: '',
      bpjs_aktif: false, bpjs_no: '', sim_a: false, sim_c: false,
      dok_ktp: false, dok_ijazah: false, dok_skck: false, dok_sehat: false, dok_narkoba: false,
    },
  });

  // Populate form saat edit
  useEffect(() => {
    if (existing) {
      reset({
        nama: existing.nama, nik: existing.nik, jenis_kelamin: existing.jenis_kelamin,
        usia: existing.usia ?? undefined, hp: existing.hp, jabatan: existing.jabatan,
        desil: existing.desil, rate_insentif: existing.rate_insentif,
        tanggal_mulai: existing.tanggal_mulai ?? '',
        bpjs_aktif: existing.bpjs_aktif, bpjs_no: existing.bpjs_no ?? '',
        sim_a: existing.sim_a, sim_c: existing.sim_c,
        dok_ktp: existing.dokumen?.ktp ?? false, dok_ijazah: existing.dokumen?.ijazah ?? false,
        dok_skck: existing.dokumen?.skck ?? false, dok_sehat: existing.dokumen?.sehat ?? false,
        dok_narkoba: existing.dokumen?.narkoba ?? false,
      });
    }
  }, [existing, reset]);

  const jabatan = watch('jabatan');
  const bpjsAktif = watch('bpjs_aktif');
  const rate = watch('rate_insentif');
  const simA = watch('sim_a');
  const simC = watch('sim_c');
  const needsSim = ['distribusi', 'driver'].includes(jabatan);

  const onSubmit = async (formData: FormData) => {
    if (!sppg) return;
    try {
      await saveMut.mutateAsync({
        ...(isEdit ? { id } : {}),
        sppg_id: sppg.id,
        nama: formData.nama,
        nik: formData.nik,
        jenis_kelamin: formData.jenis_kelamin,
        usia: formData.usia,
        hp: formData.hp,
        jabatan: formData.jabatan as JabatanRelawan,
        desil: formData.desil as '1' | '2' | 'lainnya',
        rate_insentif: formData.rate_insentif,
        tanggal_mulai: formData.tanggal_mulai || undefined,
        bpjs_aktif: formData.bpjs_aktif,
        bpjs_no: formData.bpjs_aktif ? formData.bpjs_no : undefined,
        sim_a: formData.sim_a,
        sim_c: formData.sim_c,
        dokumen: {
          ktp: formData.dok_ktp, ijazah: formData.dok_ijazah, skck: formData.dok_skck,
          sehat: formData.dok_sehat, narkoba: formData.dok_narkoba,
        },
        aktif: true,
      });
      toast.sukses(isEdit ? 'Data diperbarui' : 'Relawan ditambahkan');
      navigate('/sdm');
    } catch {
      toast.error('Gagal menyimpan', 'Periksa koneksi internet Anda');
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#e2e8f0', borderTopColor: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/sdm')} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
        <h1 className="font-display text-xl font-semibold" style={{ color: '#0f172a' }}>
          {isEdit ? 'Edit Relawan' : 'Tambah Relawan Baru'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SECTION 1: DATA DIRI */}
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>Data Diri</p>
          <div style={{ borderTop: '0.5px solid #e2e8f0' }} />

          <div>
            <label className="label">Nama Lengkap *</label>
            <input {...register('nama')} className="input" placeholder="Masukkan nama lengkap" />
            {errors.nama && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.nama.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">NIK *</label>
              <input {...register('nik')} className="input" placeholder="16 digit" maxLength={16} />
              {errors.nik && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.nik.message}</p>}
            </div>
            <div>
              <label className="label">Jenis Kelamin *</label>
              <Controller name="jenis_kelamin" control={control} render={({ field }) => (
                <div className="flex gap-2 mt-0.5">
                  {(['L', 'P'] as const).map((g) => (
                    <button key={g} type="button" onClick={() => field.onChange(g)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={field.value === g
                        ? { background: '#eff6ff', border: '0.5px solid #3b82f6', color: '#1e6fbf' }
                        : { background: '#ffffff', border: '0.5px solid #e2e8f0', color: '#475569' }
                      }>
                      {g === 'L' ? '♂ Laki-laki' : '♀ Perempuan'}
                    </button>
                  ))}
                </div>
              )} />
              {errors.jenis_kelamin && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.jenis_kelamin.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Usia *</label>
              <input {...register('usia')} type="number" className="input" placeholder="17-65" min={17} max={65} />
              {errors.usia && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.usia.message}</p>}
            </div>
            <div>
              <label className="label">No. HP / WhatsApp *</label>
              <input {...register('hp')} className="input" placeholder="08123456789" />
              {errors.hp && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.hp.message}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 2: JABATAN */}
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>Jabatan & Penugasan</p>
          <div style={{ borderTop: '0.5px solid #e2e8f0' }} />

          <div>
            <label className="label">Jabatan *</label>
            <select {...register('jabatan')} className="select">
              <option value="">Pilih jabatan...</option>
              {JABATAN_RELAWAN_LIST.map((j) => (
                <option key={j.value} value={j.value}>{j.label} — {j.deskripsi}</option>
              ))}
            </select>
            {errors.jabatan && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.jabatan.message}</p>}
            {needsSim && <p className="text-xs mt-1" style={{ color: '#1e3a5f' }}>ℹ Jabatan ini wajib memiliki SIM</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Desil *</label>
              <select {...register('desil')} className="select">
                <option value="">Pilih...</option>
                <option value="1">Desil 1 (termiskin)</option>
                <option value="2">Desil 2</option>
                <option value="lainnya">Lainnya</option>
              </select>
              {errors.desil && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.desil.message}</p>}
            </div>
            <div>
              <label className="label">Tanggal Mulai</label>
              <input {...register('tanggal_mulai')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Rate Insentif / Hari *</label>
              <input {...register('rate_insentif')} type="number" className="input" step={10000} />
              {errors.rate_insentif && <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{errors.rate_insentif.message}</p>}
              {rate > 0 && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>= {formatRupiah(rate)} per hari hadir</p>}
            </div>
          </div>
        </div>

        {/* SECTION 3: LEGALITAS */}
        <div className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>Legalitas & Dokumen</p>
          <div style={{ borderTop: '0.5px solid #e2e8f0' }} />

          {/* BPJS */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#0f172a' }}>BPJS Ketenagakerjaan</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Sudah terdaftar di BPJS-TK</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input {...register('bpjs_aktif')} type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: bpjsAktif ? '#3b82f6' : '#e2e8f0' }} />
            </label>
          </div>
          {bpjsAktif && (
            <div className="animate-slide-down">
              <label className="label">Nomor BPJS</label>
              <input {...register('bpjs_no')} className="input" placeholder="Masukkan nomor BPJS" />
            </div>
          )}

          {/* SIM */}
          <div className="flex flex-wrap gap-4">
            {(['sim_a', 'sim_c'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input {...register(key)} type="checkbox" className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm" style={{ color: '#0f172a' }}>{key === 'sim_a' ? 'SIM A' : 'SIM C'}</span>
              </label>
            ))}
          </div>

          {needsSim && !simA && !simC && (
            <AlertBanner type="warning" judul="SIM belum dicentang" pesan="Jabatan distribusi/driver wajib memiliki SIM A atau SIM C" />
          )}

          {/* Dokumen */}
          <p className="text-xs font-medium" style={{ color: '#475569' }}>Kelengkapan Dokumen</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'dok_ktp' as const, label: 'KTP' },
              { key: 'dok_ijazah' as const, label: 'Ijazah / Sertifikat' },
              { key: 'dok_skck' as const, label: 'SKCK' },
              { key: 'dok_sehat' as const, label: 'Surat Sehat' },
              { key: 'dok_narkoba' as const, label: 'Bebas Narkoba' },
            ].map((d) => (
              <label key={d.key} className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all" style={{ background: '#fafaf8', border: '0.5px solid #e2e8f0' }}>
                <input {...register(d.key)} type="checkbox" className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-xs" style={{ color: '#0f172a' }}>{d.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/sdm')} className="btn-secondary" disabled={saveMut.isPending}>
            Batal
          </button>
          <button type="submit" className="btn-primary" disabled={saveMut.isPending}>
            {saveMut.isPending ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Menyimpan...</>
            ) : (
              <><Save size={15} /> Simpan Relawan</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
