'use client';
import {useActionState} from 'react';
export type ActionResult={error?:string;success?:string};
export function ActionForm({action,children,className,confirm}:{action:(state:ActionResult,form:FormData)=>Promise<ActionResult>;children:React.ReactNode;className?:string;confirm?:string}) {
 const [state,formAction,pending]=useActionState(action,{});
 return <form className={className} action={formAction} onSubmit={e=>{if(confirm && !window.confirm(confirm))e.preventDefault();}}><fieldset disabled={pending}>{children}</fieldset>{pending&&<p role="status">Working…</p>}{state.error&&<p role="alert" className="console-error">{state.error}</p>}{state.success&&<p role="status" className="console-success">{state.success}</p>}</form>;
}
