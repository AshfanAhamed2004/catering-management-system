import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  SecondaryBtn, KPICard, FilterTabs, EmptyState, SectionCard,
  Avatar, StarRating, Badge, Textarea, PrimaryBtn, GhostBtn, Toast, DangerBtn, PageHeader
} from '../figma_templates/components';

export const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filter, setFilter] = useState('ALL');
  const [responding, setResponding] = useState<number | null>(null);
  const [response, setResponse] = useState('');
  const [toast, setToast] = useState('');

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/staff/feedback');
      setFeedback(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleUpdateStatus = async (id: number, status: string, responseText: string) => {
    try {
      await api.put(`/staff/feedback/${id}`, { status, staff_response: responseText, staffResponse: responseText });
      fetchFeedback();
      setToast(`Feedback marked as ${status.replace('_', ' ')}`);
      setResponding(null);
      setResponse('');
    } catch (err) {
      alert(errorMessage(err) || 'Failed to update feedback');
    }
  };

  
  
  const handleExport = async () => {
    try {
      setToast('Downloading report...');
      const res = await api.get('/staff/feedback/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'feedback_report.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setToast('Report exported successfully!');
    } catch (err) {
      alert(errorMessage(err) || 'Failed to download report');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(`/staff/feedback/${id}`);
      fetchFeedback();
      setToast('Feedback deleted successfully.');
    } catch (err) {
      alert(errorMessage(err) || 'Failed to delete feedback');
    }
  };

  const filtered = feedback.filter(f => filter === 'ALL' || f.status === filter);
  const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '0.0';

  return (
    <AdminLayout title="Customer Feedback">
      {error && <div className="text-red-600 bg-red-50 p-4 rounded mb-6">{error}</div>}
      
      {loading ? (
        <div className="flex items-center justify-center p-20 text-[var(--color-muted)] text-sm">
          <span className="w-4 h-4 border-2 border-[var(--color-muted)]/30 border-t-[var(--color-muted)] rounded-full animate-spin mr-2" />
          Loading feedback...
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          <PageHeader title="Feedback" subtitle="Customer reviews and responses" breadcrumb={['Operations', 'Feedback']}
            action={<SecondaryBtn onClick={handleExport}>Export Report</SecondaryBtn>}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            <KPICard label="Average Rating" value={`★ ${avgRating}`} sub={`${feedback.length} total reviews`} accent="var(--color-gold)" />
            <KPICard label="5-Star Reviews" value={feedback.filter(f => f.rating === 5).length.toString()} sub="outstanding" accent="var(--color-green)" />
            <KPICard label="Pending Review" value={feedback.filter(f => f.status === 'SUBMITTED').length.toString()} accent="var(--color-amber)" />
            <KPICard label="Responded" value={feedback.filter(f => f.status === 'RESPONDED').length.toString()} accent="var(--color-blue)" />
          </div>

          <div className="mb-5">
            <FilterTabs options={['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'RESPONDED', 'RESOLVED']} active={filter} onChange={setFilter} />
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? <EmptyState title="No feedback found" message={`No feedback matches the status ${filter}.`} /> :
              filtered.map(item => (
                <SectionCard key={item.id}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={item.customerName || 'Customer'} size="sm" />
                      <div>
                        <div className="font-medium text-sm text-[var(--color-ink)]">{item.customerName} ({item.customerEmail})</div>
                        <div className="text-[10px] font-mono text-[var(--color-muted)] mb-1">Booking REF-{item.bookingReference}</div>
                        <StarRating value={item.rating} readonly />
                      </div>
                    </div>
                    <Badge label={item.status} />
                  </div>
                  <p className="text-sm text-[var(--color-ink)] leading-relaxed mb-4">"{item.comment}"</p>
                  
                  {item.staff_response || item.staffResponse ? (
                    <div className="bg-[var(--color-bg)] rounded-xl px-4 py-3 border-l-2 border-[var(--color-green)] mb-4">
                      <div className="text-[10px] font-mono text-[var(--color-muted)] mb-1">Staff Response</div>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed">{item.staff_response || item.staffResponse}</p>
                    </div>
                  ) : null}

                                    <div className="border-t border-[var(--color-divider)] pt-4 flex gap-2 items-center flex-wrap w-full">
                    {responding === item.id ? (
                      <div className="space-y-3 w-full">
                        <Textarea
                          rows={3}
                          placeholder="Write a professional response to the client..."
                          value={response}
                          onChange={e => setResponse(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <PrimaryBtn onClick={() => handleUpdateStatus(item.id, 'RESPONDED', response)}>Submit Response</PrimaryBtn>
                          <SecondaryBtn onClick={() => { setResponding(null); setResponse(''); }}>Cancel</SecondaryBtn>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.status === 'SUBMITTED' && (
                            <SecondaryBtn onClick={() => handleUpdateStatus(item.id, 'UNDER_REVIEW', '')}>Mark Under Review</SecondaryBtn>
                        )}
                        {(item.status === 'UNDER_REVIEW' || !item.staff_response && !item.staffResponse) && (
                            <GhostBtn onClick={() => setResponding(item.id)}>Respond to Client</GhostBtn>
                        )}
                        {item.status === 'RESPONDED' && (
                            <GhostBtn onClick={() => { setResponding(item.id); setResponse(item.staff_response || item.staffResponse || ''); }}>Edit Response</GhostBtn>
                        )}
                        {item.status === 'RESPONDED' && (
                            <GhostBtn onClick={() => handleUpdateStatus(item.id, 'RESOLVED', item.staff_response || item.staffResponse)}>Mark Resolved</GhostBtn>
                        )}
                        <DangerBtn onClick={() => handleDelete(item.id)} className="ml-auto">Delete</DangerBtn>
                      </>
                    )}
                  </div>
                </SectionCard>
              ))
            }
          </div>

          {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
        </div>
      )}
    </AdminLayout>
  );
};