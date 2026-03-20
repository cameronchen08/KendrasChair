import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { loadClients, saveClients } from '../utils/storage';
import { connectFile, createFile, writeToFile, disconnectFile, isFileConnected } from '../utils/fileStorage';
import { buildProfColorMap } from '../utils/colors';
import { getInitials, compressImage, readFileAsDataUrl } from '../utils/image';
import { isAuthenticated, authenticate, signOut } from '../utils/auth';
import CropModal from '../components/CropModal';
import type { Client } from '../types';
import './Admin.css';

const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

const EMPTY_FORM: Omit<Client, 'id' | 'photo' | 'portfolio'> = {
  name: '',
  profession: '',
  profDesc: '',
  pronouns: '',
  favService: '',
  website: '',
  notes: '',
  instagram: '',
  tiktok: '',
  email: '',
  phone: '',
};

// ── Auth Gate ─────────────────────────────────────────────────

function AuthGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (authenticate(password)) {
      onAuth();
    } else {
      setError(true);
      setPassword('');
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-dialog">
        <div className="auth-icon">&#128274;</div>
        <h2 className="auth-title">Admin Access</h2>
        <p className="auth-subtitle">Enter the admin password to continue</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <span className="form-error">Incorrect password. Try again.</span>}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Unlock
          </button>
        </form>
        <Link to="/" className="auth-back">&#8592; Back to home</Link>
      </div>
    </div>
  );
}

// ── Client Form Modal ─────────────────────────────────────────

interface FormModalProps {
  initial?: Client;
  onSave: (data: Client) => void;
  onClose: () => void;
}

