import Link from 'next/link';
import { ThemeSelect } from './theme';
import { resources } from '@/lib/console/resources';
export function ConsoleShell({children,studio=false}:{children:React.ReactNode;studio?:boolean}) {
 return <div className="console"><aside className="console-sidebar"><Link href={studio?'/chains':'/admin'} className="console-brand">Punchline<span>{studio?'CHAIN STUDIO':'CONTROL ROOM'}</span></Link><p className="console-kicker">Workspace</p><nav><Link href="/admin">Overview</Link><Link href="/chains">Chain studio ↗</Link>{!studio && Object.entries(resources).map(([key,r])=><Link key={key} href={`/admin/${key}`}>{r.title}</Link>)}</nav><div className="console-sidebar-bottom"><ThemeSelect/><Link href="/">Public app ↗</Link><form action="/auth/signout" method="post"><button>Sign out</button></form></div></aside><main className="console-main"><div className="console-topbar"><span>WORKSPACE / {studio?'PROMPT CHAINS':'ADMINISTRATION'}</span><span className="console-badge">Superadmin</span></div>{children}</main></div>;
}
