import {requireAdmin} from '@/lib/console/auth';
import {ConsoleShell} from '@/components/console/shell';
export default async function Layout({children}:{children:React.ReactNode}) {await requireAdmin();return <ConsoleShell>{children}</ConsoleShell>;}
