import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormSection from '../../components/forms/FormSection.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useTempStore } from '../../hooks/useTempStore.js';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../hooks/useUI.js';
import './ConnectionsPage.css';

const defaultForm = {
  user_id: '',
  sector_id: '',
  status: 'pending',
  notes: ''
};

const ConnectionsPage = () => {
  const { user } = useAuth();
  const { pushNotification } = useUI();
  const { data: connections, create, update, delete: remove } = useTempStore(
    'sector_connections',
    'SELECT sector_connections.*, sectors.name AS sector_name, sectors.type AS sector_type FROM sector_connections JOIN sectors ON sectors.id = sector_connections.sector_id ORDER BY created_at DESC'
  );
  const { data: users } = useSqlQuery("SELECT id, name FROM users WHERE role IN ('farmer','admin') ORDER BY name ASC");
  const { data: sectors } = useSqlQuery('SELECT id, name FROM sectors ORDER BY name ASC');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin';

  const farmerOptions = useMemo(() => users.map((user) => ({ value: user.id, label: user.name })), [users]);
  const sectorOptions = useMemo(() => sectors.map((sector) => ({ value: sector.id, label: sector.name })), [sectors]);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (connection) => {
    setForm({
      user_id: connection.user_id,
      sector_id: connection.sector_id,
      status: connection.status,
      notes: connection.notes ?? ''
    });
    setEditingId(connection.id);
    setModalOpen(true);
  };

  const removeConnection = (connection) => {
    remove(connection.id);
    pushNotification({ title: 'Connection removed (temporary)', message: `${connection.user_name} ↔ ${connection.sector_name}`, status: 'warning' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.user_id || !form.sector_id) {
      return;
    }
    const payload = {
      user_id: Number(form.user_id),
      sector_id: Number(form.sector_id),
      status: form.status,
      notes: form.notes
    };
    
    try {
      if (editingId) {
        update(editingId, payload);
        pushNotification({ title: 'Connection updated (temporary)', message: 'Farmer-sector link updated', status: 'success' });
      } else {
        create(payload);
        pushNotification({ title: 'Connection created (temporary)', message: 'New farmer-sector link created', status: 'success' });
      }
    } catch (error) {
      pushNotification({ title: 'Error', message: 'Failed to save connection', status: 'error' });
    }
    
    setModalOpen(false);
  };

  return (
    <div className="connections-page">
      <PageHeader
        title="Sector connections"
        subtitle="Track how farmers collaborate with sector partners and manage the lifecycle of engagements."
        actions={isAdmin ? <Button onClick={openCreate}>Create connection</Button> : null}
      />
      <div className="card">
        {connections.length ? (
          <DataTable
            columns={[
              { title: 'Farmer', accessor: 'user_name' },
              { title: 'Partner', accessor: 'sector_name' },
              { title: 'Status', accessor: 'status' },
              { title: 'Notes', accessor: 'notes' }
            ]}
            data={connections}
            actions={isAdmin ? [
              { label: 'Edit', onClick: openEdit },
              { label: 'Delete', intent: 'danger', onClick: removeConnection }
            ] : [
              { label: 'Delete', intent: 'danger', onClick: removeConnection }
            ]}
            onRowClick={isAdmin ? openEdit : null}
          />
        ) : (
          <EmptyState
            title="No connections"
            description="Link farmers with partners to track collaborations."
            actions={isAdmin ? <Button onClick={openCreate}>Add connection</Button> : null}
          />
        )}
      </div>
      <Modal
        open={modalOpen}
        title={editingId ? 'Update connection' : 'Create connection'}
        description="Associate farmers with sector partners and monitor progress."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="connection-form">
              {editingId ? 'Save changes' : 'Create connection'}
            </button>
          </div>
        }
      >
        <form id="connection-form" onSubmit={handleSubmit} className="connection-form">
          <FormSection title="Assignment" description="Choose the farmer and sector to link.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="connection-farmer">Farmer</label>
                <select
                  id="connection-farmer"
                  value={form.user_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))}
                  required
                >
                  <option value="">Select farmer</option>
                  {farmerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="connection-sector">Sector</label>
                <select
                  id="connection-sector"
                  value={form.sector_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, sector_id: event.target.value }))}
                  required
                >
                  <option value="">Select sector</option>
                  {sectorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>
          <FormSection title="Status" description="Track relationship progress.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="connection-status">Status</label>
                <select
                  id="connection-status"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_discussion">In discussion</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="connection-notes">Notes</label>
              <textarea
                id="connection-notes"
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default ConnectionsPage;
