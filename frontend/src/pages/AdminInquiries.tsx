import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  SecondaryBtn, FilterTabs, EmptyState, SectionCard,
  Badge, Textarea, PrimaryBtn, GhostBtn, Toast, PageHeader, Modal
} from '../figma_templates/components';

export const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filter, setFilter] = useState('ALL');
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState('');

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/inquiries');
      setInquiries(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleReply = async (id: number) => {
    if (!replyText.trim()) return;
    try {
      await api.put('/admin/inquiries/' + id + '/reply', { reply: replyText });
      setToast('Reply sent successfully.');
      setReplyingId(null);
      setReplyText('');
      fetchInquiries();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.put('/admin/inquiries/' + id + '/resolve');
      setToast('Inquiry resolved.');
      fetchInquiries();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this inquiry?')) return;
    try {
      await api.delete('/admin/inquiries/' + id);
      setToast('Inquiry deleted successfully.');
      fetchInquiries();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const filtered = inquiries.filter(i => filter === 'ALL' || i.status === filter);

  return (
    <AdminLayout title="Customer Inquiries">
      <div className="space-y-6">
        <PageHeader 
          title="Customer Inquiries" 
          subtitle="Manage CRM support tickets and client communication"
        />

        <div className="flex justify-between items-center bg-[var(--color-surface)] border-b border-[var(--color-divider)] pb-2 mb-6">
          <FilterTabs 
            options={['ALL', 'OPEN', 'REPLIED', 'RESOLVED']} 
            active={filter} 
            onChange={setFilter} 
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--color-muted)] font-mono">Loading inquiries...</div>
        ) : error ? (
          <div className="p-4 bg-[var(--color-red)] bg-opacity-10 text-[var(--color-red)] rounded-xl border border-[var(--color-red)] border-opacity-20 text-sm">
            {error}
          </div>
        ) : inquiries.length === 0 ? (
          <EmptyState 
            title="No Inquiries Found" 
            message="No support inquiries have been submitted yet." 
          />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[var(--color-muted)]">No inquiries match the selected filter.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(inq => (
              <SectionCard key={inq.id}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge label={inq.status.toLowerCase()} />
                      <span className="text-xs text-[var(--color-muted)] font-mono">
                        {new Date(inq.created_at || inq.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className="font-display font-semibold text-lg text-[var(--color-ink)] mb-1">{inq.subject}</h3>
                    <div className="text-sm text-[var(--color-muted)] mb-3">From: <span className="text-[var(--color-ink)] font-medium">{inq.customerName || inq.customer_name || 'Customer ' + (inq.customerId || inq.customer_id)}</span></div>
                    
                    <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-divider)] mb-4">
                      <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">{inq.message}</p>
                    </div>

                    {inq.reply && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Our Reply</span>
                          {inq.repliedAt || inq.replied_at ? (
                            <span className="font-mono text-[10px] text-[var(--color-gold)] lowercase">{new Date(inq.repliedAt || inq.replied_at).toLocaleString()}</span>
                          ) : null}
                        </h4>
                        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[var(--color-gold)] border-opacity-30">
                          <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">{inq.reply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-2 min-w-[140px]">
                    {inq.status !== 'RESOLVED' && (
                      <>
                        <SecondaryBtn onClick={() => setReplyingId(inq.id)} className="flex-1 text-xs">
                          {inq.status === 'REPLIED' ? 'Edit Reply' : 'Reply'}
                        </SecondaryBtn>
                        <GhostBtn 
                          onClick={() => handleResolve(inq.id)} 
                          className="flex-1 text-xs text-[var(--color-green)] hover:bg-[var(--color-green)] hover:bg-opacity-10"
                        >
                          Mark Resolved
                        </GhostBtn>
                      </>
                    )}
                    <GhostBtn 
                      onClick={() => handleDelete(inq.id)} 
                      className="flex-1 text-xs text-[var(--color-red)] hover:bg-[var(--color-red)] hover:bg-opacity-10"
                    >
                      Delete
                    </GhostBtn>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </div>

      {replyingId && (
        <Modal open={!!replyingId} onClose={() => setReplyingId(null)} title="Reply to Inquiry">
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-muted)] mb-2">Write your response to the customer.</p>
            <Textarea
              value={replyText}
              onChange={(e: any) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              rows={5}
            />
            <div className="flex gap-3 pt-2">
              <PrimaryBtn onClick={() => handleReply(replyingId)} className="flex-1">Send Reply</PrimaryBtn>
              <SecondaryBtn onClick={() => setReplyingId(null)} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </AdminLayout>
  );
};
