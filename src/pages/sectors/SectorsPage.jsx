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
import './SectorsPage.css';

const initialForm = {
  name: '',
  type: 'Finance',
  contact: '',
  region: '',
  description: ''
};

const SectorsPage = () => {
  const { data: sectors, loading } = useSqlQuery('SELECT * FROM sectors ORDER BY name ASC');
  const { run } = useDatabase();
  const { pushNotification } = useUI();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const categories = useMemo(
    () => ['Finance', 'Logistics', 'Technology', 'Marketplace', 'Soil', 'Climate', 'Research'],
    []
  );

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (sector) => {
    setForm({
      name: sector.name,
      type: sector.type,
      contact: sector.contact ?? '',
      region: sector.region ?? '',
      description: sector.description ?? ''
    });
    setEditingId(sector.id);
    setModalOpen(true);
  };

  const removeSector = (sector) => {
    run('DELETE FROM sectors WHERE id = ?', [sector.id]);
    pushNotification({ title: 'Sector removed', message: sector.name, status: 'warning' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }
    const values = [form.name, form.type, form.contact, form.region, form.description];
    if (editingId) {
      run('UPDATE sectors SET name = ?, type = ?, contact = ?, region = ?, description = ? WHERE id = ?', [...values, editingId]);
      pushNotification({ title: 'Sector updated', message: form.name, status: 'success' });
    } else {
      run('INSERT INTO sectors (name, type, contact, region, description) VALUES (?, ?, ?, ?, ?)', values);
      pushNotification({ title: 'Sector added', message: form.name, status: 'success' });
    }
    setModalOpen(false);
  };

  const columns = [
    { title: 'Name', accessor: 'name' },
    { title: 'Type', accessor: 'type' },
    { title: 'Region', accessor: 'region' },
    { title: 'Contact', accessor: 'contact' }
  ];

  return (
    <div className="sectors-page">
      <PageHeader
        title="Sector partners"
        subtitle="Manage partners who support farmers through finance, logistics, technology, and more."
        actions={<Button onClick={openCreate}>Add sector</Button>}
      />
      <div className="card">
        {loading ? null : sectors.length ? (
          <DataTable
            columns={columns}
            data={sectors}
            actions={[
              { label: 'Edit', onClick: openEdit },
              { label: 'Delete', intent: 'danger', onClick: removeSector }
            ]}
            onRowClick={openEdit}
          />
        ) : (
          <EmptyState
            title="No sector partners"
            description="Document finance, logistics, research and other partners here."
            actions={<Button onClick={openCreate}>Add partner</Button>}
          />
        )}
      </div>
      <Modal
        open={modalOpen}
        title={editingId ? 'Update sector' : 'Add sector partner'}
        description="Capture essential details for collaboration."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="sector-form">
              {editingId ? 'Save changes' : 'Add sector'}
            </button>
          </div>
        }
      >
        <form id="sector-form" onSubmit={handleSubmit} className="sector-form">
          <FormSection title="Partner profile" description="This information appears across farmer dashboards.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="sector-name">Name</label>
                <input
                  id="sector-name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="sector-type">Type</label>
                <select
                  id="sector-type"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="sector-contact">Primary contact</label>
                <input
                  id="sector-contact"
                  value={form.contact}
                  onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
                  placeholder="email@partner.com"
                />
              </div>
              <div className="field">
                <label htmlFor="sector-region">Region</label>
                <input
                  id="sector-region"
                  value={form.region}
                  onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
                  placeholder="Geographical coverage"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="sector-description">Description</label>
              <textarea
                id="sector-description"
                rows={4}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default SectorsPage;
