import { useState, useEffect } from 'react';
import { ClientLayout } from '../components/ClientLayout';
import { api, errorMessage } from '../api';
import {
  Modal, FormField, Input, Textarea,
  PrimaryBtn, SecondaryBtn, Toast, Badge, SectionCard, GhostBtn, DangerBtn
} from '../figma_templates/components';

export const ClientInquiries = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inquiries');
      setInquiries(res.data);
    } catch (err) {
      setToast('Error loading inquiries: ' + errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const openNewModal = () => {
    setIsEditing(false);
    setEditId(null);
    setSubject('');
    setMessage('');
    setShowModal(true);
  };

  const openEditModal = (inq: any) => {
    setIsEditing(true);
    setEditId(inq.id);
    setSubject(inq.subject);
    setMessage(inq.message);
    setSelectedInquiry(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    try {
      if (isEditing && editId) {
        await api.put('/inquiries/' + editId, { subject: subject.trim(), message: message.trim() });
        setToast('Inquiry updated successfully.');
      } else {
        await api.post('/inquiries', { subject: subject.trim(), message: message.trim() });
        setToast('Inquiry submitted successfully.');
      }
      setShowModal(false);
      setSubject('');
      setMessage('');
      fetchInquiries();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await api.delete('/inquiries/' + id);
      setToast('Inquiry deleted successfully.');
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  return (
    <ClientLayout title="Support Inquiries">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-muted)]">
            Need help? Open an inquiry and our support team will get back to you.
          </p>
          <PrimaryBtn onClick={openNewModal}>+ New Inquiry</PrimaryBtn>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--color-muted)]">Loading...</div>
        ) : inquiries.length === 0 ? (
          <SectionCard>
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-4 text-[var(--color-muted)]">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <h3 className="font-display font-medium text-[var(--color-ink)] mb-1">No inquiries yet</h3>
              <p className="text-sm text-[var(--color-muted)] max-w-sm mb-6">You haven't opened any support tickets. If you need assistance with a booking or have questions, let us know.</p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inquiries.map(inq => (
              <div key={inq.id} className="cursor-pointer transition-colors" onClick={() => setSelectedInquiry(inq)}>
                <SectionCard>
                  <div className="flex items-start justify-between mb-3">
                    <Badge label={inq.status.toLowerCase()} />
                    <span className="text-xs text-[var(--color-muted)] font-mono">{new Date(inq.created_at || inq.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-display font-semibold text-[var(--color-ink)] mb-2 line-clamp-1">{inq.subject}</h4>
                  <p className="text-sm text-[var(--color-muted)] line-clamp-2">{inq.message}</p>
                </SectionCard>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title={isEditing ? "Edit Inquiry" : "Open New Inquiry"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Subject" required>
              <Input 
                value={subject} 
                onChange={(e: any) => setSubject(e.target.value)} 
                placeholder="Briefly describe your issue..." 
                required 
                maxLength={255}
              />
            </FormField>
            <FormField label="Message" required>
              <Textarea 
                value={message} 
                onChange={(e: any) => setMessage(e.target.value)} 
                placeholder="Provide more details here..." 
                required 
                rows={5}
                maxLength={2000}
              />
            </FormField>
            <div className="flex gap-3 pt-2">
              <PrimaryBtn type="submit" className="flex-1">{isEditing ? "Save Changes" : "Submit Inquiry"}</PrimaryBtn>
              <SecondaryBtn type="button" onClick={() => setShowModal(false)} className="flex-1">Cancel</SecondaryBtn>
            </div>
          </form>
        </Modal>
      )}

      {selectedInquiry && (
        <Modal open={!!selectedInquiry} onClose={() => setSelectedInquiry(null)} title="Inquiry Details">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge label={selectedInquiry.status.toLowerCase()} />
                  <span className="text-xs text-[var(--color-muted)] font-mono">{new Date(selectedInquiry.created_at || selectedInquiry.createdAt).toLocaleString()}</span>
                </div>
                {selectedInquiry.status === 'OPEN' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(selectedInquiry)} className="text-xs text-[var(--color-gold)] hover:underline">Edit</button>
                    <span className="text-[var(--color-divider)]">|</span>
                    <button onClick={() => handleDelete(selectedInquiry.id)} className="text-xs text-[var(--color-red)] hover:underline">Delete</button>
                  </div>
                )}
              </div>
              <h3 className="font-display font-semibold text-lg text-[var(--color-ink)]">{selectedInquiry.subject}</h3>
            </div>
            
            <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-divider)]">
              <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">{selectedInquiry.message}</p>
            </div>
            
            {selectedInquiry.reply ? (
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Support Reply</span>
                  {selectedInquiry.replied_at || selectedInquiry.repliedAt ? (
                    <span className="font-mono text-[10px] lowercase text-[var(--color-gold)]">{new Date(selectedInquiry.replied_at || selectedInquiry.repliedAt).toLocaleString()}</span>
                  ) : null}
                </h4>
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[var(--color-gold)] border-opacity-30">
                  <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap">{selectedInquiry.reply}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-[var(--color-muted)] italic">
                Our team will review your inquiry and reply here soon.
              </div>
            )}
            
            <div className="pt-2">
              <SecondaryBtn onClick={() => setSelectedInquiry(null)} className="w-full">Close</SecondaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast('')} />}
    </ClientLayout>
  );
};
