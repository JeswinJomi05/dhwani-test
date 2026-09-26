'use client';

import { useEffect, useRef, useState } from 'react';

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M3 22v-2a9 9 0 0 1 18 0v2"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    instagram: <><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/></>,
    whatsapp: <><path d="m4 20 1-5a8 8 0 1 1 3 4Z"/><path d="M8 8c0 4 4 8 8 8l1-3-3-1-1 1-3-3 1-1-2-2Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.user}</svg>;
}
const photos = [ ['property-main', 'Front entrance of Stay Hub with a garden and gated courtyard'], ['property-exterior', 'Exterior of the two-storey homestay'], ['property-bedroom', 'Double bedroom with blue bedding'], ['property-terrace', 'Sunny terrace and garden'], ['property-lounge', 'Wicker seating in the bedroom'] ];
const amenities = ['Free Parking', 'Free Wifi', 'Attached Bathroom', 'Open Terrace', 'Balcony Available', 'Water Filter', 'Geyser'];
type Modal = 'photos' | 'booking' | 'group' | 'contact' | 'account' | 'wishlist' | 'language' | 'currency' | 'Privacy' | 'Terms' | 'Company details' | null;

export default function Home() {
  const [modal, setModal] = useState<Modal>(null);
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const dialog = useRef<HTMLDialogElement>(null);
  const symbol = currency === 'INR' ? '₹' : '$';
  const price = currency === 'INR' ? '5,000' : '60';
  useEffect(() => { if (modal) { setSubmitted(false); dialog.current?.showModal(); } else dialog.current?.close(); }, [modal]);
  return <>
    <header className="header">
      <a href="/" aria-label="PgBee home" className="brand"><img src="/assets/pgbee-logo.png" alt="PgBee"/></a>
      <img className="festival-logo" src="/assets/dhwani-logo.png" alt="Dhwani ’26"/>
      <nav aria-label="Main navigation">
        <button onClick={() => setModal('language')}><Icon name="globe" size={19}/><span>EN</span></button><i/>
        <button onClick={() => setModal('currency')}><span className="currency-symbol">{symbol}</span><span>{currency}</span></button><i/>
        <button onClick={() => setModal('wishlist')}><Icon name="heart"/><span>Wishlist</span>{saved && <b className="saved-dot"/>}</button><i/>
        <button onClick={() => setModal('account')}><Icon name="user" size={25}/><span>John Doe</span></button>
      </nav>
    </header>
    <main>
      <section className="gallery" aria-label="Property photos">
        {photos.map(([src, alt], index) => <button key={src} className={`photo photo-${index}`} onClick={() => { setActivePhoto(index); setModal('photos'); }} aria-label={`View ${alt}`}><img src={`/assets/${src}.png`} alt={alt}/></button>)}
        <button className="all-photos" onClick={() => { setActivePhoto(0); setModal('photos'); }}>Show all photos</button>
      </section>
      <section className="property-heading">
        <h1>STAY HUB</h1>
        <div className="booking-summary"><div className="price"><strong>{symbol}{price}</strong><del>{symbol}{currency === 'INR' ? '5,500' : '66'}</del></div>
          <div className="booking-actions"><button className="book-button" onClick={() => setModal('booking')}>Book Now</button><button className="group-button" onClick={() => setModal('group')}>Have a Group Booking?</button></div>
        </div>
      </section>
      <section className="host"><div className="host-details"><div className="avatar"><svg width="30" height="32" viewBox="0 0 30 32" aria-hidden="true"><circle cx="15" cy="9" r="5" fill="currentColor"/><path d="M6 27v-3a9 9 0 0 1 18 0v3c0 2-18 2-18 0" fill="currentColor"/></svg></div><div><h2>Hosted by John Doe</h2><p>11 years hosting</p></div></div><button className="contact-button" onClick={() => setModal('contact')}>Contact Owner</button></section>
      <section className="amenities"><h2>Amenities Offered</h2><ul>{amenities.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section className="location"><h2>Location</h2><p>Vattappara, Kerala, India</p><a className="map" href="https://www.google.com/maps/search/?api=1&query=Vattappara%2C+Kerala%2C+India" target="_blank" rel="noreferrer" aria-label="Explore Vattappara on Google Maps"><img src="/assets/location-map.png" alt="Map of Vattappara, Kerala, showing nearby KuttIyani, Kanakode, Venkode and Kurishadi"/></a></section>
    </main>
    <footer><div className="footer-links"><span>© 2025 PGBee</span>{(['Privacy', 'Terms', 'Company details'] as const).map(item => <span key={item}>· <button onClick={() => setModal(item)}>{item}</button></span>)}</div><div className="social-links"><a href="https://www.whatsapp.com/" target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" size={18}/></a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" size={18}/></a><a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook" className="facebook">f</a><a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="X">𝕏</a></div></footer>
    <dialog ref={dialog} onCancel={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) setModal(null); }} className={modal === 'photos' ? 'photo-dialog' : ''}>
      <button className="close-button" aria-label="Close dialog" onClick={() => setModal(null)}><Icon name="close"/></button>
      {modal === 'photos' ? <><h2>Stay Hub · All photos</h2><img className="large-photo" src={`/assets/${photos[activePhoto][0]}.png`} alt={photos[activePhoto][1]}/><div className="thumbnails">{photos.map(([src, alt], i) => <button className={i === activePhoto ? 'selected' : ''} key={src} onClick={() => setActivePhoto(i)} aria-label={alt}><img src={`/assets/${src}.png`} alt={alt}/></button>)}</div><p>{activePhoto + 1} / {photos.length}</p></> : null}
      {(modal === 'booking' || modal === 'group' || modal === 'contact') && <><p className="eyebrow">PGBEE · STAY HUB</p><h2>{modal === 'contact' ? 'Contact John Doe' : modal === 'group' ? 'Plan your group stay' : 'Your stay starts here'}</h2>{submitted ? <div className="confirmation"><h3>{modal === 'contact' ? 'Message prepared' : 'Stay details saved'}</h3><p>This is a frontend preview. {modal === 'contact' ? 'Your message has not been sent.' : 'No reservation or payment has been made.'}</p><button className="primary" onClick={() => setModal(null)}>Done</button></div> : <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }}><p className="dialog-description">{modal === 'contact' ? 'Ask the host a question about the property.' : `Vattappara, Kerala · ${symbol}${price}`}</p><label>Your name<input name="name" autoComplete="name" placeholder="John Doe" required/></label><label>Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required/></label>{modal !== 'contact' && <><div className="form-row"><label>Check-in<input aria-label="Check-in" type="date" name="checkin" min={new Date().toLocaleDateString('en-CA')} required onChange={e => { const out = e.currentTarget.form?.elements.namedItem('checkout') as HTMLInputElement; if (out) out.min = e.target.value; }}/></label><label>Check-out<input aria-label="Check-out" type="date" name="checkout" required/></label></div><label>Guests<input name="guests" type="number" min={modal === 'group' ? 2 : 1} max="30" defaultValue={modal === 'group' ? 6 : 2} required/></label></>}{modal !== 'booking' && <label>{modal === 'contact' ? 'Message' : 'Anything else we should know?'}<textarea name="message" rows={3} required={modal === 'contact'} placeholder="Tell us a little more…"/></label>}<p className="preview-note">Frontend preview — no payment or message will be sent.</p><button type="submit" className="primary">{modal === 'contact' ? 'Prepare message' : 'Review stay'}</button></form>}</>}
      {modal === 'wishlist' && <><h2>Your wishlist</h2><div className="wishlist-item"><img src="/assets/property-main.png" alt="Stay Hub"/><div><h3>STAY HUB</h3><p>Vattappara, Kerala</p><strong>{symbol}{price}</strong></div></div><button className="primary" onClick={() => setSaved(!saved)}>{saved ? 'Remove from wishlist' : 'Save Stay Hub to wishlist'}</button></>}
      {modal === 'account' && <><h2>Hi, John Doe</h2><p className="dialog-description">Welcome to PgBee. Find your next stay and keep your favourites close.</p><button className="primary" onClick={() => setModal('wishlist')}>View your wishlist</button></>}
      {modal === 'language' && <><h2>Language</h2><button className="option selected" onClick={() => setModal(null)}>English <span>✓</span></button></>}
      {modal === 'currency' && <><h2>Choose currency</h2>{['INR', 'USD'].map(value => <button className={`option ${currency === value ? 'selected' : ''}`} key={value} onClick={() => { setCurrency(value); setModal(null); }}>{value === 'INR' ? '₹ Indian Rupee' : '$ US Dollar'}{currency === value && <span>✓</span>}</button>)}<p className="preview-note">USD prices are illustrative.</p></>}
      {(modal === 'Privacy' || modal === 'Terms' || modal === 'Company details') && <><h2>{modal}</h2><p className="dialog-description">{modal === 'Privacy' ? 'This frontend demo does not send your form details to a server. Wishlist selections are kept only while this page is open.' : modal === 'Terms' ? 'This property page is a design preview. Prices are illustrative, and bookings and payments are not processed.' : 'PgBee · Stay Hub in Vattappara, Kerala, India. A stay experience for Dhwani ’26.'}</p></>}
    </dialog>
  </>;
}
