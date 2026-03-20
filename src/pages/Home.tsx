import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Lightbox from '../components/Lightbox';
import './Home.css';

const BASE = import.meta.env.BASE_URL;

const GALLERY_IMAGES = [
  `${BASE}images/Kendra_H_366.jpg`,
  `${BASE}images/Kendra_H_191.jpg`,
  `${BASE}images/Kendra_H_403.jpg`,
];

const SPARKLE_COUNT = 60;

function Sparkles() {
  const sparkles = Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${4 + Math.random() * 8}px`,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 3}s`,
  }));

  return (
    <div className="hero-sparkles" aria-hidden="true">
      {sparkles.map(s => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const openLightbox = useCallback((idx: number) => setLightboxIdx(idx), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevImg = useCallback(() =>
    setLightboxIdx(i => i === null ? null : (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length),
    []);
  const nextImg = useCallback(() =>
    setLightboxIdx(i => i === null ? null : (i + 1) % GALLERY_IMAGES.length),
    []);

  return (
    <div className="home-page">
      {/* Nav */}
      <nav className="home-nav">
        <span className="home-nav-brand">Tres Jolie Hair</span>
        <div className="home-nav-links">
          <a href="#about">About</a>
          <Link to="/gallery" className="nav-cta">Client Gallery</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <Sparkles />
        <div className="hero-inner">
          <p className="hero-eyebrow">Welcome to</p>
          <h1 className="hero-title">Kendra's Chair</h1>
          <svg
            className="hero-title-underline"
            viewBox="0 0 400 18"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4,10 C44,3 84,17 124,10 C164,3 204,17 244,10 C284,3 324,17 364,10 C378,7 390,8 396,10"
              fill="none"
              stroke="rgba(252,197,210,0.85)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="hero-sub">
            Looking for a service or specialty? Explore the unique talents of the professionals who have visited Tres Jolie Hair.
          </p>
          <div className="hero-actions">
            <Link to="/gallery" className="btn-primary">Meet My Clients</Link>
            <a href="#about" className="btn-ghost">Learn More</a>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#fdf6ee" />
          </svg>
        </div>
      </section>

      {/* About */}
      <section className="home-section" id="about">
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-photo-wrap">
              <img
                className="about-photo"
                src={`${BASE}images/Kendra_H_276.jpg`}
                alt="Kendra"
                onClick={() => setProfileOpen(true)}
                style={{ cursor: 'zoom-in' }}
              />
            </div>
            <div className="about-text">
              <span className="section-label">About</span>
              <h2>Hi, I'm Kendra</h2>
              <p>
                I'm the stylist behind Tres Jolie Hair, an anxiety, neurodiverse, LGBT+, and sensory friendly studio, dedicated to making every client feel confident and beautiful. From precision cuts to stunning color transformations, every appointment is a personalized experience.
              </p>
              <p>
                Over the years I've had the privilege of working with an incredible community of professionals — nurses, teachers, engineers, artists, and more. Their stories inspire me every single day.
              </p>
              <Link to="/gallery" className="btn-about-link">Meet my clients &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Photo gallery */}
      <section className="home-section home-section--tinted" id="photo-gallery">
        <div className="section-inner">
          <div className="home-photo-grid">
            {GALLERY_IMAGES.map((src, i) => (
              <img
                key={src}
                className="home-photo-tile"
                src={src}
                alt="Kendra"
                onClick={() => openLightbox(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="home-section home-section--tinted" id="explore">
        <div className="section-inner">
          <span className="section-label center">Explore</span>
          <h2 className="center">What's Inside</h2>
          <div className="page-cards">
            <Link to="/gallery" className="page-card">
              <div className="page-card-icon">&#128101;</div>
              <h3>Client Gallery</h3>
              <p>Browse the amazing professionals who have sat in Kendra's chair.</p>
              <span className="page-card-link">View gallery &rarr;</span>
            </Link>
            <a
              href="https://tresjoliehair.glossgenius.com/services"
              className="page-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="page-card-icon">&#128197;</div>
              <h3>Book an Appointment</h3>
              <p>Ready for a fresh look? Schedule your visit with Kendra at Tres Jolie Hair.</p>
              <span className="page-card-link">Book now &rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="home-section" id="contact">
        <div className="section-inner">
          <span className="section-label center">Get in Touch</span>
          <h2 className="center">Contact & Location</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">&#128205;</div>
              <h4>Location</h4>
              <p>
                Tres Jolie Hair<br />
                Salon Republic Alderwood<br /><br />
                18205 Alderwood Mall Pkwy, STE #A Room 102<br />
                Lynwood, WA 98037
              </p>
              <p>
                <a
                  href="https://maps.google.com/?q=18205+Alderwood+Mall+Pkwy+Lynnwood+WA+98037"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions &rarr;
                </a>
              </p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">&#128336;</div>
              <h4>Hours</h4>
              <div className="hours-table">
                {[
                  ['Monday', 'Closed'],
                  ['Tuesday', '7am – 4pm'],
                  ['Wednesday', '7am – 4pm'],
                  ['Thursday', '7am – 1pm'],
                  ['Friday', '7am – 4pm'],
                  ['Saturday', '8am – 4pm'],
                  ['Sunday', 'Closed'],
                ].map(([day, hours]) => (
                  <div key={day} className="hours-row">
                    <span>{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">&#128140;</div>
              <h4>Social</h4>
              <div className="social-links">
                <a href="https://instagram.com/kendranhair" target="_blank" rel="noopener noreferrer">
                  &#128247; @kendranhair
                </a>
                <a href="https://tiktok.com/@kennywiththegoodhair" target="_blank" rel="noopener noreferrer">
                  &#127926; @kennywiththegoodhair
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <div className="home-banner">
        <img src={`${BASE}images/Tres-jolie-hair-web-banner.png`} alt="Tres Jolie Hair" />
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2026 Kendra's Chair &mdash; Tres Jolie Hair. All rights reserved.</p>
        <p className="footer-admin-link">
          <Link to="/admin">Admin</Link>
        </p>
      </footer>

      {/* Profile lightbox */}
      {profileOpen && (
        <Lightbox
          images={[`${BASE}images/Kendra_H_276.jpg`]}
          index={0}
          onClose={() => setProfileOpen(false)}
          alt="Kendra"
        />
      )}

      {/* Gallery lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          images={GALLERY_IMAGES}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevImg}
          onNext={nextImg}
          alt="Kendra"
        />
      )}
    </div>
  );
}
