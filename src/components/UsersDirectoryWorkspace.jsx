import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Copy,
  Check,
  Search,
  Edit3,
  Trash2,
  Download,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
  X,
  RefreshCw,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { api, money } from '../api';
import { Notice } from './shared';

export function UsersDirectoryWorkspace({
  currentUser,
  users = [],
  usersLoading = false,
  onRefreshUsers,
  onDeleteUser,
  onToggleVerified,
  courses = [],
  onUserCreated,
  onUserUpdated,
  onGrantAccessForUser,
  preapprovedGrants = [],
  preapprovedLoading = false,
  onClearAllPreapproved,
  onDeletePreapproved,
  onGrantSuccess,
}) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [enrolledFilter, setEnrolledFilter] = useState('all');

  // Copy state
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [quickGrantUser, setQuickGrantUser] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Filter users
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (verifiedFilter === 'verified' && !u.verified) return false;
      if (verifiedFilter === 'unverified' && u.verified) return false;
      if (enrolledFilter === 'enrolled' && (!u.courses || u.courses.length === 0)) return false;
      if (enrolledFilter === 'none' && u.courses && u.courses.length > 0) return false;

      if (!q) return true;
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchCourses = u.courses?.some((c) => c.title?.toLowerCase().includes(q));
      return matchName || matchEmail || matchCourses;
    });
  }, [users, search, roleFilter, verifiedFilter, enrolledFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter((u) => u.role === 'student').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const verified = users.filter((u) => u.verified).length;
    const enrolled = users.filter((u) => u.courses && u.courses.length > 0).length;
    return { total, students, admins, verified, enrolled, preapproved: preapprovedGrants.length };
  }, [users, preapprovedGrants]);

  // Copy individual email
  function handleCopyEmail(email) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  }

  // Copy all filtered emails
  function handleCopyAllEmails() {
    const emailsList = filteredUsers.map((u) => u.email).filter(Boolean);
    if (!emailsList.length) return;
    navigator.clipboard.writeText(emailsList.join(', '));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  }

  // Export CSV
  function handleExportCSV() {
    const headers = ['Name', 'Email', 'Role', 'Verified', 'Enrolled Courses', 'Registered Date'];
    const rows = filteredUsers.map((u) => [
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      u.role || 'student',
      u.verified ? 'Yes' : 'No',
      `"${(u.courses || []).map((c) => c.title).join('; ').replace(/"/g, '""')}"`,
      new Date(u.created_at).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fame-accounts-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="users-directory-workspace">
      {/* ── METRICS SUMMARY BAR ────────────────────────────────── */}
      <div className="accounts-stats-grid">
        <div className="accounts-stat-box">
          <div className="accounts-stat-icon">
            <Users size={20} />
          </div>
          <div className="accounts-stat-data">
            <strong>{stats.total}</strong>
            <span>Total Accounts in DB</span>
          </div>
        </div>

        <div className="accounts-stat-box">
          <div className="accounts-stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="accounts-stat-data">
            <strong>{stats.verified}</strong>
            <span>Verified Accounts</span>
          </div>
        </div>

        <div className="accounts-stat-box">
          <div className="accounts-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Mail size={20} />
          </div>
          <div className="accounts-stat-data">
            <strong>{stats.students}</strong>
            <span>Learner / Students</span>
          </div>
        </div>

        <div className="accounts-stat-box">
          <div className="accounts-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Shield size={20} />
          </div>
          <div className="accounts-stat-data">
            <strong>{stats.admins}</strong>
            <span>Owners &amp; Mentors</span>
          </div>
        </div>

        <div className="accounts-stat-box">
          <div className="accounts-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="accounts-stat-data">
            <strong>{stats.preapproved}</strong>
            <span>Pre-approved Grants</span>
          </div>
        </div>
      </div>

      {/* ── ACCOUNTS & EMAIL DIRECTORY CARD ───────────────────── */}
      <div className="accounts-directory-card">
        <div className="directory-header-row">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Accounts &amp; Email Database Directory</h3>
            <p className="muted" style={{ margin: '6px 0 0', fontSize: '.86rem' }}>
              Full administrative visibility into every registered user. Manage credentials, roles, email addresses, or permanently purge accounts.
            </p>
          </div>
          <div className="accounts-toolbar-right">
            <button
              type="button"
              className="button small"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus size={15} /> Add New Account
            </button>
            <button
              type="button"
              className="button small outline"
              onClick={handleCopyAllEmails}
              disabled={!filteredUsers.length}
              title="Copy all currently filtered emails to clipboard"
            >
              {copiedAll ? (
                <>
                  <Check size={14} style={{ color: 'var(--green)' }} /> Copied {filteredUsers.length} Emails!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy Emails ({filteredUsers.length})
                </>
              )}
            </button>
            <button
              type="button"
              className="button small outline"
              onClick={handleExportCSV}
              disabled={!filteredUsers.length}
              title="Export filtered accounts to a CSV file"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              type="button"
              className="button small outline"
              onClick={onRefreshUsers}
              disabled={usersLoading}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={usersLoading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── SEARCH & FILTER TOOLBAR ──────────────────────────── */}
        <div className="accounts-toolbar">
          <div className="accounts-toolbar-left">
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                className="directory-search-input"
                type="search"
                placeholder="Search by name, email, or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <select
              className="accounts-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Students only</option>
              <option value="admin">Admins only</option>
            </select>

            <select
              className="accounts-select"
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>

            <select
              className="accounts-select"
              value={enrolledFilter}
              onChange={(e) => setEnrolledFilter(e.target.value)}
            >
              <option value="all">All Enrolments</option>
              <option value="enrolled">Enrolled in courses</option>
              <option value="none">No active courses</option>
            </select>
          </div>

          <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
            Showing <strong>{filteredUsers.length}</strong> of {users.length} accounts
          </div>
        </div>

        {/* ── ACCOUNTS TABLE ───────────────────────────────────── */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Learner / Account</th>
                <th>Role</th>
                <th>Status</th>
                <th>Unlocked Programmes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = currentUser && currentUser.id === u.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="account-user-cell">
                        <span className="account-user-name">
                          {u.name || 'Learner'}
                          {isSelf && (
                            <span style={{ fontSize: '.68rem', padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 'bold' }}>
                              YOU
                            </span>
                          )}
                          {u.handle && (
                            <a
                              href={`/u/${u.handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="account-handle-link"
                              title={`View public profile @${u.handle}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '.74rem', color: 'var(--green)', textDecoration: 'none', marginLeft: '6px' }}
                            >
                              @{u.handle} <ExternalLink size={10} />
                            </a>
                          )}
                        </span>
                        <span className="account-user-email">
                          {u.email}
                          <button
                            type="button"
                            className="email-copy-btn"
                            onClick={() => handleCopyEmail(u.email)}
                            title="Copy email"
                          >
                            {copiedEmail === u.email ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
                          </button>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role === 'admin' ? <Shield size={11} /> : null}
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`verified-badge-btn ${u.verified ? 'verified' : 'unverified'}`}
                        onClick={() => onToggleVerified(u)}
                        title="Click to toggle verified status"
                      >
                        {u.verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {u.verified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td>
                      {u.courses && u.courses.length > 0 ? (
                        <div className="courses-tag-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {u.courses.map((c) => (
                            <div key={c.id} className="owner-course-progress-box" style={{ borderRadius: '6px', padding: '6px 9px', minWidth: '170px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', fontSize: '.75rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '125px' }} title={c.title}>
                                  {c.eyebrow ? `${c.eyebrow}` : c.title}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '.72rem', color: (c.percent === 100 ? '#15803d' : 'var(--green)') }}>
                                  {c.percent || 0}%
                                </span>
                              </div>
                              <div style={{ height: '4px', background: '#e0ece5', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                                <div style={{ height: '100%', background: (c.percent === 100 ? '#16a34a' : 'var(--green)'), width: `${Math.min(100, Math.max(0, c.percent || 0))}%`, borderRadius: '4px' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.65rem', color: 'var(--muted)', marginTop: '3px' }}>
                                <span>{c.completedCount || 0}/{c.lessonCount || 0} lessons</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="muted" style={{ fontSize: '.78rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <small>
                        {new Date(u.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </small>
                    </td>
                    <td>
                      <div className="account-action-buttons">
                        <button
                          type="button"
                          className="button small outline"
                          onClick={() => setQuickGrantUser(u)}
                          title="Grant a programme to this learner"
                        >
                          <BookOpen size={12} /> Grant
                        </button>
                        <button
                          type="button"
                          className="button small outline"
                          onClick={() => setEditingUser(u)}
                          title="Edit user details or password"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          className="button small outline danger-action-btn"
                          disabled={isSelf}
                          onClick={() => onDeleteUser(u.id, u.email)}
                          title={isSelf ? 'Cannot delete your active owner account' : 'Permanently delete account and database access'}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filteredUsers.length && (
            <p className="muted" style={{ padding: '30px', textAlign: 'center' }}>
              {search || roleFilter !== 'all' || verifiedFilter !== 'all'
                ? 'No registered accounts match your current filters.'
                : 'No accounts recorded in the database yet.'}
            </p>
          )}
        </div>

        {/* ── PRE-APPROVED GRANTS DIRECTORY ────────────────────── */}
        <div className="preapproved-section">
          <div className="directory-header-row">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Clock size={19} style={{ color: '#d97706' }} />
                Pre-Approved Access Grants ({preapprovedGrants.length})
              </h3>
              <p className="muted" style={{ margin: '5px 0 0', fontSize: '.84rem' }}>
                Emails listed here automatically receive instant unlocked course access upon registration or login.
              </p>
            </div>
            <div>
              {preapprovedGrants.length > 0 && (
                <button
                  type="button"
                  className="button small outline danger-action-btn"
                  onClick={onClearAllPreapproved}
                  disabled={preapprovedLoading}
                  title="Purge all pending pre-approved grants from the database"
                >
                  <Trash2 size={14} /> Clear All Pre-Approved Grants ({preapprovedGrants.length})
                </button>
              )}
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Recipient Email</th>
                  <th>Target Programme</th>
                  <th>Date Granted</th>
                  <th>Claim Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {preapprovedGrants.map((g) => {
                  const isClaimed = !!g.claimed_at;
                  return (
                    <tr key={g.id}>
                      <td>
                        <strong>{g.email}</strong>
                      </td>
                      <td>
                        <strong>{g.course_title || g.course_id}</strong>
                        {g.eyebrow && <small>{g.eyebrow}</small>}
                      </td>
                      <td>
                        <small>
                          {new Date(g.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </small>
                      </td>
                      <td>
                        {isClaimed ? (
                          <span className="access-type-pill grant">
                            <CheckCircle2 size={12} /> Claimed {g.claimed_by_name ? `by ${g.claimed_by_name}` : ''}
                          </span>
                        ) : (
                          <span className="access-type-pill" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                            <Clock size={12} /> Pending Registration
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button small outline danger-action-btn"
                          onClick={() => onDeletePreapproved(g.id, g.email)}
                          title="Remove pre-approved grant"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!preapprovedGrants.length && (
              <p className="muted" style={{ padding: '24px', textAlign: 'center' }}>
                No active pre-approved email grants in database. You can manually grant course access to learners individually above.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── CREATE USER MODAL ─────────────────────────────────── */}
      {showCreateModal && (
        <CreateUserModal
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onCreated={(newUser, initialPassword) => {
            setShowCreateModal(false);
            if (initialPassword) {
              setCreatedCredentials({ email: newUser.email, password: initialPassword });
            }
            onUserCreated();
          }}
        />
      )}

      {/* ── EDIT USER MODAL ───────────────────────────────────── */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentUser={currentUser}
          onClose={() => setEditingUser(null)}
          onUpdated={() => {
            setEditingUser(null);
            onUserUpdated();
          }}
        />
      )}

      {/* ── QUICK GRANT MODAL ─────────────────────────────────── */}
      {quickGrantUser && (
        <QuickGrantModal
          user={quickGrantUser}
          courses={courses}
          onClose={() => setQuickGrantUser(null)}
          onSuccess={() => {
            setQuickGrantUser(null);
            onGrantSuccess();
          }}
        />
      )}

      {/* ── NEW ACCOUNT CREDENTIALS DIALOG ───────────────────── */}
      {createdCredentials && (
        <div className="modal-backdrop">
          <div className="preview-modal" style={{ maxWidth: '520px' }}>
            <button
              type="button"
              className="button small outline close-modal"
              onClick={() => setCreatedCredentials(null)}
            >
              <X size={16} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', background: '#ecfdf5', color: '#059669', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
                <CheckCircle2 size={26} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Account Created in Database</h2>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '.88rem' }}>
                Share these login credentials with the student.
              </p>
            </div>

            <div style={{ background: 'var(--soft)', border: '1px solid var(--line)', borderRadius: '9px', padding: '16px 20px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <small style={{ display: 'block', color: 'var(--muted)', fontSize: '.74rem', textTransform: 'uppercase' }}>Email Address</small>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>{createdCredentials.email}</strong>
              </div>
              <div>
                <small style={{ display: 'block', color: 'var(--muted)', fontSize: '.74rem', textTransform: 'uppercase' }}>Temporary Password</small>
                <code style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--green)', background: 'var(--surface-alt)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--line)', display: 'inline-block', marginTop: '4px' }}>
                  {createdCredentials.password}
                </code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button outline"
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
                  alert('Credentials copied to clipboard!');
                }}
              >
                <Copy size={15} /> Copy Credentials
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setCreatedCredentials(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CREATE USER MODAL COMPONENT
// ─────────────────────────────────────────────────────────────
function CreateUserModal({ courses = [], onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [verified, setVerified] = useState(true);
  const [courseId, setCourseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await api('/admin/users', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim(),
          password: password.trim() || undefined,
          role,
          verified,
          courseId: courseId || undefined,
        },
      });
      onCreated(res.user, res.initialPassword);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="preview-modal" style={{ maxWidth: '560px' }}>
        <button type="button" className="button small outline close-modal" onClick={onClose}>
          <X size={16} />
        </button>
        <h2 style={{ marginBottom: '6px', fontSize: '1.6rem' }}>Create New Account in DB</h2>
        <p className="muted" style={{ margin: '0 0 20px', fontSize: '.86rem' }}>
          Manually register an account with immediate database access and optional course unlocking.
        </p>

        {error && <Notice>{error}</Notice>}

        <form onSubmit={handleSubmit}>
          <label>
            Full Name *
            <input
              required
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Email Address *
            <input
              required
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Account Password (Optional)
            <input
              type="text"
              placeholder="Leave blank to auto-generate a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small style={{ display: 'block', color: 'var(--muted)', marginTop: '4px', fontSize: '.76rem' }}>
              If left blank, a secure 12-character random password will be created and displayed.
            </small>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student / Learner</option>
                <option value="admin">Administrator / Owner</option>
              </select>
            </label>

            <label>
              Immediate Course Grant (Optional)
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">No Course (Registration Only)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.eyebrow} · {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              style={{ width: '16px', height: '16px', margin: 0 }}
            />
            <span>Mark Email as Pre-Verified</span>
          </label>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="button outline" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={busy || !name.trim() || !email.trim()}>
              <UserPlus size={16} /> {busy ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EDIT USER MODAL COMPONENT
// ─────────────────────────────────────────────────────────────
function EditUserModal({ user, currentUser, onClose, onUpdated }) {
  const isSelf = currentUser && currentUser.id === user.id;
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState(user.role || 'student');
  const [verified, setVerified] = useState(!!user.verified);
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: {
          name: name.trim(),
          email: email.trim(),
          role: isSelf ? undefined : role,
          verified,
          password: newPassword.trim() || undefined,
        },
      });
      onUpdated();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="preview-modal" style={{ maxWidth: '540px' }}>
        <button type="button" className="button small outline close-modal" onClick={onClose}>
          <X size={16} />
        </button>
        <h2 style={{ marginBottom: '6px', fontSize: '1.6rem' }}>Edit Account Credentials</h2>
        <p className="muted" style={{ margin: '0 0 20px', fontSize: '.86rem' }}>
          Update personal details, email address, role, or reset password for {user.email}.
        </p>

        {error && <Notice>{error}</Notice>}

        <form onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Email Address
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Set New Password (Optional)
            <input
              type="password"
              placeholder="Leave blank to keep existing password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>

          <label>
            Role
            <select
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student / Learner</option>
              <option value="admin">Administrator / Owner</option>
            </select>
            {isSelf && (
              <small style={{ color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                You cannot change the role of your active session account.
              </small>
            )}
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '9px', marginTop: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              style={{ width: '16px', height: '16px', margin: 0 }}
            />
            <span>Email Verified</span>
          </label>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="button outline" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={busy || !name.trim() || !email.trim()}>
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUICK GRANT MODAL COMPONENT
// ─────────────────────────────────────────────────────────────
function QuickGrantModal({ user, courses = [], onClose, onSuccess }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleGrant(e) {
    e.preventDefault();
    if (!courseId) return;
    setBusy(true);
    setError('');
    try {
      await api('/admin/enrol', {
        method: 'POST',
        body: { email: user.email, courseId },
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="preview-modal" style={{ maxWidth: '500px' }}>
        <button type="button" className="button small outline close-modal" onClick={onClose}>
          <X size={16} />
        </button>
        <h2 style={{ marginBottom: '6px', fontSize: '1.5rem' }}>Grant Course Access</h2>
        <p className="muted" style={{ margin: '0 0 20px', fontSize: '.86rem' }}>
          Select a programme to immediately grant lifetime unlocked access to <strong>{user.email}</strong>.
        </p>

        {error && <Notice>{error}</Notice>}

        <form onSubmit={handleGrant}>
          <label>
            Select Programme
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.eyebrow} · {c.title} ({money(c.price)})
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="button outline" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={busy || !courseId}>
              <BookOpen size={16} /> {busy ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
