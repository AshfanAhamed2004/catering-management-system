import { useEffect, useState, type FormEvent } from 'react';
import { allPages, api, errorMessage } from '../api';
import { useAuth } from '../auth';
import { ErrorNote, Field, LoadState, money, PageTitle, Pager, useData } from '../components';
import type { EventType, MenuItem, Package, Role, User } from '../types';
import { useConfirmation } from '../confirmation';

export function CatalogManagement() {
  const [tab,setTab] = useState<'packages' | 'menu'>('packages');
  const [menus,setMenus] = useState<MenuItem[]>([]); const [packages,setPackages] = useState<Package[]>([]); const [events,setEvents] = useState<EventType[]>([]);
  const [loading,setLoading] = useState(true); const [error,setError] = useState(''); const [version,setVersion] = useState(0);
  const [editing,setEditing] = useState<number | 'new' | null>(null);
  useEffect(() => {let live = true; setLoading(true); setError('');
    Promise.all([allPages<MenuItem>('/staff/menu-items'), allPages<Package>('/staff/packages'), api.get<EventType[]>('/event-types')]).then(([m,p,e]) => {if (live) {setMenus(m); setPackages(p); setEvents(e.data);}}).catch(e => {if (live) setError(errorMessage(e));}).finally(() => {if (live) setLoading(false);});
    return () => {live = false;};
  },[version]);
  const refresh = () => {setEditing(null); setVersion(v => v+1);};
  return <><PageTitle eyebrow="Kitchen workspace" title="Menus & packages"/><div className="tabs"><button className={tab === 'packages' ? '' : 'secondary'} onClick={() => {setTab('packages'); setEditing(null);}}>Catering packages</button><button className={tab === 'menu' ? '' : 'secondary'} onClick={() => {setTab('menu'); setEditing(null);}}>Menu items</button></div><LoadState loading={loading} error={error} reload={refresh}>{editing !== null ? tab === 'menu' ? <MenuForm key={editing} item={menus.find(m => m.id === editing)} done={refresh} cancel={() => setEditing(null)}/> : <PackageForm key={editing} item={packages.find(p => p.id === editing)} menus={menus} events={events} done={refresh} cancel={() => setEditing(null)}/> : <><div className="actions"><button onClick={() => setEditing('new')}>Add {tab === 'menu' ? 'menu item' : 'package'}</button></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>{tab === 'menu' ? 'Category' : 'Price / guest'}</th><th>Availability</th><th>Edit</th></tr></thead><tbody>{tab === 'menu' ? menus.map(m => <tr key={m.id}><td>{m.name}</td><td>{m.category}</td><td>{m.is_active ? 'Active' : 'Inactive'}</td><td><button className="secondary" onClick={() => setEditing(m.id)}>Edit</button></td></tr>) : packages.map(p => <tr key={p.id}><td>{p.name}<small>{p.event_type.name}</small></td><td>{money(p.price_per_person)}</td><td>{!p.is_active ? 'Inactive' : p.menu_items.some(m => !m.is_active) ? 'Hidden: inactive menu item' : 'Active'}</td><td><button className="secondary" onClick={() => setEditing(p.id)}>Edit</button></td></tr>)}</tbody></table>{(tab === 'menu' ? menus : packages).length === 0 && <p className="empty">No {tab === 'menu' ? 'menu items' : 'packages'} yet. Add your first one above.</p>}</div>{tab === 'packages' && <EventForm done={refresh}/>}</>}</LoadState></>;
}
function MenuForm({item,done,cancel}: {item?: MenuItem; done: () => void; cancel: () => void}) {
  const confirm = useConfirmation();
  const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget); const payload = {...Object.fromEntries(form), is_active: form.has('is_active')};
    if (item?.is_active && !payload.is_active && !await confirm('Deactivate this item? Packages containing it will be hidden from customers.')) return;
    setBusy(true); setError('');
    try {if (item) await api.put(`/staff/menu-items/${item.id}`,payload); else await api.post('/staff/menu-items',payload); done();} catch(e) {setError(errorMessage(e));} finally {setBusy(false);}
  }
  return <form className="panel narrow" onSubmit={submit}><h2>{item ? 'Edit menu item' : 'New menu item'}</h2><Field label="Name"><input name="name" defaultValue={item?.name} minLength={2} maxLength={120} required/></Field><Field label="Category"><input name="category" defaultValue={item?.category} minLength={2} maxLength={80} required/></Field><Field label="Description"><textarea name="description" defaultValue={item?.description} maxLength={1000}/></Field><Field label="Dietary information"><input name="dietary_information" defaultValue={item?.dietary_information} maxLength={300}/></Field><label className="check"><input name="is_active" type="checkbox" defaultChecked={item?.is_active ?? true}/>Active</label><ErrorNote message={error}/><div className="actions"><button disabled={busy}>{busy ? 'Saving…' : 'Save menu item'}</button><button className="secondary" type="button" onClick={cancel}>Back</button></div></form>;
}
function PackageForm({item,menus,events,done,cancel}: {item?: Package; menus: MenuItem[]; events: EventType[]; done: () => void; cancel: () => void}) {
  const confirm = useConfirmation();
  const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    const payload = {name: form.get('name'), description: form.get('description'), event_type_id: Number(form.get('event_type_id')), price_per_person: form.get('price_per_person'), minimum_guest_count: Number(form.get('minimum_guest_count')), maximum_guest_count: form.get('maximum_guest_count') ? Number(form.get('maximum_guest_count')) : null, menu_item_ids: form.getAll('menu_item_ids').map(Number), is_active: form.has('is_active')};
    if (item?.is_active && !payload.is_active && !await confirm('Deactivate this package? It will no longer accept new bookings.')) return;
    setBusy(true); setError('');
    try {if (item) await api.put(`/staff/packages/${item.id}`,payload); else await api.post('/staff/packages',payload); done();} catch(e) {setError(errorMessage(e));} finally {setBusy(false);}
  }
  return <form className="panel" onSubmit={submit}><h2>{item ? 'Edit package' : 'New package'}</h2><div className="form-row"><Field label="Name"><input name="name" defaultValue={item?.name} minLength={2} maxLength={120} required/></Field><Field label="Event type"><select name="event_type_id" defaultValue={item?.event_type_id || ''} required><option value="">Choose event type</option>{events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field></div><Field label="Description"><textarea name="description" defaultValue={item?.description} minLength={2} maxLength={2000} required/></Field><div className="form-row"><Field label="Price per guest (LKR)"><input type="number" name="price_per_person" defaultValue={item?.price_per_person} min="0.01" max="9999999999.99" step="0.01" required/></Field><Field label="Minimum guests"><input type="number" name="minimum_guest_count" defaultValue={item?.minimum_guest_count} min={1} max={100000} step={1} required/></Field><Field label="Maximum guests (optional)"><input type="number" name="maximum_guest_count" defaultValue={item?.maximum_guest_count || ''} min={1} max={100000} step={1}/></Field></div><fieldset><legend>Included menu items — select at least one</legend><div className="menu-checks">{menus.map(m => <label className="check" key={m.id}><input type="checkbox" name="menu_item_ids" value={m.id} defaultChecked={item?.menu_items.some(i => i.id === m.id)}/>{m.name}{!m.is_active && ' (inactive)'}</label>)}</div>{menus.length === 0 && <p>Add menu items before creating a package.</p>}<small>Active packages must contain only active menu items.</small></fieldset><label className="check"><input name="is_active" type="checkbox" defaultChecked={item?.is_active ?? true}/>Active</label><ErrorNote message={error}/><div className="actions"><button disabled={busy || !menus.length || !events.length}>{busy ? 'Saving…' : 'Save package'}</button><button type="button" className="secondary" onClick={cancel}>Back</button></div></form>;
}
function EventForm({done}: {done: () => void}) {
  const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {e.preventDefault(); setBusy(true); setError(''); try {await api.post('/staff/event-types',Object.fromEntries(new FormData(e.currentTarget))); done();} catch(e) {setError(errorMessage(e));} finally {setBusy(false);}}
  return <details className="panel"><summary>Add an event type</summary><form onSubmit={submit}><Field label="Event type name"><input name="name" required minLength={2} maxLength={80}/></Field><ErrorNote message={error}/><button disabled={busy}>Add event type</button></form></details>;
}
export function UsersPage() {
  const confirm = useConfirmation();
  const [page,setPage] = useState(0); const result = useData<User[]>(`/admin/users?offset=${page*50}`); const {user} = useAuth();
  const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  async function change(target: User, role: Role, active: boolean) {
    if (!await confirm(`Update access for ${target.email}? Existing sessions will be signed out.`)) return;
    setBusy(true); setError(''); try {await api.put(`/admin/users/${target.id}`,{role, is_active: active}); result.reload();} catch(e) {setError(errorMessage(e));} finally {setBusy(false);}
  }
  return <><PageTitle eyebrow="Administration" title="User access"/><p>Customer and staff identities are kept separate. Your own access must be changed by another administrator.</p><ErrorNote message={error}/><LoadState {...result}><div className="table-wrap"><table><thead><tr><th>Email</th><th>Role</th><th>Account</th></tr></thead><tbody>{result.data?.map(u => <tr key={u.id}><td>{u.email}</td><td>{u.role === 'CUSTOMER' ? 'Customer' : <select aria-label={`Role for ${u.email}`} value={u.role} disabled={busy || u.id === user?.id} onChange={e => change(u,e.target.value as Role,u.is_active)}>{(['ADMIN','SENIOR_CHEF','CUSTOMER_RELATIONS_OFFICER','OPERATIONS_MANAGER','ACCOUNTS_EXECUTIVE'] as Role[]).map(r => <option key={r}>{r}</option>)}</select>}</td><td><button className="secondary" disabled={busy || u.id === user?.id} onClick={() => change(u,u.role,!u.is_active)}>{u.is_active ? 'Deactivate' : 'Reactivate'}</button></td></tr>)}</tbody></table></div><Pager page={page} setPage={setPage} count={result.data?.length || 0}/></LoadState></>;
}
