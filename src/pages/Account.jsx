import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, Mail, Check, Upload, User, Globe, 
  Linkedin, Instagram, Twitter, ExternalLink, Copy, 
  Camera, Sparkles, Shield, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StudentLayout } from '../components/StudentLayout';
import { Notice, Loader } from '../components/shared';
import { api } from '../api.js';

const BUSINESS_STAGES = [
  'Idea Phase & Concept Development',
  'Recipe Formulation & Lab Testing',
  'Sample Pilot Batch & Feedback',
  'Commercial Manufacturing & Compliance',
  'Scaling Brand & Retail Distribution',
  'Founder & Mentor',
];

// Lightweight client-side canvas compressor for avatars (max 256x256 WebP/JPEG, ~20KB, 0% server overhead)
function compressAvatar(file, maxDimension = 256, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPG, PNG, WebP).'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for universal browser compatibility and small size
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to process image.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export function Account() {
  const { user, refresh, logout } = useAuth();
  const [tab, setTab] = useState('profile'); // profile, security
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [handle, setHandle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [businessStage, setBusinessStage] = useState('Idea Phase & Concept Development');
  const [focusArea, setFocusArea] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const res = await api('/profile/me');
        if (res.profile) {
          setName(user?.name || '');
          setHandle(res.profile.handle || '');
          setAvatar(res.profile.avatar || '');
          setHeadline(res.profile.headline || '');
          setBio(res.profile.bio || '');
          setLocation(res.profile.location || '');
          setBusinessStage(res.profile.business_stage || 'Idea Phase & Concept Development');
          setFocusArea(res.profile.focus_area || '');
          setWebsite(res.profile.website || '');
          setLinkedin(res.profile.linkedin || '');
          setInstagram(res.profile.instagram || '');
          setTwitter(res.profile.twitter || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [user?.id]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressAvatar(file);
      setAvatar(compressed);
      setMessage('Profile photo selected. Click "Save Changes" below to update.');
    } catch (err) {
      setError(err.message || 'Could not process photo.');
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await api('/profile/me', {
        method: 'PUT',
        body: {
          name: name.trim(),
          handle: handle.trim().toLowerCase(),
          avatar,
          headline: headline.trim(),
          bio: bio.trim(),
          location: location.trim(),
          business_stage: businessStage,
          focus_area: focusArea.trim(),
          website: website.trim(),
          linkedin: linkedin.trim(),
          instagram: instagram.trim(),
          twitter: twitter.trim(),
        },
      });
      setMessage('Your public profile and personality have been saved successfully!');
      await refresh();
    } catch (err) {
      setError(err.message || 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  }

  async function act(fn) {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const r = await fn();
      setMessage(r.message || 'Your account has been updated.');
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function copyPublicLink() {
    const shareUrl = `${window.location.origin}/u/${handle || 'me'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <StudentLayout>
      <span className="eyebrow">MEMBER SETTINGS</span>
      <h1>My Account &amp; Profile.</h1>
      <p>Manage your public personality, community presence, and security settings.</p>

      {/* Settings Navigation Tabs */}
      <div className="account-tabs">
        <button 
          className={`account-tab ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => { setTab('profile'); setMessage(''); setError(''); }}
        >
          <Sparkles size={16} /> Public Profile &amp; Personality
        </button>
        <button 
          className={`account-tab ${tab === 'security' ? 'active' : ''}`}
          onClick={() => { setTab('security'); setMessage(''); setError(''); }}
        >
          <Shield size={16} /> Security &amp; Credentials
        </button>
      </div>

      <div className="account-panel">
        <Notice>{error}</Notice>
        <Notice type="success">{message}</Notice>

        {tab === 'profile' ? (
          loadingProfile ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader />
              <p>Loading your profile settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              {/* Shareable profile banner */}
              <div className="shareable-link-card">
                <div className="shareable-info">
                  <span className="shareable-label">Your Shareable Public Profile:</span>
                  <span className="shareable-url">
                    {window.location.origin}/u/<strong>{handle || 'your-handle'}</strong>
                  </span>
                </div>
                <div className="shareable-buttons">
                  <button type="button" className="button small outline" onClick={copyPublicLink}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <Link to={`/u/${handle || 'me'}`} className="button small primary" target="_blank">
                    <ExternalLink size={14} /> View Live Profile
                  </Link>
                </div>
              </div>

              {/* Avatar Uploader Section */}
              <div className="avatar-edit-section">
                <div className="avatar-preview-box">
                  {avatar ? (
                    <img src={avatar} alt={name} className="avatar-preview-img" />
                  ) : (
                    <div className="avatar-preview-initials">
                      {name?.slice(0, 1).toUpperCase() || 'U'}
                    </div>
                  )}
                  <button 
                    type="button" 
                    className="avatar-overlay-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload profile photo"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div className="avatar-instructions">
                  <h4>Profile Picture</h4>
                  <p>Upload a clear portrait photo. Images are optimized and compressed automatically for blazing-fast page loads.</p>
                  <div className="avatar-actions-row">
                    <button 
                      type="button" 
                      className="button small outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Choose Photo
                    </button>
                    {avatar && (
                      <button 
                        type="button" 
                        className="text-button small danger"
                        onClick={() => setAvatar('')}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              <hr className="divider-subtle" />

              {/* Core Identity */}
              <div className="form-grid-2">
                <label>
                  Full Name
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    minLength={2} 
                    maxLength={80} 
                  />
                </label>
                <label>
                  Username / Shareable Handle (@)
                  <input 
                    value={handle} 
                    onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                    required 
                    minLength={2} 
                    maxLength={30} 
                    placeholder="e.g. foodfounder"
                  />
                  <small>Only lowercase letters, numbers, and underscores.</small>
                </label>
              </div>

              <label>
                Professional Headline / Subtitle
                <input 
                  value={headline} 
                  onChange={e => setHeadline(e.target.value)} 
                  placeholder="e.g. Founder @ NutriBite | Agro-processing & millet enthusiast" 
                  maxLength={120}
                />
              </label>

              <div className="form-grid-2">
                <label>
                  Current Business Stage
                  <select 
                    value={businessStage} 
                    onChange={e => setBusinessStage(e.target.value)}
                  >
                    {BUSINESS_STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  City / State (Location)
                  <input 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    placeholder="e.g. Pune, Maharashtra" 
                    maxLength={100}
                  />
                </label>
              </div>

              <label>
                Primary Focus Areas / Products
                <input 
                  value={focusArea} 
                  onChange={e => setFocusArea(e.target.value)} 
                  placeholder="e.g. Millets, Extruded Snacks, Ready-to-Cook, Cold Chain Logistics" 
                  maxLength={120}
                />
              </label>

              <label>
                Founder Bio &amp; Journey
                <textarea 
                  rows={4}
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  placeholder="Tell your story: What product are you building? What challenges have you overcome? What are you looking to learn from Manmath and the FAME network?"
                  maxLength={2500}
                />
              </label>

              <hr className="divider-subtle" />

              <h4>Social &amp; Web Links</h4>
              <div className="form-grid-2">
                <label>
                  Website / Brand URL
                  <input 
                    type="url" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    placeholder="https://yourbrand.com" 
                    maxLength={200}
                  />
                </label>
                <label>
                  LinkedIn Profile URL
                  <input 
                    type="url" 
                    value={linkedin} 
                    onChange={e => setLinkedin(e.target.value)} 
                    placeholder="https://linkedin.com/in/username" 
                    maxLength={200}
                  />
                </label>
                <label>
                  Instagram URL or Handle
                  <input 
                    value={instagram} 
                    onChange={e => setInstagram(e.target.value)} 
                    placeholder="https://instagram.com/brand or @handle" 
                    maxLength={200}
                  />
                </label>
                <label>
                  X (Twitter) Profile URL
                  <input 
                    value={twitter} 
                    onChange={e => setTwitter(e.target.value)} 
                    placeholder="https://twitter.com/username" 
                    maxLength={200}
                  />
                </label>
              </div>

              <div className="form-submit-row">
                <button className="button primary" disabled={busy}>
                  Save Profile &amp; Personality <Check size={17} />
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="security-edit-section">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newName = new FormData(e.currentTarget).get('name');
                act(() => api('/account', { method: 'PATCH', body: { name: newName } }));
              }}
            >
              <label>
                Account Name
                <input name="name" defaultValue={user?.name} required minLength={2} maxLength={80} />
              </label>
              <label>
                Email Address
                <input value={user?.email} disabled />
              </label>
              <div className="verification-status">
                {user?.verified ? (
                  <>
                    <CheckCircle2 />
                    Email verified
                  </>
                ) : (
                  <>
                    <Mail />
                    Email verification pending
                  </>
                )}
              </div>
              <button className="button primary" disabled={busy}>
                Update Name <Check size={17} />
              </button>
            </form>

            {!user?.verified && (
              <button
                disabled={busy}
                className="button outline"
                style={{ marginTop: '14px' }}
                onClick={() => act(() => api('/auth/resend', { method: 'POST' }))}
              >
                Send verification email
              </button>
            )}

            <hr />

            <h3>Password &amp; Security</h3>
            <p>
              We'll email you a one-time link to set a new password. Resetting your password signs out
              your existing sessions.
            </p>
            <button
              className="button outline"
              disabled={busy}
              onClick={() =>
                act(() => api('/auth/forgot', { method: 'POST', body: { email: user.email } }))
              }
            >
              Send password reset email
            </button>

            <div style={{ marginTop: '30px' }}>
              <button className="text-button danger" onClick={logout}>
                Sign out of FAME
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