function FormModal({ initial, onSave, onClose }: FormModalProps) {
  const [form, setForm] = useState<Omit<Client, 'id' | 'photo' | 'portfolio'>>(() =>
    initial ? {
      name: initial.name,
      profession: initial.profession,
      profDesc: initial.profDesc,
      pronouns: initial.pronouns,
      favService: initial.favService,
      website: initial.website,
      notes: initial.notes,
      instagram: initial.instagram,
      tiktok: initial.tiktok,
      email: initial.email,
      phone: initial.phone,
    } : { ...EMPTY_FORM }
  );

  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [portfolio, setPortfolio] = useState<string[]>(initial?.portfolio ?? []);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState<{ name?: string; profession?: string }>({});
  const [saveError, setSaveError] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const set = useCallback((field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value })), []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('File too large (max 15 MB).');
      e.target.value = '';
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setCropSrc(dataUrl);
    e.target.value = '';
  }

  async function handlePortfolioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const compressed = await Promise.all(files.map(f => compressImage(f)));
    setPortfolio(prev => [...prev, ...compressed]);
    e.target.value = '';
  }

  function removePortfolioPhoto(index: number) {
    setPortfolio(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');
    const newErrors: { name?: string; profession?: string } = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.profession.trim()) newErrors.profession = 'Profession is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    onSave({
      id: initial?.id ?? uuidv4(),
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as typeof form,
      photo,
      portfolio,
    });
  }

  return (
    <>
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-dialog admin-modal">
          <div className="modal-header">
            <span className="modal-title">{initial ? 'Edit Client' : 'Add Client'}</span>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Photo upload */}
            <div className="form-group">
              <span className="form-label">Profile Photo</span>
              <div className="photo-upload-area">
                {photo ? (
                  <div className="photo-preview-wrap">
                    <img className="photo-preview" src={photo} alt="Preview" />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => setPhoto(null)}
                      aria-label="Remove photo"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="photo-placeholder-btn"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <span>&#128247;</span>
                    <span>Add Photo</span>
                  </button>
                )}
                {!photo && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    Choose Photo
                  </button>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                hidden
              />
              {photoError && <span className="form-error">{photoError}</span>}
            </div>

            {/* Name & Pronouns */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className={`form-input${errors.name ? ' input-error' : ''}`}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Full name"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Pronouns</label>
                <input
                  className="form-input"
                  value={form.pronouns}
                  onChange={e => set('pronouns', e.target.value)}
                  placeholder="e.g. she/her"
                />
              </div>
            </div>

            {/* Profession */}
            <div className="form-group">
              <label className="form-label">Profession *</label>
              <input
                className={`form-input${errors.profession ? ' input-error' : ''}`}
                value={form.profession}
                onChange={e => set('profession', e.target.value)}
                placeholder="e.g. Nurse, Teacher, Engineer"
              />
              {errors.profession && <span className="form-error">{errors.profession}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Profession Description</label>
              <input
                className="form-input"
                value={form.profDesc}
                onChange={e => set('profDesc', e.target.value)}
                placeholder="Brief description of their role"
                style={{ textAlign: 'left' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Services Offered</label>
              <textarea
                className="form-textarea"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="One service per line"
                rows={4}
              />
            </div>

            <span className="form-section-label">Contact & Online Presence</span>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                className="form-input"
                type="url"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  className="form-input"
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input
                  className="form-input"
                  value={form.instagram}
                  onChange={e => set('instagram', e.target.value)}
                  placeholder="@handle"
                />
              </div>
              <div className="form-group">
                <label className="form-label">TikTok</label>
                <input
                  className="form-input"
                  value={form.tiktok}
                  onChange={e => set('tiktok', e.target.value)}
                  placeholder="@handle"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Favorite Tres Jolie Hair Service</label>
              <input
                className="form-input"
                value={form.favService}
                onChange={e => set('favService', e.target.value)}
                placeholder="e.g. Balayage, Curly Cut"
              />
            </div>

            <span className="form-section-label">Portfolio Photos</span>

            <div className="form-group">
              <div className="portfolio-grid">
                {portfolio.map((src, i) => (
                  <div key={i} className="portfolio-thumb-wrap">
                    <img className="portfolio-thumb" src={src} alt={`Portfolio ${i + 1}`} />
                    <button
                      type="button"
                      className="portfolio-thumb-remove"
                      onClick={() => removePortfolioPhoto(i)}
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="portfolio-add-btn"
                  onClick={() => portfolioInputRef.current?.click()}
                >
                  +
                </button>
              </div>
              <input
                ref={portfolioInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePortfolioChange}
                hidden
              />
            </div>

            {saveError && <span className="form-error" style={{ display: 'block', marginBottom: 12 }}>{saveError}</span>}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary">
                {initial ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onApply={(dataUrl) => { setPhoto(dataUrl); setCropSrc(null); }}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>
  );
}

// ── Delete Dialog ─────────────────────────────────────────────

function DeleteDialog({ clientName, onConfirm, onCancel }: {
  clientName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-dialog" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">Delete Client</span>
          <button className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          This will permanently remove <strong>{clientName}</strong>. This action cannot be undone.
        </p>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Page ────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fileConnected, setFileConnected] = useState(false);

  const colorMap = useMemo(() => buildProfColorMap(clients), [clients]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.profession.toLowerCase().includes(term)
    );
  }, [clients, search]);

  function handleSave(client: Client) {
    const next = clients.find(c => c.id === client.id)
      ? clients.map(c => c.id === client.id ? client : c)
      : [...clients, client];

    if (!saveClients(next)) {
      alert('Failed to save — localStorage may be full.');
      return;
    }
    if (isFileConnected()) writeToFile(next);
    setClients(next);
    setShowForm(false);
    setEditingClient(undefined);
  }

  function handleDelete(id: string) {
    const next = clients.filter(c => c.id !== id);
    saveClients(next);
    if (isFileConnected()) writeToFile(next);
    setClients(next);
    setDeleteId(null);
  }

  function openAdd() {
    setEditingClient(undefined);
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setShowForm(true);
  }

  function handleSignOut() {
    signOut();
    setAuthed(false);
  }

  async function handleConnectFile() {
    const loaded = await connectFile();
    if (loaded !== null) {
      saveClients(loaded);
      setClients(loaded);
      setFileConnected(true);
    }
  }

  async function handleCreateFile() {
    const ok = await createFile(clients);
    if (ok) setFileConnected(true);
  }

  function handleDisconnectFile() {
    disconnectFile();
    setFileConnected(false);
  }

  if (!authed) {
    return <AuthGate onAuth={() => setAuthed(true)} />;
  }

  const deletingClient = deleteId ? clients.find(c => c.id === deleteId) : null;

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-subtitle">Manage Kendra's client gallery</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/" className="btn-secondary">&#8592; Home</Link>
            <Link to="/gallery" className="btn-secondary">Gallery</Link>
            <button className="btn-ghost-dark" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="admin-controls">
        <div className="admin-search-wrap">
          <input
            className="form-input"
            type="search"
            placeholder="Search clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="admin-file-controls">
          {fileConnected ? (
            <>
              <span className="file-status file-status--connected">&#10003; File connected</span>
              <button className="btn-ghost" onClick={handleDisconnectFile}>Disconnect</button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleConnectFile}>Open File</button>
              <button className="btn-secondary" onClick={handleCreateFile}>New File</button>
            </>
          )}
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Client</button>
      </div>

      {/* Grid */}
      <main className="admin-main">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>{clients.length === 0 ? 'No clients yet. Add your first!' : 'No clients match your search.'}</p>
          </div>
        ) : (
          <div className="admin-grid">
            {filtered.map(client => {
              const color = colorMap.get(client.profession.trim());
              return (
                <article key={client.id} className="admin-card">
                  {client.photo ? (
                    <img className="admin-card-photo" src={client.photo} alt={client.name} />
                  ) : (
                    <div className="admin-card-placeholder">{getInitials(client.name)}</div>
                  )}
                  <div className="admin-card-info">
                    <div className="admin-card-name">{client.name}</div>
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
                  </div>
                  <div className="admin-card-actions">
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(client)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => setDeleteId(client.id)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Form modal */}
      {showForm && (
        <FormModal
          initial={editingClient}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingClient(undefined); }}
        />
      )}

      {/* Delete dialog */}
      {deletingClient && (
        <DeleteDialog
          clientName={deletingClient.name}
          onConfirm={() => handleDelete(deletingClient.id)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
