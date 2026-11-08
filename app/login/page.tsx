import Link from 'next/link';
import {GoogleSignIn} from '@/components/google-sign-in';
import {createClient} from '@/lib/supabase/server';
export default async function Login({searchParams}:{searchParams:Promise<{denied?:string}>}) {
 const {denied}=await searchParams;
 const db=await createClient();const {data:{user}}=await db.auth.getUser();
 return <main className="mx-auto max-w-xl px-6 py-24"><p className="eyebrow text-lime">Punchline workspace</p><h1 className="my-6 text-4xl font-bold">A little structure.<br/>A lot more funny.</h1><p className="mb-8 text-zinc-400">Sign in with your administrator account to manage content and build prompt chains.</p>{denied&&<p role="alert" className="mb-6 text-red-300">This account does not have superadmin access. Ask your database administrator to enable it.</p>}{user?<><Link className="primary-cta" href={process.env.APP_MODE==='chains'?'/chains':'/admin'}>Open workspace</Link><form className="mt-6" action="/auth/signout" method="post"><button>Sign out and use another account</button></form></>:<GoogleSignIn/>}</main>;
}
