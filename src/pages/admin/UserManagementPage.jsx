import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormSection from '../../components/forms/FormSection.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { useDatabase } from '../../hooks/useDatabase.js';
import { useUI } from '../../hooks/useUI.js';
import './UserManagementPage.css';

const defaultForm = {
  name: '',
  email: '',
  password: '',
  role: 'farmer',
  location: '',
  organization: ''
};

const UserManagementPage = () => {
  const { data: users } = useSqlQuery('SELECT * FROM users ORDER BY created_at DESC');
  const { run } = useDatabase();
  const { pushNotification } = useUI();
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  const roles = useMemo(
    () => [
      { id: 'admin', label: 'Admin' },
      { id: 'farmer', label: 'Farmer' },
      { id: 'expert', label: 'Expert' },
      { id: 'public', label: 'Public' }
    ],
    []
  );

  const filteredUsers = useMemo(() => {
    if (filter === 'all') {
      return users;
    }
    return users.filter((user) => user.role === filter);
  }, [users, filter]);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      location: user.location ?? '',
      organization: user.organization ?? ''
    });
    setEditingId(user.id);
    setModalOpen(true);
  };

  const removeUser = (user) => {
    run('DELETE FROM users WHERE id = ?', [user.id]);
    pushNotification({ title: 'User removed', message: user.name, status: 'warning' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return;
    }
    const values = [form.name, form.email, form.password, form.role, form.location, form.organization];
    if (editingId) {
      run(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ?, location = ?, organization = ? WHERE id = ?',
        [...values, editingId]
      );
      pushNotification({ title: 'User updated', message: form.name, status: 'success' });
    } else {
      run('INSERT INTO users (name, email, password, role, location, organization) VALUES (?, ?, ?, ?, ?, ?)', values);
      pushNotification({ title: 'User created', message: form.name, status: 'success' });
    }
    setModalOpen(false);
  };

  return (
    <div className="user-management-page">
      <PageHeader
        title="User management"
        subtitle="Add or update platform members across farmer, expert, admin, and public roles."
        actions={<Button onClick={openCreate}>Invite user</Button>}
      />
      <div className="card">
        <div className="toolbar">
          <label>
            <span>Filter by role</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">All</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filteredUsers.length ? (
          <DataTable
            columns={[
              { title: 'Name', accessor: 'name' },
              { title: 'Email', accessor: 'email' },
              { title: 'Role', accessor: 'role' },
              { title: 'Location', accessor: 'location' },
              { title: 'Organization', accessor: 'organization' }
            ]}
            data={filteredUsers}
            actions={[
              { label: 'Edit', onClick: openEdit },
              { label: 'Remove', intent: 'danger', onClick: removeUser }
            ]}
            onRowClick={openEdit}
          />
        ) : (
          <EmptyState
            title="No users found"
            description="Adjust filters or create new members."
            actions={<Button onClick={openCreate}>Add user</Button>}
          />
        )}
      </div>
      <Modal
        open={modalOpen}
        title={editingId ? 'Edit user' : 'Invite new user'}
        description="Provide role and organization details for this user."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="user-form">
              {editingId ? 'Save changes' : 'Create user'}
            </button>
          </div>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="user-form">
          <FormSection title="Profile" description="Manage identity and access details.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="user-name">Full name</label>
                <input
                  id="user-name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="user-email">Email</label>
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="user-password">Password</label>
                <input
                  id="user-password"
                  type="text"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="user-role">Role</label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="user-location">Location</label>
                <input
                  id="user-location"
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="State, Country"
                />
              </div>
              <div className="field">
                <label htmlFor="user-organization">Organization</label>
                <input
                  id="user-organization"
                  value={form.organization}
                  onChange={(event) => setForm((prev) => ({ ...prev, organization: event.target.value }))}
                  placeholder="Affiliated group"
                />
              </div>
            </div>
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
