import { useState, useEffect } from 'react';
import { ClientLayout } from '../components/ClientLayout';
import { api, errorMessage } from '../api';
import {
  Modal, FormField, Input, Select, Textarea,
  PrimaryBtn, SecondaryBtn, DangerBtn, Toast,
  StarRating, Badge, SectionCard, KPICard
} from '../figma_templates/components';

export const ClientDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [toast, setToast] = useState('');

  // Edit Modal State
  const [editBooking, setEditBooking] = useState<any>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('18:00');
  const [editLocation, setEditLocation] = useState('');
  const [editGuests, setEditGuests] = useState<number | string>(200);
  const [editPackageId, setEditPackageId] = useState<number | string>(1);

  // Cancel Modal State
  const [cancelId, setCancelId] = useState<number | null>(null);

  // Feedback Modal State
  const [feedbackForm, setFeedbackForm] = useState<number | null>(null); // booking_id
  const [editingFeedbackId, setEditingFeedbackId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [bRes, fRes, pRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/feedback'),
        api.get('/packages')
      ]);
      setBookings(bRes.data);
      setFeedbackList(fRes.data);
      setPackages(pRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPackageName = (pkgId: number) => {
    const p = packages.find(x => x.id === pkgId);
    return p ? p.name : 'Custom Package';
  };

  const getPackagePrice = (pkgId: number) => {
    const p = packages.find(x => x.id === pkgId);
    return p ? p.price_per_person : 0;
  };

  // Actions
  const openEdit = (b: any) => {
    setEditBooking(b);
    setEditDate(b.event_date || '');
    setEditTime(b.event_time ? b.event_time.substring(0,5) : '18:00');
    setEditLocation(b.event_location || '');
    setEditGuests(b.guest_count || 200);
    setEditPackageId(b.package_id || 1);
  };

  const submitEdit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await api.put(`/bookings/${editBooking.id}`, {
        event_date: editDate,
        event_time: editTime + ':00',
        guest_count: Number(editGuests),
        event_location: editLocation,
        package_id: Number(editPackageId)
      });
      setEditBooking(null);
      setToast('Booking updated successfully.');
      fetchData();
    } catch(err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const executeCancel = async () => {
    if (!cancelId) return;
    try {
      await api.post(`/bookings/${cancelId}/cancel`);
      setToast('Booking cancelled successfully.');
      setCancelId(null);
      fetchData();
    } catch(err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const openNewFeedback = (bookingId: number) => {
    setEditingFeedbackId(null);
    setFeedbackForm(bookingId);
    setRating(5);
    setComment('');
    setCategories([]);
  };

  const openEditFeedback = (f: any) => {
    setEditingFeedbackId(f.id);
    setFeedbackForm(f.booking_id);
    setRating(f.rating);
    setComment(f.comment);
    setCategories(f.categories || []);
  };

  const submitFeedback = async () => {
    try {
      if (editingFeedbackId) {
        await api.put(`/feedback/${editingFeedbackId}`, { rating, comment, categories });
        setToast('Feedback updated successfully.');
      } else {
        await api.post(`/bookings/${feedbackForm}/feedback`, { rating, comment, categories });
        setToast('Feedback submitted. Thank you!');
      }
      setFeedbackForm(null);
      setEditingFeedbackId(null);
      fetchData();
    } catch(err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const executeDeleteFeedback = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      setToast('Feedback deleted.');
      fetchData();
    } catch(err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const isPast = (dateStr: string) => new Date(dateStr) < new Date();
  const upcoming = bookings.filter(b => !isPast(b.event_date));
  const past = bookings.filter(b => isPast(b.event_date));
  const displayedBookings = activeTab === 'upcoming' ? upcoming : past;

  return (
    <ClientLayout title="Welcome back">
      <div className="space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard label="Upcoming Events" value={upcoming.length.toString()} sub="+1 this month" accent="var(--color-gold)" />
          <KPICard label="Past Events" value={past.length.toString()} accent="var(--color-ink)" />
          <KPICard label="Reviews left" value={feedbackList.length.toString()} accent="var(--color-green)" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[var(--color-divider)]">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'upcoming' ? 'text-[var(--color-ink)]' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'}`}
          >
            Upcoming Bookings
            {activeTab === 'upcoming' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-ink)] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'past' ? 'text-[var(--color-ink)]' : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'}`}
          >
            Past Bookings
            {activeTab === 'past' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-ink)] rounded-t-full" />}
          </button>
        </div>

        {/* Bookings List */}
        {displayedBookings.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-divider)]">
              <svg width="24" height="24" fill="none" stroke="currentColor" className="text-[var(--color-muted)]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-2">No {activeTab} bookings</h3>
            <p className="text-sm text-[var(--color-muted)] mb-6 max-w-sm mx-auto">You don't have any {activeTab} events scheduled with us.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayedBookings.map(b => (
              <div key={b.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold)]">{b.reference || `REF-${b.id}`}</div>
                      <Badge label={b.status} />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-1">{getPackageName(b.package_id)}</h3>
                    <div className="text-sm text-[var(--color-muted)] flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>{b.event_date} at {b.event_time}</span>
                      <span className="flex items-center gap-1.5"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{b.guest_count} guests</span>
                      <span className="flex items-center gap-1.5"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>{b.event_location}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-semibold text-xl text-[var(--color-ink)]">Rs. {Number(b.estimated_total || b.estimatedTotal || (b.guest_count * getPackagePrice(b.package_id))).toLocaleString()}</div>
                    <div className="text-[10px] font-mono text-[var(--color-muted)]">estimated total</div>
                  </div>
                </div>
                <div className="border-t border-[var(--color-divider)] px-5 py-3 flex items-center gap-2 bg-[var(--color-bg)]">
                  {b.status === 'PENDING' && (
                    <>
                      <button onClick={() => openEdit(b)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded hover:bg-[var(--color-gold)] hover:text-white transition-colors">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        Edit Details
                      </button>
                      <span className="text-[var(--color-border)]">•</span>
                      <button onClick={() => setCancelId(b.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[var(--color-red)]/10 text-[var(--color-red)] rounded hover:bg-[var(--color-red)] hover:text-white transition-colors">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Cancel Booking
                      </button>
                      <span className="ml-auto text-xs text-[var(--color-muted)] font-mono">Awaiting approval</span>
                    </>
                  )}
                  {b.status === 'COMPLETED' && (
                    <>
                      {feedbackList.find(f => f.booking_id === b.id) ? (
                        <span className="text-xs text-[var(--color-green)] font-mono">✓ Feedback submitted</span>
                      ) : (
                        <button onClick={() => openNewFeedback(b.id)} className="text-xs text-[var(--color-gold)] hover:underline font-mono">Leave Feedback</button>
                      )}
                    </>
                  )}
                  {b.status === 'CANCELLED' && (
                    <span className="text-xs text-[var(--color-muted)] font-mono">This booking was cancelled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback section */}
        {feedbackList.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display font-semibold text-xl text-[var(--color-ink)] mb-4">Your Reviews</h2>
            <div className="space-y-4">
              {feedbackList.map(fb => (
                <SectionCard key={fb.id}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-xs font-mono text-[var(--color-muted)] mb-1">Booking #{fb.booking_id} • {(fb.categories || []).join(', ')}</div>
                      <StarRating value={fb.rating} readonly />
                    </div>
                    <div className="flex items-center gap-2">
                      {(!fb.status || fb.status === 'SUBMITTED') && (
                        <button onClick={() => openEditFeedback(fb)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded hover:bg-[var(--color-gold)] hover:text-white transition-colors">
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          Edit
                        </button>
                      )}
                      <button onClick={() => executeDeleteFeedback(fb.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider bg-[var(--color-red)]/10 text-[var(--color-red)] rounded hover:bg-[var(--color-red)] hover:text-white transition-colors">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Delete
                      </button>
                      <Badge label={fb.status || 'SUBMITTED'} />
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-ink)] leading-relaxed mb-3">"{fb.comment}"</p>
                  {fb.staff_response && (
                    <div className="bg-[var(--color-bg)] rounded-xl px-4 py-3 border-l-2 border-[var(--color-green)]">
                      <div className="text-[10px] font-mono text-[var(--color-muted)] mb-1">Response from Smart Serve Catering</div>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed">{fb.staff_response}</p>
                    </div>
                  )}
                </SectionCard>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit booking modal */}
      {editBooking && (
        <Modal open={!!editBooking} onClose={() => setEditBooking(null)} title={`Edit Booking #${editBooking.id}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Event Date" required><Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} /></FormField>
              <FormField label="Event Time" required><Input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} /></FormField>
            </div>
            <FormField label="Event Location" required><Input value={editLocation} onChange={e => setEditLocation(e.target.value)} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Guest Count"><Input type="number" value={editGuests} onChange={e => setEditGuests(e.target.value)} /></FormField>
              <FormField label="Package">
                <Select value={editPackageId} onChange={e => setEditPackageId(e.target.value)}>
                  {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </FormField>
            </div>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submitEdit} className="flex-1">Save Changes</PrimaryBtn>
              <SecondaryBtn onClick={() => setEditBooking(null)} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel confirm */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelId(null)} />
          <div className="relative bg-[var(--color-surface)] rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-2">Cancel booking?</h3>
            <p className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">This will cancel booking #{cancelId}. Please note our cancellation policy applies.</p>
            <div className="flex gap-3">
              <SecondaryBtn onClick={() => setCancelId(null)} className="flex-1">Keep Booking</SecondaryBtn>
              <DangerBtn onClick={executeCancel} className="flex-1">Cancel Booking</DangerBtn>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {feedbackForm && (
        <Modal open={!!feedbackForm} onClose={() => { setFeedbackForm(null); setEditingFeedbackId(null); }} title={editingFeedbackId ? "Edit Feedback" : "Leave Feedback"}>
          <div className="space-y-4">
            <FormField label="Your Rating">
              <div className="py-1">
                <StarRating value={rating} onChange={setRating} />
              </div>
            </FormField>
            <FormField label="Categories">
              <div className="flex flex-wrap gap-2">
                {['FOOD_QUALITY', 'SERVICE', 'VENUE', 'PUNCTUALITY', 'VALUE_FOR_MONEY', 'OTHER'].map(cat => (
                  <label key={cat} className="flex items-center gap-1.5 cursor-pointer bg-[var(--color-bg)] px-2 py-1.5 rounded border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-[var(--color-gold)]"
                      checked={categories.includes(cat)} 
                      onChange={e => {
                        if (e.target.checked) setCategories([...categories, cat]);
                        else setCategories(categories.filter(c => c !== cat));
                      }} 
                    />
                    <span className="text-xs text-[var(--color-ink)]">{cat.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </FormField>
            <FormField label="Your Comments">
              <Textarea rows={4} placeholder="Share your experience with us..." value={comment} onChange={e => setComment(e.target.value)} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={submitFeedback} className="flex-1">Submit Feedback</PrimaryBtn>
              <SecondaryBtn onClick={() => { setFeedbackForm(null); setEditingFeedbackId(null); }} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
    </ClientLayout>
  );
};
