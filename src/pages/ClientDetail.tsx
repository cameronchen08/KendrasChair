import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadClients } from '../utils/storage';
import { buildProfColorMap } from '../utils/colors';
import { getInitials } from '../utils/image';
import Lightbox from '../components/Lightbox';
import './ClientDetail.css';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const clients = useMemo(() => loadClients(), []);
  const client = useMemo(() => clients.find(c => c.id === id), [clients, id]);
  const colorMap = useMemo(() => buildProfColorMap(clients), [clients]);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [profileLightbox, setProfileLightbox] = useState(false);

  if (!client) {
    return (
      <div className="detail-page">
        <nav className="detail-nav">
          <Link to="/gallery" className="detail-back">&#8592; Back to gallery</Link>
        </nav>
        <div className="detail-not-found">
          <p>Client not found.</p>
          <Link to="/gallery" className="btn-secondary" style={{ marginTop: 16 }}>
            &#8592; Back to gallery
          </Link>
        </div>
      </div>
    );
  }

  const profColor = colorMap.get(client.profession.trim());

  const noteItems = client.notes
    ? client.notes.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  const igHandle = client.instagram?.replace(/^@/, '') ?? '';
  const ttHandle = client.tiktok?.replace(/^@/, '') ?? '';

  const portfolioImages = client.portfolio ?? [];

  return (
    <div className="detail-page">
      <nav className="detail-nav">
        <Link to="/gallery" className="detail-back">&#8592; Back to gallery</Link>
      </nav>

      <main className="detail-main">
        <div className="detail-card">
          {/* Profile photo */}
          {client.photo ? (
            <img
              className="detail-photo"
              src={client.photo}
              alt={client.name}
              onClick={() => setProfileLightbox(true)}
              style={{ cursor: 'zoom-in' }}
            />
          ) : (
            <div className="detail-photo-placeholder">{getInitials(client.name)}</div>
          )}

          {/* Name & pronouns */}
          <h1 className="detail-name">{client.name}</h1>
          {client.pronouns && <p className="detail-pronouns">{client.pronouns}</p>}

          {/* Profession chip */}
          <span
            className="profession-chip detail-profession"
            style={profColor ? {
              '--chip-bg': profColor.bg,
              '--chip-border': profColor.border,
              '--chip-text': profColor.text,
            } as React.CSSProperties : undefined}
          >
            {client.profession}
          </span>

          {/* Profession description */}
          {client.profDesc && <p className="detail-prof-desc">{client.profDesc}</p>}

          {/* Services */}
          {noteItems.length > 0 && (
            <div className="detail-section">
              <span className="detail-section-label">Services Offered</span>
              <ul className="card-notes-list">
                {noteItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}

          {/* Website */}
          {client.website && (
            <div className="detail-section">
              <span className="detail-section-label">Website</span>
              <a
                className="detail-website"
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {client.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Contact */}
          {(client.email || client.phone) && (
            <div className="detail-section">
              <span className="detail-section-label">Contact</span>
              <div className="detail-socials">
                {client.email && (
                  <a className="detail-social-link" href={`mailto:${client.email}`}>
                    &#128231; {client.email}
                  </a>
                )}
                {client.phone && (
                  <span className="detail-social-link">&#128222; {client.phone}</span>
                )}
              </div>
            </div>
          )}

          {/* Social media */}
          {(igHandle || ttHandle) && (
            <div className="detail-section">
              <span className="detail-section-label">Social Media</span>
              <div className="detail-socials">
                {igHandle && (
                  <a
                    className="detail-social-link"
                    href={`https://instagram.com/${igHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &#128247; @{igHandle}
                  </a>
                )}
                {ttHandle && (
                  <a
                    className="detail-social-link"
                    href={`https://tiktok.com/@${ttHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &#127926; @{ttHandle}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Favorite service */}
          {client.favService && (
            <div className="detail-section">
              <span className="detail-section-label">Favorite Tres Jolie Hair Service</span>
              <p className="detail-fav">&#9733; {client.favService}</p>
            </div>
          )}

          {/* Portfolio */}
          {portfolioImages.length > 0 && (
            <div className="detail-section">
              <span className="detail-section-label">Portfolio</span>
              <div className="detail-portfolio-grid">
                {portfolioImages.map((src, i) => (
                  <img
                    key={i}
                    className="detail-portfolio-photo"
                    src={src}
                    alt={`Portfolio photo ${i + 1}`}
                    onClick={() => setLightboxIdx(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Profile photo lightbox */}
      {profileLightbox && client.photo && (
        <Lightbox
          images={[client.photo]}
          index={0}
          onClose={() => setProfileLightbox(false)}
          alt={client.name}
        />
      )}

      {/* Portfolio lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          images={portfolioImages}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => i === null ? null : (i - 1 + portfolioImages.length) % portfolioImages.length)}
          onNext={() => setLightboxIdx(i => i === null ? null : (i + 1) % portfolioImages.length)}
          alt="Portfolio photo"
        />
      )}
    </div>
  );
}
