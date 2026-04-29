import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { T } from '@/lib/constants/mock-data';
import { ProfileForm } from './ProfileForm';

export default async function BOProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { fullName: true, email: true, companyName: true, jobTitle: true, phoneNumber: true }
  });

  if (!dbUser) return null;

  return (
    <div className="animate-fade-in-up" style={{ flex: 1, overflowY: 'auto', background: T.c50 }}>
      {/* Banner Area */}
      <div style={{ height: 160, background: `linear-gradient(135deg, ${T.p600} 0%, ${T.g900} 100%)`, position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: -40, left: 40, width: 100, height: 100, borderRadius: '50%', background: '#fff', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: T.p600 }}>
            {dbUser.fullName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ padding: '60px 40px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.g900, letterSpacing: '-0.01em' }}>Profil Bisnis</div>
          <div style={{ fontSize: 14, color: T.g500, marginTop: 4 }}>Kelola identitas dan kontak bisnis Anda untuk mempermudah AI memberikan konteks lokal.</div>
        </div>

        <ProfileForm user={dbUser} />
      </div>
    </div>
  );
}
