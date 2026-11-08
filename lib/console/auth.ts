import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export async function requireAdmin() {
 const db = await createClient();
 const {data:{user}} = await db.auth.getUser();
 if (!user) redirect('/login');
 const {data:profile,error} = await db.from('profiles').select('is_superadmin').eq('id',user.id).single();
 if(error || profile?.is_superadmin !== true) redirect('/login?denied=1');
 return {db,user};
}
