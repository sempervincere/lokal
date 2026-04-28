'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const fullName = formData.get('fullName') as string;
  const companyName = formData.get('companyName') as string;
  const jobTitle = formData.get('jobTitle') as string;
  const phoneNumber = formData.get('phoneNumber') as string;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: fullName || '',
      companyName: companyName || null,
      jobTitle: jobTitle || null,
      phoneNumber: phoneNumber || null,
    }
  });

  revalidatePath('/dashboard/profile');
  return { success: true };
}
