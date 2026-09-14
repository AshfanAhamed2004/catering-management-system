import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { useData, LoadState, ErrorNote, Field, PageTitle } from '../components';
import { Feedback, FeedbackInput, Booking } from '../types';

// List of feedback submitted by the customer
export function FeedbackList() {
  const result = useData<Feedback[]>('/feedback');
  return (
    <>
      <PageTitle eyebrow="Your feedback" title="My feedback" />
      <LoadState {...result}>
        {result.data?.length ? (
          <table>
            <thead>
              <tr><th>Booking</th><th>Rating</th><th>Status</th><th>Submitted</th><th>Details</th></tr>
            </thead>
            <tbody>
              {result.data.map(f => (
                <tr key={f.id}>
                  <td>{f.booking_reference}</td>
                  <td>{'★'.repeat(f.rating)}</td>
                  <td>{f.status}</td>
                  <td>{new Date(f.created_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo' })}</td>
                  <td><Link to={`/feedback/${f.id}`}>View ↗</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><p>No feedback submitted yet.</p></div>
        )}
      </LoadState>
    </>
  );
}

// View (and edit if allowed) a single feedback entry
export function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const result = useData<Feedback>(`/feedback/${id}`);
  const [editMode, setEditMode] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const rating = Number((e.currentTarget.elements.namedItem('rating') as HTMLInputElement).value);
    const comment = (e.currentTarget.elements.namedItem('comment') as HTMLInputElement).value;
    if (rating <= 2 && comment.trim() === '') {
      setError('Comment is required for ratings 1 or 2');
      setBusy(false);
      return;
    }
    const payload: FeedbackInput = {
      rating,
      comment,
      categories: (new FormData(e.currentTarget)).getAll('categories') as string[],
    };
    try {
      await api.put(`/feedback/${id}`, payload);
      navigate('/feedback');
    } catch (e) {
      setError(errorMessage(e));
    } finally { setBusy(false); }
  }

  const f = result.data;
  if (!f) return <LoadState {...result}><p>Loading…</p></LoadState>;

  return (
    <>
      <PageTitle eyebrow="Feedback detail" title={f.booking_reference} />
      <LoadState {...result}>
        <div className="panel">
          <p><strong>Rating:</strong> {'★'.repeat(f.rating)}</p>
          <p><strong>Comment:</strong> {f.comment || <em>None</em>}</p>
          <p><strong>Categories:</strong> {f.categories.join(', ')}</p>
          <p><strong>Status:</strong> {f.status}</p>
          {f.staff_response && <p><strong>Staff response:</strong> {f.staff_response}</p>}
          {f.status === 'NEW' && !editMode && (
            <button className="secondary" onClick={() => setEditMode(true)}>Edit feedback</button>
          )}
          {editMode && (
            <form onSubmit={submit} className="panel narrow">
              <Field label="Rating">
                {[1,2,3,4,5].map(v => (
                  <label key={v} style={{marginRight: '0.5rem'}}>
                    <input type="radio" name="rating" value={v} defaultChecked={v===f.rating} required /> {v}
                  </label>
                ))}
              </Field>
              <Field label="Categories (optional)">
                {['FOOD_QUALITY','SERVICE','VENUE','PUNCTUALITY','VALUE_FOR_MONEY','OTHER'].map(cat => (
                  <label key={cat} style={{marginRight: '0.5rem'}}>
                    <input type="checkbox" name="categories" value={cat} defaultChecked={f.categories.includes(cat)} /> {cat.replace('_',' ')}
                  </label>
                ))}
              </Field>
              <Field label="Comment (optional)">
                <textarea name="comment" defaultValue={f.comment || ''} maxLength={2000} rows={4} />
                <small>{2000 - (f.comment?.length || 0)} characters left</small>
              </Field>
              <ErrorNote message={error} />
              <button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            </form>
          )}
        </div>
      </LoadState>
    </>
  );
}

// Submit new feedback for a booking
export function FeedbackForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const bookingResult = useData<Booking>(`/bookings/${bookingId}`);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

    async function submit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setBusy(true);
      setError('');
      const form = e.currentTarget;
      const rating = Number((form.elements.namedItem('rating') as HTMLInputElement).value);
      const comment = (form.elements.namedItem('comment') as HTMLInputElement).value;
      if (rating <= 2 && comment.trim() === '') {
        setError('Comment is required for ratings 1 or 2');
        setBusy(false);
        return;
      }
      const categories = (new FormData(form)).getAll('categories') as string[];
      const payload: FeedbackInput = { rating, comment, categories };
      try {
        await api.post(`/bookings/${bookingId}/feedback`, payload);
        navigate('/feedback');
      } catch (e) {
        setError(errorMessage(e));
      } finally { setBusy(false); }
    }

  const b = bookingResult.data;
  return (
    <>
      <PageTitle eyebrow="Leave feedback" title={b?.reference || 'Feedback'} />
      <LoadState {...bookingResult}>
        {b && (
          <form className="panel narrow" onSubmit={submit}>
            <p><strong>Package:</strong> {b.package_name}</p>
            <p><strong>Event date:</strong> {b.event_date}</p>
            <Field label="Rating (1‑5)">
              {[1,2,3,4,5].map(v => (
                <label key={v} style={{marginRight: '0.5rem'}}>
                  <input type="radio" name="rating" value={v} required /> {v}
                </label>
              ))}
            </Field>
            <Field label="Categories (optional)">
              {['FOOD_QUALITY','SERVICE','VENUE','PUNCTUALITY','VALUE_FOR_MONEY','OTHER'].map(cat => (
                <label key={cat} style={{marginRight: '0.5rem'}}>
                  <input type="checkbox" name="categories" value={cat} /> {cat.replace('_',' ')}
                </label>
              ))}
            </Field>
            <Field label="Comment (optional)">
              <textarea name="comment" maxLength={2000} rows={4} />
              <small>2000 characters max</small>
            </Field>
            <ErrorNote message={error} />
            <button disabled={busy}>{busy ? 'Submitting…' : 'Submit feedback'}</button>
          </form>
        )}
      </LoadState>
    </>
  );
}
