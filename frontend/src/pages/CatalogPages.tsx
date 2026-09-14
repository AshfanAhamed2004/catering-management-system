import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { Field, LoadState, money, PageTitle, Pager, useData } from '../components';
import type { EventType, Package } from '../types';

export function Home() { 
  return (
    <>
      <section className="hero" style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--color-bg-alt)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p className="eyebrow" style={{ color: 'var(--color-brand)', fontWeight: 'bold' }}>PREMIUM CATERING MANAGEMENT SYSTEM</p>
          <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>Exceptional Catering<br/>For Every <em>Occasion.</em></h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>From intimate family gatherings to massive corporate events, we provide end-to-end catering solutions. Freshly prepared, locally inspired, and flawlessly executed.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link className="button" to="/packages">Explore Our Menus</Link>
            <Link className="button secondary" to="/register">Book Catering</Link>
          </div>
        </div>
      </section>

      <section className="services" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem' }}>Our Catering Services</h2>
          <p>We bring culinary excellence to your table, no matter the scale of your event.</p>
        </div>
        <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="panel" style={{ textAlign: 'center' }}>
            <h3>Wedding Catering</h3>
            <p>Elegant menus, impeccable service, and a memorable dining experience for your special day.</p>
          </div>
          <div className="panel" style={{ textAlign: 'center' }}>
            <h3>Corporate Events</h3>
            <p>Professional catering for meetings, conferences, and office parties. Reliable and punctual.</p>
          </div>
          <div className="panel" style={{ textAlign: 'center' }}>
            <h3>Private Parties</h3>
            <p>Customized food packages that let you relax and enjoy the celebration with your guests.</p>
          </div>
        </div>
      </section>

      <section className="steps" style={{ padding: '4rem 2rem', background: 'var(--color-bg-alt)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <span style={{ color: 'var(--color-brand)', fontWeight: 'bold' }}>01 / EXPLORE</span>
            <h3>Browse Menus</h3>
            <p>Discover carefully curated packages designed by our expert chefs for various occasions.</p>
          </div>
          <div>
            <span style={{ color: 'var(--color-brand)', fontWeight: 'bold' }}>02 / PLAN</span>
            <h3>Book Your Event</h3>
            <p>Select your date, guest count, and venue. Add special requests and dietary requirements.</p>
          </div>
          <div>
            <span style={{ color: 'var(--color-brand)', fontWeight: 'bold' }}>03 / RELAX</span>
            <h3>We Deliver Excellence</h3>
            <p>Our team handles the food, setup, and service, ensuring a seamless experience.</p>
          </div>
        </div>
      </section>

      <section className="about" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Why Choose Our Catering System?</h2>
        <p style={{ maxWidth: '600px', margin: '1rem auto 2rem' }}>With years of culinary expertise and a streamlined management platform, we make event planning effortless. Track your bookings, manage feedback, and view real-time statuses directly from your dashboard.</p>
        <Link className="button" to="/register">Create an Account Today</Link>
      </section>
    </>
  ); 
}

export function PackageCard({item, index}: {item: Package; index: number}) { return <article className="package-card"><div className={`card-art tone-${index % 3}`} aria-hidden="true"><span>{item.event_type.name}</span><div className="mini-plate">✳</div></div><div className="card-body"><p className="eyebrow">{item.event_type.name} · from {item.minimum_guest_count} guests</p><h2>{item.name}</h2><p>{item.description}</p><div className="price">{money(item.price_per_person)} <small>/ guest</small></div><Link className="text-link" to={`/packages/${item.id}`}>Explore the menu <span aria-hidden="true">↗</span></Link></div></article>; }
export function PackageList() {
  const [search, setSearch] = useState(''); const [event, setEvent] = useState(''); const [page, setPage] = useState(0);
  const packages = useData<Package[]>(`/packages?search=${encodeURIComponent(search)}${event ? `&event_type=${event}` : ''}&offset=${page * 50}`);
  const events = useData<EventType[]>('/event-types');
  return <><PageTitle eyebrow="A menu for every moment" title="Find your perfect table"/><p className="intro">Comforting favourites. Generous portions. Choose a package and make the occasion your own.</p><div className="filters"><Field label="Search packages"><input type="search" placeholder="Try wedding or family…" value={search} onChange={e => {setSearch(e.target.value); setPage(0);}}/></Field><Field label="Event type"><select value={event} onChange={e => {setEvent(e.target.value); setPage(0);}}><option value="">All occasions</option>{events.data?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field></div>{events.error && <p role="alert">Event types could not load. <button onClick={events.reload}>Retry</button></p>}<LoadState {...packages}>{packages.data?.length ? <div className="card-grid">{packages.data.map((p,i) => <PackageCard key={p.id} item={p} index={i}/>)}</div> : <div className="empty"><h2>No packages found</h2><p>Try another search or event type.</p></div>}<Pager page={page} setPage={setPage} count={packages.data?.length || 0}/></LoadState></>;
}
export function PackageDetail() {
  const {id} = useParams(); const result = useData<Package>(`/packages/${id}`); const {user} = useAuth(); const p = result.data;
  return <LoadState {...result}>{p && <><Link to="/packages" className="back">← All packages</Link><PageTitle eyebrow={p.event_type.name} title={p.name}/><div className="detail-grid"><section className="panel"><h2>A generous spread</h2><p>{p.description}</p><h3>On the menu</h3><ul className="menu-list">{p.menu_items.map(item => <li key={item.id}><div><strong>{item.name}</strong><small>{item.category}</small></div><p>{item.description}</p>{item.dietary_information && <span className="diet">{item.dietary_information}</span>}</li>)}</ul></section><aside className="panel summary"><p className="eyebrow">Made for your occasion</p><h2>{money(p.price_per_person)}</h2><p>per guest · LKR</p><hr/><p>{p.minimum_guest_count}{p.maximum_guest_count ? `–${p.maximum_guest_count}` : '+'} guests</p><p>The estimated package total is the price per guest × your guest count.</p>{(!user || user.role === 'CUSTOMER') && <Link className="button" to={`/bookings/new?package=${p.id}`}>Plan your event ↗</Link>}<small>Your request will be reviewed by our team.</small></aside></div></>}</LoadState>;
}
