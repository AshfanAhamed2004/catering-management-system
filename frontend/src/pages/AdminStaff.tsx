import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import type { Role } from '../types';
import { useAuth } from '../auth';
import {
  PageHeader, PrimaryBtn, SearchInput, KPICard, TableShell, TH, TD, Avatar, Badge,
  GhostBtn, Modal, FormField, Input, Select, SecondaryBtn, Toast, EmptyState
} from '../figma_templates/components';

interface UserOut {
  id: number;
  full_name: string;
  fullName?: string;
  email: string;
  role: Role;
  is_active: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
}

const ROLES: Role[] = ['GENERAL_MANAGER', 'HEAD_CHEF', 'CUSTOMER_SERVICE_SUPERVISOR', 'EVENT_COORDINATION_OFFICER', 'FINANCE_OFFICER', 'WAITER', 'CLEANER', 'CHEF'];

export const AdminStaff = () => {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<UserOut | null>(null);
  const [toast, setToast] = useState('');
  
  // Add Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<Role | ''>('');

  // Edit Form State
  const [editRole, setEditRole] = useState<Role | ''>('');
  const [editActive, setEditActive] = useState(true);
  const [editName, setEditName] = useState('');

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      // Filter out CUSTOMER to only show staff
      setUsers(res.data.filter((u: UserOut) => u.role !== 'CUSTOMER'));
    } catch (err) {
      console.error(err);
      setError(errorMessage(err) || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addRole) return;
    try {
      await api.post('/admin/users', {
        fullName: addName, full_name: addName,
        email: addEmail,
        password: addPassword,
        role: addRole
      });
      setShowAdd(false);
      setAddName(''); setAddEmail(''); setAddPassword(''); setAddRole('');
      setToast('Staff member added.');
      fetchUsers();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser || !editRole) return;
    try {
      await api.put(`/admin/users/${editUser.id}`, {
        role: editRole,
        isActive: editActive, is_active: editActive,
        fullName: editName, full_name: editName
      });
      setEditUser(null);
      setToast('Staff member updated.');
      fetchUsers();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete user permanently? All history (bookings, schedules, waste records) will be wiped.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setToast('Staff member deleted.');
      fetchUsers();
    } catch (err) {
      setToast('Error: ' + errorMessage(err));
    }
  };

  const openEdit = (u: UserOut) => {
    setEditUser(u);
    setEditName(u.full_name || u.fullName || '');
    setEditRole(u.role);
    setEditActive(u.is_active !== false && u.isActive !== false);
  };

  const filtered = users.filter(s => {
    const q = search.toLowerCase();
    const name = (s.full_name || s.fullName || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const role = (s.role || '').toLowerCase();
    return !search || name.includes(q) || email.includes(q) || role.includes(q);
  });

  return (
    <AdminLayout title="Staff Management">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Staff Management"
          subtitle={`${users.length} team members`}
          breadcrumb={['Admin', 'Staff Management']}
          action={<PrimaryBtn onClick={() => setShowAdd(true)}>+ Add Staff</PrimaryBtn>}
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-between text-sm font-medium">
            <span>{error}</span>
            <button onClick={fetchUsers} className="bg-white border border-red-200 px-3 py-1 rounded">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <KPICard label="Total Staff" value={users.length} accent="var(--color-ink)" />
          <KPICard label="Active" value={users.filter(s => s.is_active !== false && s.isActive !== false).length} accent="var(--color-green)" />
          <KPICard label="Inactive" value={users.filter(s => s.is_active === false || s.isActive === false).length} accent="var(--color-muted)" />
        </div>

        <div className="mb-5 w-72">
          <SearchInput value={search} onChange={setSearch} placeholder="Search staff..." />
        </div>

        <TableShell>
          <thead>
            <tr>
              <TH>Staff Member</TH>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Joined</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-[var(--color-muted)]">Loading staff...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title="No staff members found" message="Try adjusting your search criteria." /></td></tr>
            ) : filtered.map(s => {
              const active = s.is_active !== false && s.isActive !== false;
              return (
                <tr key={s.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.full_name || s.fullName || 'User'} size="sm" />
                      <span className="text-sm font-medium text-[var(--color-ink)] whitespace-nowrap">{s.full_name || s.fullName}</span>
                    </div>
                  </TD>
                  <TD><span className="text-xs text-[var(--color-muted)]">{s.email}</span></TD>
                  <TD>
                    <span className="text-[10px] font-mono text-[var(--color-gold)] uppercase tracking-wide">{s.role}</span>
                  </TD>
                  <TD><span className="text-xs font-mono text-[var(--color-muted)]">{s.created_at || s.createdAt ? new Date(s.created_at || s.createdAt!).toLocaleDateString() : 'N/A'}</span></TD>
                  <TD><Badge label={active ? 'ACTIVE' : 'INACTIVE'} /></TD>
                  <TD>
                    <div className="flex gap-1">
                      <GhostBtn onClick={() => openEdit(s)}>Edit</GhostBtn>
                      {currentUser?.id !== s.id && (
                        <GhostBtn className="text-[var(--color-red)]" onClick={() => handleDelete(s.id)}>Delete</GhostBtn>
                      )}
                    </div>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </TableShell>

        {/* Add Modal */}
        {showAdd && (
          <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Staff Member">
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <FormField label="Full Name" required>
                <Input value={addName} onChange={e => setAddName(e.target.value)} required />
              </FormField>
              <FormField label="Email" required>
                <Input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} required />
              </FormField>
              <FormField label="Role" required>
                <Select value={addRole} onChange={e => setAddRole(e.target.value as Role)} required>
                  <option value="">Select a role...</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
              </FormField>
              <FormField label="Temporary Password" required>
                <Input type="password" value={addPassword} onChange={e => setAddPassword(e.target.value)} required minLength={6} />
              </FormField>
              <div className="flex gap-3 pt-2">
                <PrimaryBtn type="submit" className="flex-1">Create Account</PrimaryBtn>
                <SecondaryBtn type="button" onClick={() => setShowAdd(false)} className="flex-1">Cancel</SecondaryBtn>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Modal */}
        {editUser && (
          <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit Staff Member">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <FormField label="Full Name" required>
                <Input value={editName} onChange={e => setEditName(e.target.value)} required />
              </FormField>
              <FormField label="Role" required>
                <Select value={editRole} onChange={e => setEditRole(e.target.value as Role)} required disabled={currentUser?.id === editUser.id}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </Select>
              </FormField>
              <FormField label="Status">
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <label key={String(v)} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" checked={editActive === v} onChange={() => setEditActive(v)} disabled={currentUser?.id === editUser.id} className="text-[var(--color-green)]" />
                      <span className="text-sm text-[var(--color-muted)]">{v ? 'Active' : 'Inactive'}</span>
                    </label>
                  ))}
                </div>
              </FormField>
              {currentUser?.id === editUser.id && (
                <div className="text-xs text-[var(--color-amber)] italic">You cannot change your own role or status.</div>
              )}
              <div className="flex gap-3 pt-2">
                <PrimaryBtn type="submit" className="flex-1">Save Changes</PrimaryBtn>
                <SecondaryBtn type="button" onClick={() => setEditUser(null)} className="flex-1">Cancel</SecondaryBtn>
              </div>
            </form>
          </Modal>
        )}

        {toast && <Toast message={toast} type="success" onDismiss={() => setToast('')} />}
      </div>
    </AdminLayout>
  );
};