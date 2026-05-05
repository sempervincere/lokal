/**
 * Script: Create Supabase Auth Accounts
 * 
 * Creates Supabase Auth users via Admin API so they can log in
 * via email/password at the login page.
 * 
 * Usage: npx tsx scripts/create-auth-accounts.ts
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const ACCOUNTS = [
  {
    email: 'admin@lokal.id',
    password: 'adminlokal123',
    fullName: 'LOKAL Admin',
    role: 'ADMIN',
  },
  {
    email: 'christopher@lokal.id',
    password: 'christopherlokal123',
    fullName: 'Christopher BSD',
    role: 'CLUSTER_OWNER',
  },
  {
    email: 'rizky_setiawan@lokal.id',
    password: 'rizkylokal123',
    fullName: 'Rizky Setiawan',
    role: 'CLUSTER_OWNER',
  },
  {
    email: 'business@lokal.id',
    password: 'business123',
    fullName: 'Budi Santoso',
    role: 'BUSINESS_OWNER',
  },
];

async function createUser(account: typeof ACCOUNTS[0]) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'apikey': SERVICE_ROLE as string,
      'Content-Type': 'application/json',
    } as Record<string, string>,
    body: JSON.stringify({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        role: account.role,
      },
    }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`✓  Created: ${account.email} (id: ${data.id})`);
    return { created: true, email: account.email };
  } else {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    if (err.message?.includes('already been registered') || err.message?.includes('duplicate')) {
      console.log(`✓  Already exists: ${account.email}`);
      return { created: false, email: account.email, exists: true };
    }
    console.error(`✗  Failed: ${account.email} — ${err.message || JSON.stringify(err)}`);
    return { created: false, email: account.email, error: err };
  }
}

async function main() {
  console.log('Creating Supabase Auth accounts...\n');

  for (const account of ACCOUNTS) {
    await createUser(account);
  }

  console.log('\nDone! Login credentials:');
  console.log('┌───────────────────────────────────────────────────────────────┐');
  console.log('│ Email                       │ Password              │ Role           │');
  console.log('├───────────────────────────────────────────────────────────────┤');
  for (const a of ACCOUNTS) {
    console.log(`│ ${a.email.padEnd(28)}│ ${a.password.padEnd(22)}│ ${a.role.padEnd(15)}│`);
  }
  console.log('│ dylansius.putra@gmail.com   │ Google OAuth          │ ADMIN          │');
  console.log('└───────────────────────────────────────────────────────────────┘');
}

main().catch(console.error);
