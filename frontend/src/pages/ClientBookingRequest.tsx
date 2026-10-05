import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { FormField, Input, Select } from '../figma_templates/components';
import { ClientLayout } from '../components/ClientLayout';

export const ClientBookingRequest = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [packageId, setPackageId] = useState<number | string>('');
  const [guests, setGuests] = useState<number | string>(200);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  
  
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/packages').then(res => {
      setPackages(res.data);
      if (res.data.length > 0) setPackageId(res.data[0].id);
    }).catch(console.error);
  }, []);

  const getMinDate = () => { 
    const d = new Date(); d.setDate(d.getDate() + 5); 
    return d.toISOString().split('T')[0]; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/bookings', {
        event_date: date,
        event_time: time + ':00',
        guest_count: guests,
        event_location: location,
        package_id: packageId
      });
      // Existing logic redirects to dashboard, but let's show success first or just redirect immediately
      navigate('/client/bookings');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setError(errorMessage(err));
      }
    }
  };

  return (
    <ClientLayout fullWidth>
      <div className="bg-[var(--color-bg)]">
        {/* Hero */}
        <section className="relative bg-[var(--color-ink)] text-white overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&h=800&fit=crop&auto=format"
              alt="Elegant catering setup"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] to-transparent" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                Now booking 2026/2027
              </div>
              <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[1.1] mb-6">
                Culinary excellence <br />
                <span className="text-white/50 italic font-light">for every occasion.</span>
              </h1>
              <p className="text-lg text-white/70 max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed font-light">
                Smart Serve Catering delivers bespoke catering experiences. From intimate private dinners to grand corporate galas, we curate menus that elevate your event.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[var(--color-gold)] text-white font-medium px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm shadow-xl shadow-[var(--color-gold)]/20"
                >
                  Request a Booking
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="bg-[var(--color-sidebar)]">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '500+', label: 'Events Catered' },
              { value: '12k+', label: 'Guests Served' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '11', label: 'Years of Excellence' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-semibold text-2xl text-[var(--color-gold)]">{stat.value}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="bg-[var(--color-surface)] py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold)] mb-3">Our Menus</div>
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-[var(--color-ink)]">Signature packages</h2>
              <p className="text-[var(--color-muted)] mt-3 max-w-lg mx-auto text-sm leading-relaxed">Each package is thoughtfully designed and fully customisable. All prices per person.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {packages.map((pkg, i) => (
                <div key={pkg.id} className={`relative rounded-xl border overflow-hidden transition-all hover:shadow-xl ${i === 1 ? 'border-[var(--color-gold)] shadow-lg' : 'border-[var(--color-border)]'}`}>
                  {i === 1 && (
                    <div className="bg-[var(--color-gold)] text-white text-[10px] font-mono uppercase tracking-widest text-center py-1.5">Most Popular</div>
                  )}
                  <div className="p-5">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold)] mb-1">{typeof pkg.event_type === 'object' ? pkg.event_type?.name : pkg.event_type || 'Event'}</div>
                    <h3 className="font-display font-semibold text-[var(--color-ink)] text-lg leading-tight mb-2">{pkg.name}</h3>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-4">{pkg.description}</p>
                    <div className="text-2xl font-display font-semibold text-[var(--color-ink)] mb-0.5">Rs. {pkg.price_per_person}</div>
                    <div className="text-xs text-[var(--color-muted)] mb-4">per person • min {pkg.minimum_guest_count} guests</div>
                    <button
                      onClick={() => { setPackageId(pkg.id); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }); }}
                      className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${i === 1 ? 'bg-[var(--color-gold)] text-white hover:opacity-90' : 'border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-bg)]'}`}
                    >
                      Select Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking form */}
        <section id="book" className="py-20 bg-[var(--color-bg)]">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-gold)] mb-3">Get Started</div>
              <h2 className="font-display font-semibold text-3xl md:text-4xl text-[var(--color-ink)]">Request a booking</h2>
              <p className="text-[var(--color-muted)] mt-3 text-sm leading-relaxed">Tell us about your event and we'll be in touch within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 space-y-5 shadow-sm">
              {error && (
                <div className="bg-[var(--color-red-light)] border border-[var(--color-red)]/30 rounded-lg px-3 py-2.5 text-xs text-[var(--color-red)] flex items-start gap-2">
                  <span>⚠️ </span>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Event Date" required>
                  <Input type="date" min={getMinDate()} value={date} onChange={e => setDate(e.target.value)} required />
                </FormField>
                <FormField label="Event Time" required>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
                </FormField>
              </div>
              <FormField label="Event Location" required>
                <Input placeholder="Venue name and address" value={location} onChange={e => setLocation(e.target.value)} required />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Guest Count" required>
                  <Input type="number" min="10" placeholder="e.g. 80" value={guests} onChange={e => setGuests(e.target.value)} required />
                </FormField>
                <FormField label="Package" required>
                  <Select value={packageId} onChange={e => setPackageId(e.target.value)} required>
                    <option value="">Select a package</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — Rs. {p.price_per_person}/pp</option>
                    ))}
                  </Select>
                </FormField>
              </div>
              <button type="submit" className="w-full bg-[var(--color-green)] text-white font-medium py-3 rounded-xl hover:bg-[var(--color-sidebar-hover)] transition-colors text-sm">
                Submit Booking Request
              </button>
              <p className="text-center text-xs text-[var(--color-muted)] mt-4">
                You must be signed in to submit a request.{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-[var(--color-gold)] hover:underline">Sign in</button>
              </p>
            </form>
          </div>
        </section>

      </div>
    </ClientLayout>
  );
};
