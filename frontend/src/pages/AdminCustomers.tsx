import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import {
  PageHeader, FilterTabs, SearchInput, TableShell, TH, TD, Avatar, Badge, GhostBtn, EmptyState
} from '../figma_templates/components';
import type { CustomerSummaryOut } from '../types';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerSummaryOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  
  const navigate = useNavigate();

  const fetchCustomers = async (searchTerm?: string) => {
    setLoading(true);
    setError('');
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const response = await api.get<CustomerSummaryOut[]>(`/staff/customers${query}`);
      setCustomers(response.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // We fetch all initially and let frontend do basic filtering if search is empty, 
  // or we debounce API search. Existing logic had a manual "Search" button.
  // We'll mimic the Figma live-search if possible by just filtering locally if no pagination.
  // Actually, let's keep the API call for search via a debounced effect, or just filter locally if we have all.
  // The existing logic fetched ALL if no search, so local filtering works beautifully!
  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers
    .filter(c => {
      if (filter === 'ACTIVE') return c.active;
      if (filter === 'INACTIVE') return !c.active;
      return true;
    })
    .filter(c => {
       if (!search) return true;
       const s = search.toLowerCase();
       return (
         (c.full_name && c.full_name.toLowerCase().includes(s)) ||
         (c.email && c.email.toLowerCase().includes(s)) ||
         (c.mobile_number && c.mobile_number.toLowerCase().includes(s))
       );
    });

  return (
    <AdminLayout title="Customers">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Customers"
          subtitle={`${filtered.length} accounts`}
          breadcrumb={['Operations', 'Customers']}
        />

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <FilterTabs options={['ALL', 'ACTIVE', 'INACTIVE']} active={filter} onChange={setFilter} />
          <div className="ml-auto w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="Search customers..." />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded flex items-center justify-between mb-4 text-sm">
            <span>{error}</span>
            <button onClick={() => fetchCustomers()} className="bg-white px-3 py-1 rounded border hover:bg-gray-50">Retry</button>
          </div>
        )}

        <TableShell>
          <thead>
            <tr>
              <TH>Customer</TH>
              <TH>Contact</TH>
              <TH right>Bookings</TH>
              <TH>Joined Date</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-[var(--color-muted)]">Loading customers...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title="No customers found" message="Try adjusting your search or filters." /></td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="hover:bg-[var(--color-bg)] transition-colors cursor-pointer" onClick={() => navigate(`/admin/customers/${c.id}`)}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={c.full_name || 'Customer'} size="sm" />
                      <span className="font-medium text-sm text-[var(--color-ink)] whitespace-nowrap">{c.full_name}</span>
                    </div>
                  </TD>
                  <TD>
                    <div className="text-xs text-[var(--color-muted)]">{c.email}</div>
                    <div className="text-[10px] font-mono text-[var(--color-muted)] mt-0.5">{c.mobile_number || 'N/A'}</div>
                  </TD>
                  <TD right><span className="font-mono text-sm">{c.total_bookings}</span></TD>
                  <TD><span className="text-xs font-mono text-[var(--color-muted)]">{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</span></TD>
                  <TD><Badge label={c.active ? 'ACTIVE' : 'INACTIVE'} /></TD>
                  <TD>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <GhostBtn onClick={() => navigate(`/admin/customers/${c.id}`)}>Profile</GhostBtn>
                    </div>
                  </TD>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </div>
    </AdminLayout>
  );
};
