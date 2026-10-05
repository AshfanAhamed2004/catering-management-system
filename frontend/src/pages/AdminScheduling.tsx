import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  PageHeader, PrimaryBtn, FilterTabs, TableShell, TH, TD, Avatar, Badge,
  GhostBtn, Modal, FormField, Input, Select, SecondaryBtn, Textarea, Toast, EmptyState
} from '../figma_templates/components';

export interface ScheduleOut {
  id: number;
  bookingId: number;
  bookingReference: string;
  staffId: number;
  staffName: string;
  staffRole: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
}

export const AdminScheduling = () => {
  const [schedules, setSchedules] = useState<ScheduleOut[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  
  // Form fields
  const [bookingId, setBookingId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('SCHEDULED');

  const [formError, setFormError] = useState('');

  // Filters
  const [filter, setFilter] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [filterStaff, setFilterStaff] = useState('');

  const fetchSchedules = async () => {
    try {
      let url = '/staff/schedules';
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterStaff) params.append('staffId', filterStaff);
      
      const res = await api.get(`${url}?${params.toString()}`);
      setSchedules(res.data);
    } catch (err) {
      setError(errorMessage(err) || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const formatBookingLabel = (b: any) => {
    const ref = b.reference || `REF-${b.id}`;
    const date = b.event_date || b.eventDate;
    const location = b.event_location || b.eventLocation;
    const guests = b.guest_count || b.guestCount;
    const status = b.status;

    const parts = [ref];
    if (date) parts.push(date);
    if (location) parts.push(location);
    if (guests) parts.push(`${guests} guests`);
    if (status) parts.push(status);
    return parts.join(' • ');
  };

  const fetchOptions = async () => {
    setLoadingBookings(true);
    setBookingError('');
    try {
      const [bookingsRes, staffRes] = await Promise.allSettled([
        api.get('/staff/schedules/booking-options'),
        api.get('/staff/schedules/staff-options')
      ]);

      if (bookingsRes.status === 'fulfilled') {
        setBookings(Array.isArray(bookingsRes.value.data) ? bookingsRes.value.data : []);
      } else {
        const msg = errorMessage(bookingsRes.reason) || 'Failed to load booking options';
        setBookingError(msg);
        console.warn('Could not fetch bookings:', bookingsRes.reason);
      }

      if (staffRes.status === 'fulfilled') {
        setStaffList(Array.isArray(staffRes.value.data) ? staffRes.value.data : []);
      } else {
        console.warn('Could not fetch users:', staffRes.reason);
      }
    } catch (err) {
      console.error(err);
      setBookingError('Failed to load scheduling options');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [filterDate, filterStaff]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setBookingId('');
    setStaffId('');
    setShiftDate('');
    setStartTime('');
    setEndTime('');
    setNotes('');
    setStatus('SCHEDULED');
    setFormError('');
    fetchOptions();
    setShowModal(true);
  };

  const openEditModal = (s: any) => {
    setEditId(s.id);
    setBookingId(String(s.bookingId || s.booking_id));
    setStaffId(String(s.staffId || s.staff_id));
    setShiftDate(s.shiftDate || s.shift_date);
    setStartTime(s.startTime || s.start_time);
    setEndTime(s.endTime || s.end_time);
    setNotes(s.notes || '');
    setStatus(s.status || 'SCHEDULED');
    setFormError('');
    fetchOptions();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!editId && !bookingId) {
      setFormError('Please select an eligible booking.');
      return;
    }
    if (!editId && !staffId) {
      setFormError('Please select a staff member.');
      return;
    }
    try {
      if (editId) {
        await api.put(`/staff/schedules/${editId}`, {
          shift_date: shiftDate, shiftDate: shiftDate,
          start_time: startTime, startTime: startTime,
          end_time: endTime, endTime: endTime,
          notes,
          status
        });
        setToast('Schedule updated.');
      } else {
        await api.post('/staff/schedules', {
          booking_id: Number(bookingId), bookingId: Number(bookingId),
          staff_id: Number(staffId), staffId: Number(staffId),
          shift_date: shiftDate, shiftDate: shiftDate,
          start_time: startTime, startTime: startTime,
          end_time: endTime, endTime: endTime,
          notes
        });
        setToast('Schedule created.');
      }
      setShowModal(false);
      fetchSchedules();
    } catch (err) {
      setFormError(errorMessage(err) || 'Failed to save schedule');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this schedule permanently?')) return;
    try {
      await api.delete(`/staff/schedules/${id}`);
      setToast('Schedule deleted.');
      fetchSchedules();
    } catch (err) {
      setToast('Failed to delete: ' + errorMessage(err));
    }
  };

  const filtered = schedules.filter(e => filter === 'ALL' || (e.status || 'SCHEDULED') === filter);

  return (
    <AdminLayout title="Staff Scheduling">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Staff Scheduling"
          subtitle="Manage event assignments"
          breadcrumb={['Logistics', 'Scheduling']}
          action={<PrimaryBtn onClick={openAddModal}>+ Add Schedule</PrimaryBtn>}
        />

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs options={['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED']} active={filter} onChange={setFilter} />
          
          <div className="ml-auto flex gap-2">
            <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <Select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
              <option value="">All Staff</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name || s.fullName || s.email}</option>)}
            </Select>
          </div>
        </div>
        
        {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl mb-4 text-sm font-medium">{error}</div>}

        <TableShell>
          <thead>
            <tr>
              <TH>Staff Member</TH>
              <TH>Booking</TH>
              <TH>Date</TH>
              <TH>Time</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-[var(--color-muted)]">Loading schedules...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title="No schedules" message="No matching schedules found." /></td></tr>
            ) : filtered.map(e => (
              <tr key={e.id} className="hover:bg-[var(--color-bg)] transition-colors">
                <TD>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={(e as any).staffName || (e as any).staff_name || `Staff #${e.staffId || (e as any).staff_id}`} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-[var(--color-ink)] whitespace-nowrap">{(e as any).staffName || (e as any).staff_name || `Staff #${e.staffId || (e as any).staff_id}`}</div>
                      <div className="text-[10px] font-mono text-[var(--color-gold)]">{(e as any).staffRole || (e as any).staff_role || 'Staff'}</div>
                    </div>
                  </div>
                </TD>
                <TD>
                  <div className="text-sm text-[var(--color-ink)] truncate max-w-[150px]">{(e as any).bookingReference || (e as any).booking_reference || `REF-${e.bookingId || (e as any).booking_id}`}</div>
                  <div className="text-[10px] font-mono text-[var(--color-muted)]">Booking #{e.bookingId || (e as any).booking_id}</div>
                </TD>
                <TD><span className="font-mono text-sm text-[var(--color-ink)] whitespace-nowrap">{(e as any).shiftDate || (e as any).shift_date}</span></TD>
                <TD><span className="font-mono text-sm text-[var(--color-muted)] whitespace-nowrap">{(e as any).startTime || (e as any).start_time} - {(e as any).endTime || (e as any).end_time}</span></TD>
                <TD><Badge label={e.status || 'SCHEDULED'} /></TD>
                <TD>
                  <div className="flex gap-1">
                    <GhostBtn onClick={() => openEditModal(e)}>Edit</GhostBtn>
                    <GhostBtn onClick={() => handleDelete(e.id)} className="text-[var(--color-red)]">Delete</GhostBtn>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </TableShell>

        {showModal && (
          <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Schedule" : "Create Schedule"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <div className="text-red-500 text-sm mb-4">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Booking" required>
                  <Select
                    value={bookingId}
                    onChange={e => setBookingId(e.target.value)}
                    disabled={!!editId || loadingBookings || (!editId && !bookingError && bookings.length === 0)}
                    required
                  >
                    {loadingBookings ? (
                      <option value="">Loading bookings...</option>
                    ) : bookingError ? (
                      <option value="">{bookingError || 'Failed to load bookings'}</option>
                    ) : bookings.length === 0 ? (
                      <option value="">No eligible bookings available</option>
                    ) : (
                      <>
                        <option value="">Select Booking</option>
                        {bookings.map(b => (
                          <option key={b.id} value={String(b.id)}>
                            {formatBookingLabel(b)}
                          </option>
                        ))}
                      </>
                    )}
                    {editId && bookingId && !bookings.some(b => String(b.id) === String(bookingId)) && (
                      <option value={bookingId}>
                        {(() => {
                          const cur = schedules.find(s => s.id === editId);
                          const ref = cur?.bookingReference || (cur as any)?.booking_reference;
                          return ref ? `${ref} (Booking #${bookingId})` : `Booking #${bookingId}`;
                        })()}
                      </option>
                    )}
                  </Select>
                  {bookingError && !editId && (
                    <div className="text-xs text-[var(--color-red)] mt-1.5 flex items-center gap-1">
                      <span>✕</span>
                      <span>{bookingError}</span>
                    </div>
                  )}
                  {!loadingBookings && !bookingError && bookings.length === 0 && !editId && (
                    <div className="text-xs text-[var(--color-muted)] mt-1.5">
                      No eligible bookings available for scheduling.
                    </div>
                  )}
                </FormField>
                <FormField label="Staff Member" required>
                  <Select value={staffId} onChange={e => setStaffId(e.target.value)} disabled={!!editId} required>
                    <option value="">Select Staff</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name || s.fullName || s.email}</option>)}
                  </Select>
                </FormField>
              </div>

              <FormField label="Shift Date" required>
                <Input type="date" value={shiftDate} onChange={e => setShiftDate(e.target.value)} required />
              </FormField>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start Time" required>
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </FormField>
                <FormField label="End Time" required>
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </FormField>
              </div>

              {editId && (
                <FormField label="Status" required>
                  <Select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="SCHEDULED">Scheduled</option>
                    
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Select>
                </FormField>
              )}

              <FormField label="Notes">
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional instructions..." rows={2} />
              </FormField>

              <div className="flex gap-3 pt-2">
                <PrimaryBtn type="submit" className="flex-1">{editId ? 'Save Changes' : 'Create Schedule'}</PrimaryBtn>
                <SecondaryBtn type="button" onClick={() => setShowModal(false)} className="flex-1">Cancel</SecondaryBtn>
              </div>
            </form>
          </Modal>
        )}

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};
