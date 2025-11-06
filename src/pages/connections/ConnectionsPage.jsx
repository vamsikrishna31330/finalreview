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
import './ConnectionsPage.css';

const defaultForm = {
  user_id: '',
  sector_id: '',
  status: 'pending',
  notes: ''
};

const ConnectionsPage = () => {
  const { data: connections } = useSqlQuery(
    'SELECT sector_connections.*, users.name AS user_name, sectors.name AS sector_name FROM sector_connections JOIN users ON users.id = sector_connections.user_id JOIN sectors ON sectors.id = sector_connections.sector_id ORDER BY created_at DESC'
  );
  const { data: users } = useSqlQuery("SELECT id, name FROM users WHERE role IN ('farmer','admin') ORDER BY name ASC");
  const { data: sectors } = useSqlQuery('SELECT id, name FROM sectors ORDER BY name ASC');
  const { run } = useDatabase();
  const { pushNotification } = useUI();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

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
    run('DELETE FROM sector_connections WHERE id = ?', [connection.id]);
    pushNotification({ title: 'Connection removed', message: `${connection.user_name} ↔ ${connection.sector_name}`, status: 'warning' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.user_id || !form.sector_id) {
      return;
    }
    const values = [Number(form.user_id), Number(form.sector_id), form.status, form.notes];
    if (editingId) {
      run('UPDATE sector_connections SET user_id = ?, sector_id = ?, status = ?, notes = ? WHERE id = ?', [...values, editingId]);
      pushNotification({ title: 'Connection updated', message: 'Farmer-sector link updated', status: 'success' });
    } else {
      run('INSERT INTO sector_connections (user_id, sector_id, status, notes) VALUES (?, ?, ?, ?)', values);
      pushNotification({ title: 'Connection created', message: 'New farmer-sector link created', status: 'success' });
    }
    setModalOpen(false);
  };

  return (
    <div className="connections-page">
      <PageHeader
        title="Sector connections"
        subtitle="Track how farmers collaborate with sector partners and manage the lifecycle of engagements."
        actions={<Button onClick={openCreate}>Create connection</Button>}
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
            actions={[
              { label: 'Edit', onClick: openEdit },
              { label: 'Delete', intent: 'danger', onClick: removeConnection }
            ]}
            onRowClick={openEdit}
          />
        ) : (
          <EmptyState
            title="No connections"
            description="Link farmers with partners to track collaborations."
            actions={<Button onClick={openCreate}>Add connection</Button>}
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
