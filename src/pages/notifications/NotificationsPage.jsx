import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormSection from '../../components/forms/FormSection.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import { useTempStore } from '../../hooks/useTempStore.js';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { useUI } from '../../hooks/useUI.js';
import './NotificationsPage.css';

const defaultForm = {
  user_id: '',
  title: '',
  message: '',
  level: 'info'
};

const NotificationsPage = () => {
  const { data: notifications, create, update, delete: remove } = useTempStore(
    'notifications',
    'SELECT notifications.*, users.name AS user_name FROM notifications LEFT JOIN users ON users.id = notifications.user_id ORDER BY created_at DESC'
  );
  const { data: users } = useSqlQuery('SELECT id, name FROM users ORDER BY name ASC');
  const { pushNotification } = useUI();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  const userOptions = useMemo(() => [{ value: '', label: 'All users' }, ...users.map((user) => ({ value: user.id, label: user.name }))], [users]);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (notification) => {
    setForm({
      user_id: notification.user_id ?? '',
      title: notification.title,
      message: notification.message,
      level: notification.level
    });
    setEditingId(notification.id);
    setModalOpen(true);
  };

  const removeNotification = (notification) => {
    remove(notification.id);
    pushNotification({ title: 'Notification deleted (temporary)', message: notification.title, status: 'warning' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      return;
    }
    const payload = {
      user_id: form.user_id ? Number(form.user_id) : null,
      title: form.title,
      message: form.message,
      level: form.level
    };
    
    try {
      if (editingId) {
        update(editingId, payload);
        pushNotification({ title: 'Notification updated (temporary)', message: form.title, status: 'success' });
      } else {
        create(payload);
        pushNotification({ title: 'Notification created (temporary)', message: form.title, status: 'success' });
      }
    } catch (error) {
      pushNotification({ title: 'Error', message: 'Failed to save notification', status: 'error' });
    }
    
    setModalOpen(false);
  };

  return (
    <div className="notifications-page">
      <PageHeader
        title="Platform notifications"
        subtitle="Broadcast updates, alerts, and reminders to the farming community."
        actions={<Button onClick={openCreate}>Send notification</Button>}
      />
      <div className="card">
        {notifications.length ? (
          <DataTable
            columns={[
              { title: 'Recipient', accessor: 'user_name', render: (value) => value || 'All users' },
              { title: 'Title', accessor: 'title' },
              { title: 'Level', accessor: 'level' },
              { title: 'Created at', accessor: 'created_at' }
            ]}
            data={notifications}
            actions={[
              { label: 'Edit', onClick: openEdit },
              { label: 'Delete', intent: 'danger', onClick: removeNotification }
            ]}
            onRowClick={openEdit}
          />
        ) : (
          <EmptyState
            title="No notifications yet"
            description="Use notifications to keep farmers informed about events, resources, and updates."
            actions={<Button onClick={openCreate}>Send first notification</Button>}
          />
        )}
      </div>
      <Modal
        open={modalOpen}
        title={editingId ? 'Edit notification' : 'Send notification'}
        description="Draft a message that will appear on dashboards."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="notification-form">
              {editingId ? 'Update message' : 'Send' }
            </button>
          </div>
        }
      >
        <form id="notification-form" onSubmit={handleSubmit} className="notification-form">
          <FormSection title="Message details" description="Choose recipients and craft the announcement.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="notif-user">Recipient</label>
                <select
                  id="notif-user"
                  value={form.user_id ?? ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))}
                >
                  {userOptions.map((option) => (
                    <option key={option.value ?? 'all'} value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="notif-level">Level</label>
                <select
                  id="notif-level"
                  value={form.level}
                  onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="notif-title">Title</label>
              <input
                id="notif-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="notif-message">Message</label>
              <textarea
                id="notif-message"
                rows={4}
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                required
              />
            </div>
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
