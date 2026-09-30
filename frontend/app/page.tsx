'use client';

import GuestPanel from './components/GuestPanel';
import hostelPhoto1 from '../assets/photos/1.jpeg';
import hostelPhoto2 from '../assets/photos/2.jpeg';
import hostelPhoto3 from '../assets/photos/3.jpeg';
import hostelPhoto4 from '../assets/photos/4.jpeg';
import hostelPhoto5 from '../assets/photos/5.jpeg';
import hostelPhoto6 from '../assets/photos/6.jpeg';
import hostelPhoto7 from '../assets/photos/7.jpeg';
import hostelPhoto8 from '../assets/photos/8.jpeg';
import hostelPhoto9 from '../assets/photos/9.jpeg';
import hostelPhoto10 from '../assets/photos/10.jpeg';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M3 22v-2a9 9 0 0 1 18 0v2"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    spark: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>,
    wifi: <><path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r=".5"/></>,
    car: <><path d="m5 7 2-4h10l2 4 2 3v7H3v-7l2-3ZM3 10h18M6 17v3M18 17v3M6 13h2M16 13h2"/></>,
    water: <><path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M9 15a3 3 0 0 0 3 3"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    instagram: <><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>,
    whatsapp: <><path d="m4 20 1-5a8 8 0 1 1 3 4Z"/><path d="M8 8c0 4 4 8 8 8l1-3-3-1-1 1-3-3 1-1-2-2Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.user}</svg>;
}
const photos = [
  [hostelPhoto1.src, 'Stay Hub hostel photo 1'],
  [hostelPhoto2.src, 'Stay Hub hostel photo 2'],
  [hostelPhoto3.src, 'Stay Hub hostel photo 3'],
  [hostelPhoto4.src, 'Stay Hub hostel photo 4'],
  [hostelPhoto5.src, 'Stay Hub hostel photo 5'],
  [hostelPhoto6.src, 'Stay Hub hostel photo 6'],
  [hostelPhoto7.src, 'Stay Hub hostel photo 7'],
  [hostelPhoto8.src, 'Stay Hub hostel photo 8'],
  [hostelPhoto9.src, 'Stay Hub hostel photo 9'],
  [hostelPhoto10.src, 'Stay Hub hostel photo 10'],
];
const amenities = ['Free Parking', 'Free Wifi', 'Attached Bathroom', 'Open Terrace', 'Balcony Available', 'Water Filter', 'Geyser'];
type Modal = 'photos' | 'booking' | 'group' | 'contact' | 'account' | 'wishlist' | 'language' | 'currency' | 'Privacy' | 'Terms' | 'Company details' | null;

