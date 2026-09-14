import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { ErrorNote, Field, LoadState, PageTitle, StatusBadge, useData } from '../components';
import { FeedbackReportOut, StaffFeedbackOut } from '../types';

export function StaffFeedbackQueue() {
  const [params, setParams] = useSearchParams();
  
  const status = params.get('status') || '';
  const rating = params.get('rating') || '';
  const category = params.get('category') || '';
  const fromDate = params.get('fromDate') || '';
  const toDate = params.get('toDate') || '';
  const search = params.get('search') || '';

  const qs = new URLSearchParams();
  if (status) qs.set('status', status);
  if (rating) qs.set('rating', rating);
  if (category) qs.set('category', category);
  if (fromDate) qs.set('fromDate', fromDate);
  if (toDate) qs.set('toDate', toDate);
  if (search) qs.set('search', search);

  const result = useData<StaffFeedbackOut[]>(`/staff/feedback?${qs.toString()}`);

  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState('');

  async function downloadCsv() {
    try {
      setExporting(true);
      setExportError('');
      const res = await api.get(`/staff/feedback/export?${qs.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedback_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setExportError(errorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  return (
    <>
      <PageTitle eyebrow="Customer relations" title="Feedback Management" />
      
      <div className="panel" style={{marginBottom: '2rem'}}>
        <div className="form-row">
          <Field label="Status">
            <select value={status} onChange={e => updateFilter('status', e.target.value)}>
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESPONDED">Responded</option>
              <option value="RESOLVED">Resolved</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
          <Field label="Rating">
            <select value={rating} onChange={e => updateFilter('rating', e.target.value)}>
              <option value="">All</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </Field>
          <Field label="Category">
            <select value={category} onChange={e => updateFilter('category', e.target.value)}>
              <option value="">All</option>
              <option value="FOOD_QUALITY">Food Quality</option>
              <option value="SERVICE">Service</option>
              <option value="VENUE">Venue</option>
              <option value="PUNCTUALITY">Punctuality</option>
              <option value="VALUE_FOR_MONEY">Value for Money</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="Search">
            <input type="text" placeholder="Booking Ref or Name" value={search} onChange={e => updateFilter('search', e.target.value)} />
          </Field>
        </div>
        <div style={{marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <button type="button" className="secondary" onClick={downloadCsv} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <ErrorNote message={exportError} />
        </div>
      </div>

      <LoadState {...result}>
        {result.data?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Categories</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.booking_reference}</strong></td>
                    <td>{f.customer_name}</td>
                    <td>
                      {'★'.repeat(f.rating)}
                      {f.rating <= 2 && <span style={{color: 'var(--color-danger)', marginLeft: '0.5rem', fontWeight: 'bold'}} title="Critical Feedback">⚠</span>}
                    </td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>{f.categories.join(', ')}</td>
                    <td><Link to={`/staff/feedback/${f.id}`}>Review ↗</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <h2>No feedback found</h2>
            <p>Try adjusting your filters or search query.</p>
          </div>
        )}
      </LoadState>
    </>
  );
}

export function StaffFeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const result = useData<StaffFeedbackOut>(`/staff/feedback/${id}`);
  
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [saved, setSaved] = React.useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(''); setSaved(false);
    const form = e.currentTarget;
    const payload = {
      status: (form.elements.namedItem('status') as HTMLSelectElement).value,
      staff_response: (form.elements.namedItem('staff_response') as HTMLTextAreaElement).value,
      categories: (new FormData(form)).getAll('categories') as string[],
    };

    try {
      await api.put(`/staff/feedback/${id}`, payload);
      setSaved(true);
      result.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const f = result.data;

  return (
    <>
      <Link className="back" to="/staff/feedback">← Feedback queue</Link>
      <PageTitle eyebrow="Feedback Review" title={`Booking ${f?.booking_reference || '...'}`} />
      
      <LoadState {...result}>
        {f && (
          <div className="detail-grid">
            <section className="panel">
              <h2>Feedback Details</h2>
              <dl className="details">
                <div><dt>Customer</dt><dd>{f.customer_name}<br/><small>{f.customer_email}</small></dd></div>
                <div><dt>Rating</dt><dd>{'★'.repeat(f.rating)} {f.rating <= 2 && <strong style={{color: 'var(--color-danger)'}}>Critical</strong>}</dd></div>
                <div><dt>Submitted On</dt><dd>{new Date(f.created_at).toLocaleString()}</dd></div>
                <div><dt>Current Status</dt><dd><StatusBadge status={f.status} /></dd></div>
              </dl>
              
              <h3>Customer Comment</h3>
              <p className="preserve">{f.comment || <em>No comment provided.</em>}</p>

              <hr />
              
              <h3>Resolution Workflow</h3>
              <form onSubmit={submit}>
                <Field label="Status">
                  <select name="status" defaultValue={f.status} disabled={f.status === 'ARCHIVED'}>
                    <option value={f.status}>{f.status.replace('_', ' ')}</option>
                    {f.status === 'SUBMITTED' && <option value="UNDER_REVIEW">Under Review</option>}
                    {f.status === 'UNDER_REVIEW' && <option value="RESPONDED">Responded</option>}
                    {f.status === 'RESPONDED' && <option value="RESOLVED">Resolved</option>}
                    {f.status === 'RESOLVED' && <option value="ARCHIVED">Archived</option>}
                  </select>
                </Field>
                
                <Field label="Categories">
                  {['FOOD_QUALITY','SERVICE','VENUE','PUNCTUALITY','VALUE_FOR_MONEY','OTHER'].map(cat => (
                    <label key={cat} style={{marginRight: '1rem'}}>
                      <input type="checkbox" name="categories" value={cat} defaultChecked={f.categories.includes(cat)} /> {cat.replace('_',' ')}
                    </label>
                  ))}
                </Field>

                <Field label="Staff Response / Notes">
                  <textarea name="staff_response" defaultValue={f.staff_response || ''} maxLength={2000} rows={4} placeholder="Internal notes or response to customer..." />
                </Field>

                <ErrorNote message={error} />
                {saved && <p className="notice" role="status">Feedback updated successfully.</p>}
                
                <div className="actions">
                  <button disabled={busy}>{busy ? 'Saving...' : 'Update Feedback'}</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </LoadState>
    </>
  );
}

export function StaffFeedbackReport() {
  const result = useData<FeedbackReportOut>('/staff/feedback/report');

  return (
    <>
      <PageTitle eyebrow="Customer relations" title="Feedback Insights" />
      
      <LoadState {...result}>
        {result.data && (
          <div className="card-grid">
            <div className="panel">
              <h3>Total Feedback</h3>
              <h2>{result.data.total_feedback}</h2>
            </div>
            <div className="panel">
              <h3>Average Rating</h3>
              <h2>{result.data.average_rating.toFixed(1)} / 5.0</h2>
            </div>
            <div className="panel">
              <h3>Critical (1-2 Stars)</h3>
              <h2 style={{color: result.data.low_rating_count > 0 ? 'var(--color-danger)' : 'inherit'}}>
                {result.data.low_rating_count}
              </h2>
            </div>
            <div className="panel">
              <h3>Action Required</h3>
              <h2>{result.data.unresolved_feedback_count}</h2>
              <small>{result.data.submitted_feedback_count} submitted</small>
            </div>
            
            <div className="panel" style={{gridColumn: '1 / -1'}}>
              <h3>Rating Distribution</h3>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                {[5, 4, 3, 2, 1].map(r => (
                  <div key={r} style={{flex: 1, textAlign: 'center', background: 'var(--color-bg-alt)', padding: '1rem', borderRadius: '4px'}}>
                    <strong>{r} Stars</strong>
                    <div style={{fontSize: '1.5rem', marginTop: '0.5rem'}}>{result.data?.rating_distribution[r] || 0}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel" style={{gridColumn: '1 / -1'}}>
              <h3>Category Breakdown</h3>
              <table style={{width: '100%'}}>
                <tbody>
                  {Object.entries(result.data?.category_breakdown || {}).map(([cat, count]) => (
                    <tr key={cat}>
                      <td style={{padding: '0.5rem 0'}}>{cat.replace('_', ' ')}</td>
                      <td style={{textAlign: 'right'}}>{count as number}</td>
                    </tr>
                  ))}
                  {Object.keys(result.data?.category_breakdown || {}).length === 0 && <tr><td>No categorised feedback yet.</td></tr>}
                </tbody>
              </table>
              </div>
              <div className="panel" style={{gridColumn: '1 / -1'}}>
                <h3>Historical Feedback Trends</h3>
                <div style={{display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', marginTop: '2rem'}}>
                  {Object.entries(result.data?.monthly_average_rating || {}).map(([month, avg]) => {
                    const count = result.data?.monthly_feedback_count[month] || 0;
                    const height = `${(avg / 5) * 100}%`;
                    return (
                      <div key={month} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <div style={{width: '100%', display: 'flex', alignItems: 'flex-end', height: '150px', background: 'var(--color-bg-alt)'}}>
                          <div 
                            style={{width: '100%', height, background: 'var(--color-primary)', transition: 'height 0.3s'}} 
                            title={`Month: ${month} | Avg: ${avg.toFixed(1)} | Count: ${count}`}
                          />
                        </div>
                        <small style={{marginTop: '0.5rem', fontSize: '0.75rem'}}>{month}</small>
                        <strong style={{fontSize: '0.875rem'}}>{avg.toFixed(1)}</strong>
                        <span style={{fontSize: '0.75rem', color: 'var(--color-text-light)'}}>({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </LoadState>
    </>
  );
}


