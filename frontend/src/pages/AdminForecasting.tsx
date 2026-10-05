import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { api, errorMessage } from '../api';
import { Booking, Package, ForecastOut } from '../types';
import { useAuth } from '../auth';
import {
  PageHeader, SectionCard, PrimaryBtn, TableShell, TH, TD, 
  FormField, Select, Input, EmptyState
} from '../figma_templates/components';

export const AdminForecasting = () => {
  const { user } = useAuth();
  const canAccess = user && ['HEAD_CHEF', 'GENERAL_MANAGER'].includes(user.role);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [initError, setInitError] = useState('');

  const [mode, setMode] = useState<'booking' | 'custom'>('booking');
  
  // Booking Forecast State
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  
  // Custom Forecast State
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [customGuests, setCustomGuests] = useState<number | ''>('');
  
  // Result
  const [forecast, setForecast] = useState<ForecastOut | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastError, setForecastError] = useState('');

  useEffect(() => {
    if (!canAccess) return;
    const fetchInitData = async () => {
      try {
        const [bookingsRes, packagesRes] = await Promise.all([
          api.get<Booking[]>('/staff/bookings'),
          api.get<Package[]>('/staff/packages')
        ]);
        const approved = bookingsRes.data.filter(b => b.status === 'APPROVED' || !b.status);
        setBookings(approved);
        setPackages(packagesRes.data);
        if (approved.length > 0) setSelectedBookingId(String(approved[0].id));
        if (packagesRes.data.length > 0) setSelectedPackageId(String(packagesRes.data[0].id));
      } catch (err) {
        setInitError(errorMessage(err));
      } finally {
        setLoadingInit(false);
      }
    };
    fetchInitData();
  }, [canAccess]);

  const runForecast = async () => {
    setForecastError('');
    setForecast(null);
    setLoadingForecast(true);
    
    try {
      if (mode === 'booking') {
        if (!selectedBookingId) throw new Error("Please select a booking.");
        const res = await api.get<ForecastOut>('/staff/forecast?bookingId=' + selectedBookingId);
        setForecast(res.data);
      } else {
        if (!selectedPackageId) throw new Error("Please select a package.");
        if (!customGuests || customGuests <= 0) throw new Error("Guest count must be greater than 0.");
        const res = await api.get<ForecastOut>('/staff/forecast/custom?packageId=' + selectedPackageId + '&guestCount=' + customGuests);
        setForecast(res.data);
      }
    } catch (err: any) {
      setForecastError(err.message || errorMessage(err));
    } finally {
      setLoadingForecast(false);
    }
  };

  if (!canAccess) {
    return (
      <AdminLayout title="Forecasting">
        <div className="p-8 text-center text-[var(--color-muted)]">You do not have permission to view this page.</div>
      </AdminLayout>
    );
  }

  const selectedBooking = bookings.find(b => String(b.id) === selectedBookingId);


  return (
    <AdminLayout title="Ingredient Forecasting">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader 
          title="Ingredient Forecasting" 
          subtitle="Calculate required ingredients for any event" 
          breadcrumb={['Kitchen', 'Forecasting']} 
        />

        {initError ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">Failed to load init data: {initError}</div>
        ) : loadingInit ? (
          <div className="text-sm text-[var(--color-muted)] p-4">Loading system data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Forecast Settings */}
            <div className="space-y-5">
              <SectionCard title="Forecast Settings">
                <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1 mb-4">
                  {(['booking', 'custom'] as const).map(m => (
                    <button key={m} onClick={() => { setMode(m); setForecast(null); setForecastError(''); }}
                      className={`flex-1 py-2 text-xs font-mono uppercase tracking-wide rounded-md transition-colors capitalize ${mode === m ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm' : 'text-[var(--color-muted)]'}`}>
                      {m === 'booking' ? 'By Booking' : 'Custom'}
                    </button>
                  ))}
                </div>

                {mode === 'booking' ? (
                  <div className="space-y-3">
                    <FormField label="Select Booking">
                      <Select value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)}>
                        {bookings.map(b => (
                          <option key={b.id} value={b.id}>REF-{b.id} • {b.customer_name || 'Customer'}</option>
                        ))}
                      </Select>
                    </FormField>
                    {selectedBooking && (
                      <div className="bg-[var(--color-bg)] rounded-lg px-3 py-2.5 space-y-1 text-xs text-[var(--color-muted)]">
                        <div className="flex justify-between"><span>Package</span><span className="font-medium text-[var(--color-ink)] truncate max-w-[150px]">{selectedBooking.package_name || 'N/A'}</span></div>
                        <div className="flex justify-between"><span>Guests</span><span className="font-medium text-[var(--color-ink)]">{selectedBooking.guest_count}</span></div>
                        <div className="flex justify-between"><span>Date</span><span className="font-medium text-[var(--color-ink)]">{selectedBooking.event_date ? new Date(selectedBooking.event_date).toLocaleDateString() : 'N/A'}</span></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FormField label="Package">
                      <Select value={selectedPackageId} onChange={e => setSelectedPackageId(e.target.value)}>
                        {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Guest Count">
                      <Input type="number" min="1" value={customGuests} onChange={e => setCustomGuests(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 50" />
                    </FormField>
                  </div>
                )}

                <PrimaryBtn onClick={runForecast} className="w-full mt-4" disabled={loadingForecast}>
                  {loadingForecast ? 'Running...' : 'Run Forecast'}
                </PrimaryBtn>
              </SectionCard>
            </div>

            {/* Results Pane */}
            <div className="lg:col-span-2">
              {forecastError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                  <div className="text-red-500 font-medium mb-1">Forecast Failed</div>
                  <div className="text-sm text-red-400">{forecastError}</div>
                </div>
              ) : !forecast ? (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl h-64 flex items-center justify-center p-6 text-center">
                  <EmptyState title="Run a forecast" message="Configure settings and click Run Forecast to see required ingredients." />
                </div>
              ) : (
                <SectionCard title={`Forecast: ${(forecast.packageName || (forecast as any).package_name)} × ${(forecast.guestCount || (forecast as any).guest_count)} guests`} noPad>
                  <div className="px-5 py-3 border-b border-[var(--color-divider)] bg-[var(--color-bg)] flex justify-between text-xs font-mono text-[var(--color-muted)]">
                    <div>Booking Ref: {(forecast.bookingReference || (forecast as any).booking_reference) || 'Custom'}</div>
                    {((forecast as any).event_date || forecast.eventDate) && <div>Date: {(forecast.eventDate || (forecast as any).event_date)}</div>}
                  </div>
                  <TableShell>
                    <thead>
                      <tr>
                        <TH>Ingredient</TH>
                        <TH>Contributing Menu Items</TH>
                        <TH right>Total Required</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.items.length === 0 ? (
                        <tr><td colSpan={3}><EmptyState title="No ingredient data" message="The menu items in this package don't have ingredients mapped." /></td></tr>
                      ) : forecast.items.map((row, i) => (
                        <tr key={i} className="hover:bg-[var(--color-bg)] transition-colors">
                          <TD><span className="text-sm font-medium text-[var(--color-ink)]">{row.ingredientName || (row as any).ingredient_name}</span></TD>
                          <TD>
                            <span className="text-xs text-[var(--color-muted)]">
                              {((row.contributingMenuItems || (row as any).contributing_menu_items) || []).join(', ') || 'N/A'}
                            </span>
                          </TD>
                          <TD right>
                            <span className="font-mono font-semibold text-sm text-[var(--color-ink)]">
                              {(row.requiredQuantity || (row as any).required_quantity).toFixed(2)} {row.unit}
                            </span>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </TableShell>
                </SectionCard>
              )}
            </div>
            
          </div>
        )}
      </div>
    </AdminLayout>
  );
};