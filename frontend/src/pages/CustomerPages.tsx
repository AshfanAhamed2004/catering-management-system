import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { catalogRoles, reviewRoles, useAuth } from '../auth';
import { ErrorNote, Field, LoadState, PageTitle, useData } from '../components';
import type { Profile } from '../types';

export function Dashboard() {
  const {user} = useAuth();
  return <><PageTitle eyebrow="Your account" title="Welcome to the table"/><p className="intro">{user?.email}</p><div className="card-grid">{user?.role === 'CUSTOMER' && <><section className="panel"><h2>Your next gathering</h2><p>Explore the menus and send us your event details.</p><Link className="button" to="/packages">Browse packages</Link></section><section className="panel"><h2>Keep track</h2><p>See your booking references, details and review status.</p><Link className="button secondary" to="/bookings">My bookings</Link></section><section className="panel"><h2>My feedback</h2><p>Review the feedback you have submitted for past events.</p><Link className="button" to="/feedback">My feedback ↗</Link></section><section className="panel"><h2>A little about you</h2><p>Keep your contact information up to date.</p><Link className="button secondary" to="/profile">Manage profile</Link></section></>}{user && catalogRoles.includes(user.role) && <section className="panel"><h2>Menus & packages</h2><p>Maintain the dishes, prices and packages customers can choose.</p><Link className="button" to="/staff/catalog">Manage catalog</Link></section>}{user && reviewRoles.includes(user.role) && <><section className="panel"><h2>Booking requests</h2><p>Review event details and approve or reject requests.</p><Link className="button" to="/staff/bookings">Review bookings</Link></section><section className="panel"><h2>Feedback Management</h2><p>Review customer feedback and generate reports.</p><div style={{display: 'flex', gap: '0.5rem'}}><Link className="button" to="/staff/feedback">Queue</Link><Link className="button secondary" to="/staff/feedback/report">Insights</Link></div></section></>}{user?.role === 'ADMIN' && <section className="panel"><h2>User access</h2><p>Maintain staff roles and account availability.</p><Link className="button" to="/admin/users">Manage users</Link></section>}</div>{user && ['OPERATIONS_MANAGER','ACCOUNTS_EXECUTIVE'].includes(user.role) && <p className="empty">Your account is active. Tools for your role will be available in a later development phase.</p>}</>;
}
export function ProfilePage() {
  const result = useData<Profile>('/customers/me/profile');
  return <><PageTitle eyebrow="Your account" title="Your details"/><LoadState {...result}>{result.data && <ProfileForm profile={result.data}/>}</LoadState></>;
}
function ProfileForm({profile}: {profile: Profile}) {
  const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [saved,setSaved] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try { await api.put('/customers/me/profile', Object.fromEntries(new FormData(e.currentTarget))); setSaved(true); }
    catch(e) {setError(errorMessage(e));} finally {setBusy(false);}
  }
  return <form className="panel narrow" onSubmit={submit}><Field label="Full name"><input name="full_name" defaultValue={profile.full_name} autoComplete="name" required minLength={2} maxLength={120}/></Field><Field label="Mobile number"><input name="mobile_number" defaultValue={profile.mobile_number} autoComplete="tel" type="tel" pattern="(\+94|0)7[0-9]{8}" required/><small>07XXXXXXXX or +947XXXXXXXX</small></Field><Field label="Address (optional)"><textarea name="address" defaultValue={profile.address || ''} autoComplete="street-address" maxLength={500}/></Field><ErrorNote message={error}/>{saved && <p role="status" className="notice">Your profile has been updated.</p>}<button disabled={busy}>{busy ? 'Saving…' : 'Save details'}</button></form>;
}
