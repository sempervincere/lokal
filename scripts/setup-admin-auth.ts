/**
 * setup-admin-auth.ts
 * 
 * Creates/updates admin@lokal.id and dylansius.putra@gmail.com in Supabase Auth
 * using the Admin API (service_role key).
 * 
 * Idempotent — safe to run multiple times.
 * 
 * Usage: npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/setup-admin-auth.ts
 */

import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const ADMIN_EMAIL = 'admin@lokal.id';
const ADMIN_PASSWORD = 'adminlokal123';
const ADMIN_NAME = 'LOKAL Admin';
const ADMIN_ROLE = 'ADMIN';

interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
}

async function supabaseAdmin(path: string, options: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase Admin API error ${res.status}: ${body}`);
  }
  return res.json();
}

async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const users = await supabaseAdmin(`/auth/v1/admin/users?filter=email%3A${encodeURIComponent(email)}`);
  if (users && users.users && users.users.length > 0) {
    return users.users[0] as AuthUser;
  }
  return null;
}

async function createUser(email: string, password: string, fullName: string, role: string): Promise<string> {
  const result = await supabaseAdmin('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    }),
  });
  return result.id as string;
}

async function resetPassword(userId: string, newPassword: string): Promise<void> {
  await supabaseAdmin(`/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ password: newPassword }),
  });
}

async function main() {
  console.log('🔐 Setting up Supabase Auth users...\n');

  // ── Admin user ──────────────────────────────────────────────────────────
  console.log(`[1/3] Checking ${ADMIN_EMAIL}...`);
  const existingAdmin = await findUserByEmail(ADMIN_EMAIL);

  if (existingAdmin) {
    console.log(`  ✓ Found in Supabase Auth (${existingAdmin.id})`);
    console.log(`  → Resetting password to "${ADMIN_PASSWORD}"`);
    await resetPassword(existingAdmin.id, ADMIN_PASSWORD);
    console.log(`  ✓ Password reset complete`);
  } else {
    console.log('  → Not found, creating...');
    const id = await createUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_ROLE);
    console.log(`  ✓ Created: ${id} (password: ${ADMIN_PASSWORD})`);
  }

  // ── CO user ─────────────────────────────────────────────────────────────
  const CO_EMAIL = 'dylansius.putra@gmail.com';
  const CO_NAME = 'Dylansius Putra Prasetio';
  const CO_ROLE = 'CLUSTER_OWNER';

  console.log(`\n[2/3] Checking ${CO_EMAIL}...`);
  const existingCo = await findUserByEmail(CO_EMAIL);

  if (existingCo) {
    console.log(`  ✓ Found in Supabase Auth (${existingCo.id})`);
  } else {
    console.log('  → Not found, creating...');
    const id = await createUser(CO_EMAIL, 'lokal123!co', CO_NAME, CO_ROLE);
    console.log(`  ✓ Created: ${id} (password: lokal123!co)`);
  }

  console.log('\n[3/3] ✅ All Supabase Auth users ready.');
  console.log(`\n    Admin login:  ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}`);
  console.log(`    CO login:     ${CO_EMAIL}  /  lokal123!co`);
  console.log('\n👉 Now run: npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts');

  // ── Verify ──────────────────────────────────────────────────────────────
  console.log('\n--- Verification ---');
  const verifyAdmin = await findUserByEmail(ADMIN_EMAIL);
  console.log(`  admin@lokal.id → ${verifyAdmin ? '✅ EXISTS (' + verifyAdmin.id + ')' : '❌ MISSING'}`);
  const verifyCo = await findUserByEmail(CO_EMAIL);
  console.log(`  dylansius.putra@gmail.com → ${verifyCo ? '✅ EXISTS (' + verifyCo.id + ')' : '❌ MISSING'}`);
}

main().catch((e) => {
  console.error('❌ Setup failed:', e.message);
  process.exit(1);
});
