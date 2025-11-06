import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import FormSection from '../../components/forms/FormSection.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useDatabase } from '../../hooks/useDatabase.js';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { useUI } from '../../hooks/useUI.js';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, switchRole } = useAuth();
  const { query, run } = useDatabase();
  const { pushNotification } = useUI();
  const [editing, setEditing] = useState(false);
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    location: user?.location ?? '',
    organization: user?.organization ?? '',
    avatar: user?.avatar ?? ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const { data: notifications } = useSqlQuery(
    'SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC LIMIT 10',
    [user?.id],
    { key: `notifications-${user?.id}` }
  );
  const { data: connections } = useSqlQuery(
    'SELECT sector_connections.*, sectors.name AS sector_name FROM sector_connections JOIN sectors ON sectors.id = sector_connections.sector_id WHERE user_id = ? ORDER BY created_at DESC',
    [user?.id],
    { key: `connections-${user?.id}` }
  );

  const roleOptions = useMemo(
    () => [
      { id: 'admin', label: 'Admin' },
      { id: 'farmer', label: 'Farmer' },
      { id: 'expert', label: 'Agricultural Expert' },
      { id: 'public', label: 'Public' }
    ],
    []
  );

  const handleProfileSave = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setError(null);
    run('UPDATE users SET name = ?, email = ?, location = ?, organization = ?, avatar = ? WHERE id = ?', [
      form.name.trim(),
      form.email.trim(),
      form.location.trim() || null,
      form.organization.trim() || null,
      form.avatar.trim() || null,
      user.id
    ]);
    pushNotification({ title: 'Profile updated', message: 'Your profile changes have been saved.', status: 'success' });
    setEditing(false);
  };

  const handlePasswordUpdate = (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    const [{ password: current }] = query('SELECT password FROM users WHERE id = ?', [user.id]);
    if (current !== passwordForm.currentPassword) {
      setPasswordError('Current password is incorrect');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password should be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    run('UPDATE users SET password = ? WHERE id = ?', [passwordForm.newPassword, user.id]);
    pushNotification({ title: 'Password updated', message: 'Sign in again to use your new password.', status: 'success' });
    setPasswordEditing(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!user) {
    return (
      <EmptyState
        title="No profile found"
        description="Log in or create an account to manage your profile."
        actions={<Button onClick={() => window.location.assign('/login')}>Go to login</Button>}
      />
    );
  }

  return (
    <div className="profile-page">
      <PageHeader
        title="My profile"
        subtitle="Manage your account details, security information, and view recent activity."
        actions={
          <Button variant="ghost" onClick={() => switchRole(user.role)}>
            Viewing as {user.role}
          </Button>
        }
      />
      <div className="profile-grid">
        <div className="card">
          <form onSubmit={handleProfileSave}>
            <FormSection
              title="Contact information"
              description="Keep your profile up to date so admins and experts can coordinate with you."
              aside="Visible to admins and sector partners."
            >
              <div className="grid-two">
                <label>
                  Full name
                  <input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                </label>
                <label>
                  Role
                  <input value={user.role} disabled />
                </label>
              </div>
              <label>
                Email
                <input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              </label>
              <div className="grid-two">
                <label>
                  Location
                  <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} />
                </label>
                <label>
                  Organization
                  <input
                    value={form.organization}
                    onChange={(event) => setForm((prev) => ({ ...prev, organization: event.target.value }))}
                  />
                </label>
              </div>
              <label>
                Avatar URL
                <input value={form.avatar} onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))} />
              </label>
            </FormSection>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => setForm({
                name: user.name,
                email: user.email,
                location: user.location ?? '',
                organization: user.organization ?? '',
                avatar: user.avatar ?? ''
              })}>
                Reset
              </button>
              <button type="submit" className="primary">
                Save changes
              </button>
            </div>
          </form>
        </div>
        <div className="card">
          <FormSection
            title="Security"
            description="Update your password regularly and keep your account protected."
            aside="Minimum 6 characters"
          >
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <label>
                Current password
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  required
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  required
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  required
                />
              </label>
              {passwordError && <p className="error">{passwordError}</p>}
              <div className="form-actions">
                <button type="button" className="secondary" onClick={() => setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                })}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Update password
                </button>
              </div>
            </form>
          </FormSection>
        </div>
      </div>
      <div className="profile-grid">
        <div className="card">
          <header className="section-header">
            <h3>Recent notifications</h3>
            <p>Latest announcements relevant to your role.</p>
          </header>
          {notifications.length ? (
            <ul className="timeline">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <span className={`badge ${notification.level}`}>{notification.level}</span>
                  <div>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <time>{new Date(notification.created_at).toLocaleString()}</time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No notifications" description="New alerts will appear here." />
          )}
        </div>
        <div className="card">
          <header className="section-header">
            <h3>Sector connections</h3>
            <p>Overview of your collaboration requests.</p>
          </header>
          {connections.length ? (
            <ul className="connections">
              {connections.map((connection) => (
                <li key={connection.id}>
                  <div>
                    <h4>{connection.sector_name}</h4>
                    <p>Status: {connection.status}</p>
                  </div>
                  <time>{new Date(connection.created_at).toLocaleDateString()}</time>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No connections"
              description="Explore the sector directory to initiate collaborations."
              actions={<Button onClick={() => window.location.assign('/connections')}>Manage connections</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