export default function Home() {
  const [modal, setModal] = useState<Modal>(null);
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [motionPaused, setMotionPaused] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const symbol = currency === 'INR' ? '₹' : '$';
  const price = 'Price at checkout';
  useEffect(() => { if (modal) { dialog.current?.showModal(); } else dialog.current?.close(); }, [modal]);
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    items.forEach(item => { item.classList.add('reveal-ready'); observer.observe(item); });
    return () => observer.disconnect();
  }, []);
  return <div className="site-shell" data-motion={motionPaused ? 'paused' : 'playing'}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="header">
      <a href="/" aria-label="PgBee home" className="brand"><img src="/assets/pgbee-logo.png" alt="PgBee"/></a>
      <img className="festival-logo" src="/assets/dhwani-logo.png" alt="Dhwani ’26"/>
      <nav aria-label="Main navigation">
        <button onClick={() => setModal('language')}><Icon name="globe" size={19}/><span>EN</span></button><i/>
        <button onClick={() => setModal('currency')}><span className="currency-symbol">{symbol}</span><span>{currency}</span></button><i/>
        <button aria-label="Open wishlist" onClick={() => setModal('wishlist')}><Icon name="heart"/><span>Wishlist</span>{saved && <b className="saved-dot"/>}</button><i/>
        <button aria-label="Open your account" onClick={() => setModal('account')}><Icon name="user" size={25}/><span>Account</span></button>
      </nav>
    </header>
    <main id="main-content">
      <section className="festival-banner" aria-labelledby="festival-heading">
        <div className="festival-copy"><span className="festival-tag"><span/> DHWANI ’26 · STAY A LITTLE LONGER</span><h2 id="festival-heading">Big festival energy.<br/>Your little <em>escape.</em></h2><p>All the excitement. A place to unwind.<br/>Find your home away from the crowd.</p><a className="explore-link" href="#stay">Meet your stay <Icon name="arrow" size={18}/></a></div>
        <div className="festival-art" aria-hidden="true">
          <div className="art-orbit"/><span className="art-ring ring-one"/><span className="art-ring ring-two"/><img className="art-clouds" src="/assets/elements/clouds.webp" alt=""/>
          <img className="art-ferris" src="/assets/elements/new%20ferris.svg" alt=""/>
          <img className="art-torii" src="/assets/elements/torii%20new.svg" alt=""/>
          <img className="art-mask" src="/assets/elements/Copy%20of%20mascot%20mask.svg" alt=""/>
          <img className="art-title" src="/assets/elements/title.svg" alt=""/>
          <img className="art-lantern lantern-one" src="/assets/elements/L2.svg" alt=""/><img className="art-lantern lantern-two" src="/assets/elements/L3.svg" alt=""/>
          <img className="art-note note-one" src="/assets/elements/note.svg" alt=""/><img className="art-note note-two" src="/assets/elements/blue%20note.svg" alt=""/>
          <div className="art-stay-note"><Icon name="pin" size={18}/><span>A little calm.<strong>A lot of memories.</strong></span></div><span className="art-star star-one">✦</span><span className="art-star star-two">✦</span>
        </div>
        <button className="motion-toggle" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>{motionPaused ? '▷ Play animations' : 'Ⅱ Pause animations'}</button>
      </section>
      <div className="stay-highlights" aria-label="Stay highlights">
        <span><Icon name="pin" size={19}/><span>Rooted in <strong>Kerala</strong></span></span>
        <span><Icon name="sun" size={19}/><span>Space to <strong>slow down</strong></span></span>
        <span><Icon name="heart" size={19}/><span>Better <strong>together</strong></span></span>
      </div>
      <div className="stay-intro" id="stay"><div><span className="section-kicker">GOOD TIMES. GREAT STAYS.</span><p>A little closer to feeling at home.</p></div><span className="location-chip"><Icon name="pin" size={16}/> Vattappara, Kerala</span></div>
      <p className="property-disclaimer">Location and amenities are illustrative. Confirm details with the stay team before booking.</p>
      <section className="gallery" aria-label="Property photos">
        {photos.slice(0, 5).map(([src, alt], index) => <button key={src} className={`photo photo-${index}`} data-reveal style={{ '--reveal-delay': `${index * 75}ms` } as CSSProperties} onClick={() => { setActivePhoto(index); setModal('photos'); }} aria-label={`View ${alt}`}><img src={src} alt={alt}/></button>)}
        <button className="all-photos" onClick={() => { setActivePhoto(0); setModal('photos'); }}>Show all photos</button>
        <span className="gallery-badge"><Icon name="spark" size={16}/> Your festival hideaway</span>
        <button className={`save-stay ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove Stay Hub from wishlist' : 'Save Stay Hub to wishlist'} aria-pressed={saved} onClick={() => setSaved(!saved)}><Icon name="heart" size={20}/></button>
      </section>
      <nav className="stay-navigation" aria-label="Explore this stay"><div><a href="#overview">Overview</a><a href="#amenities">Amenities</a><a href="#location">Location</a></div><span><Icon name="spark" size={15}/> Your home away from home</span></nav>
      <section id="overview" className="property-heading" data-reveal>
        <div className="property-title"><span className="section-kicker">CHECK IN. SWITCH OFF.</span><h1>STAY HUB<span>✦</span></h1><p>A cosy corner in the heart of Kerala.</p></div>
        <div className="booking-summary"><div className="price"><span className="price-caption">Your next getaway</span><strong>{price}</strong><div className="price-bottom"><span>Server-confirmed price</span></div></div>
          <div className="booking-actions"><button className="book-button" onClick={() => setModal('booking')}>Book Now <Icon name="arrow"/></button><button className="group-button" onClick={() => setModal('group')}>Bringing the whole crew? ↗</button></div>
        </div>
      </section>
      <section className="host" data-reveal><div className="host-details"><div className="avatar"><Icon name="user" size={28}/><span><Icon name="check" size={11}/></span></div><div><span className="section-kicker">A WARM WELCOME AWAITS</span><h2>Hosted by the Stay Hub team</h2><p>Contact our team for property details</p></div></div><button className="contact-button" onClick={() => setModal('contact')}>Say hello to your host <Icon name="arrow" size={18}/></button></section>
      <section id="amenities" className="amenities" data-reveal><div className="section-heading"><div><span className="section-kicker">THE LITTLE THINGS, TAKEN CARE OF</span><h2>Settle in. We’ve got you.</h2></div><img src="/assets/elements/blue%20note.svg" alt="" aria-hidden="true"/></div><ul>{amenities.map((item, index) => <li key={item} data-reveal style={{ '--reveal-delay': `${index % 4 * 65}ms` } as CSSProperties}><span className={`amenity-icon amenity-${index}`}><Icon name={['car', 'wifi', 'water', 'sun', 'spark', 'water', 'sun'][index]} size={20}/></span>{item}</li>)}</ul></section>
      <section id="location" className="location" data-reveal><div className="section-heading"><div><span className="section-kicker">FIND YOUR LITTLE ESCAPE</span><h2>Right here in Kerala.</h2><p><Icon name="pin" size={17}/> Vattappara, Kerala, India</p></div><a className="map-directions" href="https://www.google.com/maps/search/?api=1&query=Vattappara%2C+Kerala%2C+India" target="_blank" rel="noreferrer">Explore the neighbourhood <Icon name="arrow" size={18}/></a></div><a className="map" href="https://www.google.com/maps/search/?api=1&query=Vattappara%2C+Kerala%2C+India" target="_blank" rel="noreferrer" aria-label="Explore Vattappara on Google Maps"><img src="/assets/location-map.png" alt="Map of Vattappara, Kerala, showing nearby Kuttiyani, Kanakode, Venkode and Kurishadi"/><span className="map-label"><span className="map-pin"><Icon name="pin" size={25}/></span><strong>Your home base</strong><span>Vattappara, Kerala ↗</span></span></a></section>
      <section className="crew-banner" data-reveal><img src="/assets/elements/Copy%20of%20mascot%20mask.svg" alt="" aria-hidden="true"/><div><span className="section-kicker">MORE FRIENDS. MORE MEMORIES.</span><h2>The whole crew deserves a getaway.</h2><p>Make room for your favourite people.</p></div><button onClick={() => setModal('group')}>Plan a group stay <Icon name="arrow" size={20}/></button></section>
    </main>
    <footer><div className="footer-links"><span>© 2025 PGBee</span>{(['Privacy', 'Terms', 'Company details'] as const).map(item => <span key={item}>· <button onClick={() => setModal(item)}>{item}</button></span>)}</div><div className="social-links"><a href="https://www.whatsapp.com/" target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" size={18}/></a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" size={18}/></a><a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="facebook">f</a><a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">𝕏</a></div></footer>
    <dialog ref={dialog} onCancel={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) setModal(null); }} className={modal === 'photos' ? 'photo-dialog' : ''}>
      <button className="close-button" aria-label="Close dialog" onClick={() => setModal(null)}><Icon name="close"/></button>
      {modal === 'photos' ? <><h2>Stay Hub · All photos</h2><img className="large-photo" src={photos[activePhoto][0]} alt={photos[activePhoto][1]}/><div className="thumbnails">{photos.map(([src, alt], i) => <button className={i === activePhoto ? 'selected' : ''} key={src} onClick={() => setActivePhoto(i)} aria-label={alt}><img src={src} alt={alt}/></button>)}</div><p>{activePhoto + 1} / {photos.length}</p></> : null}
      {<div hidden={modal !== 'booking' && modal !== 'account'}><GuestPanel bookingMode={modal === 'booking'} onPaymentOpen={() => dialog.current?.close()} onPaymentClose={() => dialog.current?.showModal()}/></div>}
      {(modal === 'group' || modal === 'contact') && <><h2>{modal === 'group' ? 'Plan your group stay' : 'Contact the stay team'}</h2><p className="dialog-description">For stay enquiries, call Joel or Navya.</p><div className="enquiry-contacts"><a className="enquiry-card" href="tel:+919744507366">Joel 97445 07366 <Icon name="phone"/></a><a className="enquiry-card" href="tel:+918281180665">Navya 8281180665 <Icon name="phone"/></a></div></>}
      {modal === 'wishlist' && <><h2>Your wishlist</h2><div className="wishlist-item"><img src={photos[0][0]} alt="Stay Hub"/><div><h3>STAY HUB</h3><p>Vattappara, Kerala</p><strong>{price}</strong></div></div><button className="primary" onClick={() => setSaved(!saved)}>{saved ? 'Remove from wishlist' : 'Save Stay Hub to wishlist'}</button></>}
      {modal === 'language' && <><h2>Language</h2><button className="option selected" onClick={() => setModal(null)}>English <span>✓</span></button></>}
      {modal === 'currency' && <><h2>Choose currency</h2>{['INR', 'USD'].map(value => <button className={`option ${currency === value ? 'selected' : ''}`} key={value} onClick={() => { setCurrency(value); setModal(null); }}>{value === 'INR' ? '₹ Indian Rupee' : '$ US Dollar'}{currency === value && <span>✓</span>}</button>)}<p className="preview-note">Payments use the currency returned by the booking service.</p></>}
      {(modal === 'Privacy' || modal === 'Terms' || modal === 'Company details') && <><h2>{modal}</h2><p className="dialog-description">{modal === 'Privacy' ? 'Registration and booking details are sent to PgBee to manage your stay. Session credentials use HTTP-only cookies. Wishlist selections stay in this page session.' : modal === 'Terms' ? 'Bookings require phone verification and successful payment verification. Your checkout shows the server price. Cancellation fees are shown before you confirm cancellation. Confirm property details and amenities with the stay team.' : 'PgBee · Stay Hub in Vattappara, Kerala, India. A stay experience for Dhwani ’26.'}</p></>}
    </dialog>
  </div>;
}
