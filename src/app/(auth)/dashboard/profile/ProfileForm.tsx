'use client';

import { useState } from 'react';
import { T } from '@/lib/constants/mock-data';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { updateProfile } from './actions';
import { Check, Mail, User, Building2, Briefcase, Phone } from 'lucide-react';

type UserData = {
  fullName: string;
  email: string;
  companyName: string | null;
  jobTitle: string | null;
  phoneNumber: string | null;
};

export function ProfileForm({ user }: { user: UserData }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setSaved(false);
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Account Details Card */}
      <div style={{ background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 20, padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.c100}` }}>Detail Akun</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 8 }}>
              <Mail size={16} color={T.g500} /> Email <span style={{ color: T.g500, fontWeight: 400 }}>(Read-only)</span>
            </div>
            <InputField name="email" value={user.email} readOnly disabled />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 8 }}>
              <User size={16} color={T.g500} /> Nama Lengkap
            </div>
            <InputField name="fullName" defaultValue={user.fullName} placeholder="Contoh: Budi Santoso" required />
          </div>
        </div>
      </div>

      {/* Business Details Card */}
      <div style={{ background: '#fff', border: `1px solid ${T.c200}`, borderRadius: 20, padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.g900, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.c100}` }}>Informasi Bisnis & Kontak</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 8 }}>
                <Building2 size={16} color={T.g500} /> Nama Perusahaan <span style={{ color: T.g500, fontWeight: 400 }}>(Opsional)</span>
              </div>
              <InputField name="companyName" defaultValue={user.companyName || ''} placeholder="Contoh: PT Kopi Maju" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 8 }}>
                <Briefcase size={16} color={T.g500} /> Posisi / Jabatan <span style={{ color: T.g500, fontWeight: 400 }}>(Opsional)</span>
              </div>
              <InputField name="jobTitle" defaultValue={user.jobTitle || ''} placeholder="Contoh: Founder" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: T.g900, marginBottom: 8 }}>
              <Phone size={16} color={T.g500} /> Nomor WhatsApp <span style={{ color: T.g500, fontWeight: 400 }}>(Opsional)</span>
            </div>
            <InputField name="phoneNumber" defaultValue={user.phoneNumber || ''} placeholder="Contoh: +628123456789" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.success, fontSize: 13, fontWeight: 600, background: '#ECFDF5', padding: '8px 16px', borderRadius: 9999 }}>
            <Check size={16} /> Tersimpan
          </div>
        )}
        <Button type="submit" loading={loading} style={{ minWidth: 160, height: 44 }}>Simpan Perubahan</Button>
      </div>

    </form>
  );
}
