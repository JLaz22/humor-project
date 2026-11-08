import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/console/auth";
import { resources, type Field } from "@/lib/console/resources";
import { ActionForm } from "@/components/console/form";
import { deleteResource, saveResource, uploadImage } from "../actions";

function FieldInput({ field, value, options }: { field: Field; value?: unknown; options: Record<string, { id: string; name: string }[]> }) {
  const id = `field-${field.key}`;
  if (field.type === "textarea") return <label htmlFor={id}>{field.label}<textarea id={id} name={field.key} defaultValue={String(value ?? "")} required={field.required} /></label>;
  if (field.type === "checkbox") return <label className="console-check"><input id={id} name={field.key} type="checkbox" defaultChecked={Boolean(value ?? true)} />{field.label}</label>;
  if (field.reference) return <label htmlFor={id}>{field.label}<select id={id} name={field.key} required={field.required} defaultValue={String(value ?? "")}><option value="">Select…</option>{options[field.reference]?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>;
  if (field.type === "select") return <label htmlFor={id}>{field.label}<select id={id} name={field.key} defaultValue={String(value ?? field.options?.[0] ?? "")}>{field.options?.map(option => <option key={option}>{option}</option>)}</select></label>;
  return <label htmlFor={id}>{field.label}<input id={id} name={field.key} type={field.type ?? "text"} defaultValue={String(value ?? "")} required={field.required} /></label>;
}

export default async function ResourcePage({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { resource } = await params; const { edit } = await searchParams; const config = resources[resource];
  if (!config) notFound(); const { db } = await requireAdmin();
  const [{ data: items, error }, references] = await Promise.all([
    db.from(resource).select("*").order("created_at", { ascending: false }).limit(100),
    Promise.all([...new Set(config.fields.map(f => f.reference).filter(Boolean))].map(async table => [table!, (await db.from(table!).select("id,name").order("name")).data ?? []] as const)),
  ]);
  const refMap = Object.fromEntries(references); const editing = items?.find(item => item.id === edit);
  return <><header className="console-heading"><Link className="console-back" href="/admin">← Control room</Link><p className="console-kicker">{config.mode === "read" ? "Observability" : "Manage"}</p><h1>{config.title}</h1><p>{config.description}</p></header>{error ? <p className="console-error">Apply the supplied migration to enable this resource.</p> : <div className="console-split"><section>{config.mode !== "read" && <div className="console-panel"><h2>{editing ? "Edit item" : "New item"}</h2>{resource === "images" && !editing ? <ActionForm action={uploadImage} className="console-form"><label>Image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required /></label><label>Description<input name="alt" required /></label><button className="console-button">Upload image</button></ActionForm> : <ActionForm action={saveResource} className="console-form"><input type="hidden" name="resource" value={resource}/>{editing && <input type="hidden" name="id" value={editing.id}/>} {config.fields.map(field => <FieldInput key={field.key} field={field} value={editing?.[field.key]} options={refMap}/>) }<button className="console-button">{editing ? "Save changes" : "Create"}</button>{editing && <Link href={`/admin/${resource}`}>Cancel</Link>}</ActionForm>}</div>}</section><section className="console-panel"><h2>{items?.length ?? 0} records</h2><div className="console-records">{items?.map(item => <article key={item.id} className="console-record">{item.image_url && <img src={item.image_url} alt=""/>}<div><strong>{item.name ?? item.term ?? item.domain ?? item.email ?? item.model ?? item.content ?? item.input ?? item.url ?? item.id}</strong><p>{item.definition ?? item.description ?? item.response ?? item.prompt ?? item.output ?? item.error ?? item.alt ?? item.status ?? ""}</p><small>{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</small></div>{config.mode !== "read" && <div className="console-row-actions"><Link href={`/admin/${resource}?edit=${item.id}`}>Edit</Link><ActionForm action={deleteResource} confirm="Delete this item?" className="inline-form"><input type="hidden" name="resource" value={resource}/><input type="hidden" name="id" value={item.id}/><button>Delete</button></ActionForm></div>}</article>)}</div></section></div>}</>;
}
