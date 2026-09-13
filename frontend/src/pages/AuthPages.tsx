import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { catalogRoles, reviewRoles, useAuth } from '../auth';
import { ErrorNote, Field } from '../components';

export function AuthPage({register = false}: {register?: boolean}) {
  const {login} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (register) await api.post('/auth/register', fields);
      const identity = await login(String(fields.email), String(fields.password));
      const from: unknown = location.state?.from;
      let destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard';
      if ((/^\/(bookings|profile)(\/|\?|$)/.test(destination) && identity.role !== 'CUSTOMER') ||
          (destination.startsWith('/staff/bookings') && !reviewRoles.includes(identity.role)) ||
          (destination.startsWith('/staff/catalog') && !catalogRoles.includes(identity.role)) ||
          (destination.startsWith('/admin') && identity.role !== 'ADMIN')) destination = '/dashboard';
      navigate(destination, {replace: true});
    } catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <div className="auth-layout"><aside><p className="eyebrow">Good food. Good company.</p><h1>Every gathering<br/>starts here.</h1><p>A little planning. A generous table.<br/>A celebration that feels like you.</p><div className="line-art" aria-hidden="true">✳</div></aside><section className="panel"><p className="eyebrow">The Gathering</p><h2>{register ? 'Make yourself at home' : 'Welcome back'}</h2><p>{register ? 'Create an account to plan your next event.' : 'Sign in to manage your bookings.'}</p><form onSubmit={submit}>
    {register && <><Field label="Full name"><input name="full_name" autoComplete="name" required minLength={2} maxLength={120}/></Field><Field label="Mobile number"><input name="mobile_number" autoComplete="tel" type="tel" placeholder="0771234567" pattern="(\+94|0)7[0-9]{8}" required/><small>Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX</small></Field></>}
    <Field label="Email address"><input name="email" type="email" autoComplete="email" required maxLength={254}/></Field>
    <Field label="Password"><input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 10 : 1} maxLength={128}/>{register && <small>At least 10 characters, including a letter and a number.</small>}</Field>
    {register && <Field label="Confirm password"><input name="password_confirmation" type="password" autoComplete="new-password" required maxLength={128}/></Field>}
    <ErrorNote message={error}/><button disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
  </form><p>{register ? 'Already have an account?' : 'New to the table?'} <Link to={register ? '/login' : '/register'} state={location.state}>{register ? 'Sign in' : 'Create an account'}</Link></p>{!register && <Link to="/forgot-password">Forgot your password?</Link>}</section></div>;
}

export function PasswordResetPage() {
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [token, setToken] = useState('');
  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const {data} = await api.post<{message: string; development_token?: string}>('/auth/forgot-password', Object.fromEntries(new FormData(event.currentTarget))); setMessage(data.message); if (data.development_token) setToken(data.development_token); }
    catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  async function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const form = event.currentTarget;
    try { await api.post('/auth/reset-password', Object.fromEntries(new FormData(form))); setToken(''); setMessage('Password updated. You can now sign in with your new password.'); form.reset(); }
    catch(e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <section className="panel narrow"><h1>Reset your password</h1><p>Request a reset, or use a token already provided to you.</p><form onSubmit={request}><Field label="Account email"><input name="email" type="email" autoComplete="email" required/></Field><button disabled={busy}>Request reset</button></form><hr/><form onSubmit={reset}><Field label="Reset token"><input name="token" value={token} onChange={e => setToken(e.target.value)} autoComplete="off" required/></Field><Field label="New password"><input name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128}/><small>At least 10 characters, including a letter and a number.</small></Field><Field label="Confirm new password"><input name="password_confirmation" type="password" autoComplete="new-password" required/></Field><button disabled={busy}>Set new password</button></form><ErrorNote message={error}/>{message && <p role="status" className="notice">{message}</p>}<Link to="/login">Back to sign in</Link></section>;
}
