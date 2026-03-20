import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadClients } from '../utils/storage';
import { buildProfColorMap } from '../utils/colors';
import { getInitials } from '../utils/image';
import type { Client, SortMode } from '../types';
import './Gallery.css';

const SPARKLE_COUNT = 30;

function GallerySparkles() {
  const sparkles = useMemo(() =>
    Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${3 + Math.random() * 6}px`,
      delay: `${Math.random() * 4}s`,
      duration: `${2 + Math.random() * 3}s`,
    })),
    []
  );

  return (
    <div className="gallery-sparkles" aria-hidden="true">
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

interface ClientCardProps {
  client: Client;
  colorMap: Map<string, { bg: string; border: string; text: string }>;
  animDelay: number;
  isOpening: boolean;
  onClick: (id: string) => void;
}

function ClientCard({ client, colorMap, animDelay, isOpening, onClick }: ClientCardProps) {
  const color = colorMap.get(client.profession.trim());
  const initials = getInitials(client.name);

  const noteItems = client.notes
    ? client.notes.split('\n').map(s => s.trim()).filter(Boolean)
    : [];
  const shownNotes = noteItems.slice(0, 3);
  const extraCount = noteItems.length - shownNotes.length;

  return (
    <article
      className={`client-card${isOpening ? ' card-opening' : ''}`}
      style={{ animationDelay: `${animDelay}s` }}
      onClick={() => onClick(client.id)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(client.id)}
      role="button"
    >
      {client.photo ? (
        <img className="card-photo" src={client.photo} alt={client.name} />
      ) : (
        <div className="card-photo-placeholder">{initials}</div>
      )}
      <div className="card-info">
        <div className="card-name">{client.name}</div>
        {client.pronouns && <p className="card-pronouns">{client.pronouns}</p>}
        <span
          className="profession-chip"
          style={color ? {
            '--chip-bg': color.bg,
            '--chip-border': color.border,
            '--chip-text': color.text,
          } as React.CSSProperties : undefined}
        >
          {client.profession}
        </span>
        {client.profDesc && <p className="card-prof-desc">{client.profDesc}</p>}
        {shownNotes.length > 0 && (
          <div className="card-section">
            <span className="card-section-header">Services Offered</span>
            <ul className="card-notes-list">
              {shownNotes.map((item, i) => <li key={i}>{item}</li>)}
              {extraCount > 0 && <li className="card-notes-more">+{extraCount} more</li>}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Gallery() {
  const [clients] = useState<Client[]>(() => loadClients());
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showBackTop, setShowBackTop] = useState(false);
  const [clickedId, setClickedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const colorMap = useMemo(() => buildProfColorMap(clients), [clients]);
  const professions = useMemo(() =>
    [...new Set(clients.map(c => c.profession.trim()).filter(Boolean))].sort().slice(0, 7),
    [clients]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = activeFilters.size > 0
      ? clients.filter(c => activeFilters.has(c.profession.trim()))
      : [...clients];

    if (term) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.profession.toLowerCase().includes(term)
      );
    }

    if (sortMode === 'az') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortMode === 'za') result.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortMode === 'profession') result.sort((a, b) => a.profession.localeCompare(b.profession));

    return result;
  }, [clients, search, activeFilters, sortMode]);

  const countLabel = visible.length === clients.length
    ? `${clients.length} client${clients.length !== 1 ? 's' : ''}`
    : `Showing ${visible.length} of ${clients.length} client${clients.length !== 1 ? 's' : ''}`;

  const emptyMsg = clients.length === 0
    ? 'No clients have been added yet.'
    : 'No clients match your search.';

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleFilter = useCallback((prof: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(prof)) next.delete(prof);
      else next.add(prof);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setActiveFilters(new Set()), []);

  return (
    <div className="gallery-page">
      {/* Header */}
      <header className="gallery-header">
        <GallerySparkles />
        <div className="gallery-header-inner">
          <Link to="/" className="gallery-home-link">&#8592; Home</Link>
          <h1 className="gallery-title">Kendra's Clients</h1>
          <p className="gallery-subtitle">Meet the incredible professionals who sit in Kendra's chair</p>
        </div>
      </header>

      {/* Controls */}
      <div className="gallery-controls-wrap">
        <div className="gallery-controls">
          <div className="gallery-search-wrap">
            <span className="gallery-search-icon">&#128269;</span>
            <input
              className="gallery-search"
              type="search"
              placeholder="Search by name or profession…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search clients"
            />
          </div>
          <select
            className="form-select gallery-sort"
            value={sortMode}
            onChange={e => setSortMode(e.target.value as SortMode)}
            aria-label="Sort clients"
          >
            <option value="default">Sort: Default</option>
            <option value="az">Name A → Z</option>
            <option value="za">Name Z → A</option>
            <option value="profession">By Profession</option>
          </select>
        </div>

        {/* Filter chips */}
        {professions.length > 0 && (
          <div className="filter-chips">
            <button
              className={`filter-chip${activeFilters.size === 0 ? ' active' : ''}`}
              onClick={clearFilters}
            >
              All
            </button>
            {professions.map(prof => {
              const color = colorMap.get(prof);
              const isActive = activeFilters.has(prof);
              return (
                <button
                  key={prof}
                  className={`filter-chip${isActive ? ' active' : ''}`}
                  onClick={() => toggleFilter(prof)}
                  style={color && !isActive ? {
                    '--chip-bg': color.bg,
                    '--chip-border': color.border,
                    '--chip-text': color.text,
                  } as React.CSSProperties : undefined}
                >
                  {prof}
                </button>
              );
            })}
          </div>
        )}

        <p className="client-count">{countLabel}</p>
      </div>

      {/* Grid */}
      <main className="gallery-main">
        {visible.length === 0 ? (
          <div className="empty-state">
            <p>{emptyMsg}</p>
            {clients.length === 0 && (
              <Link to="/admin" className="btn-secondary" style={{ marginTop: 12 }}>
                Go to Admin &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="client-grid">
            {visible.map((client, i) => (
              <ClientCard
                key={client.id}
                client={client}
                colorMap={colorMap}
                animDelay={i * 0.06}
                isOpening={clickedId === client.id}
                onClick={(id) => {
                  setClickedId(id);
                  setTimeout(() => navigate(`/client/${id}`), 320);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Back to top */}
      {showBackTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          &#8593;
        </button>
      )}
    </div>
  );
}
