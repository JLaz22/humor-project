import Link from 'next/link';
import {requireAdmin} from '@/lib/console/auth';
import {resources} from '@/lib/console/resources';
export default async function Admin() {
 const {db}=await requireAdmin();
 const counts=await Promise.all(Object.keys(resources).map(async key=>{const {count,error}=await db.from(key).select('*',{count:'exact',head:true});return {key,count,error};}));
 return <><header className="console-heading"><p className="console-kicker">Behind the punchline</p><h1>Control room</h1><p>Your content, models, and generation activity in one place.</p></header><div className="console-grid">{counts.map(({key,count,error})=><Link className="console-card" href={`/admin/${key}`} key={key}><p className="console-kicker">{resources[key].title}</p><strong className="console-count">{error?'—':count}</strong><p>{error?'Database setup required':resources[key].description}</p><span className="console-arrow">Explore ↗</span></Link>)}</div></>;
}
