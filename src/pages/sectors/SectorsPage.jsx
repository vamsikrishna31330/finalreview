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
import './SectorsPage.css';

const initialForm = {
  name: '',
  type: 'Finance',
  contact: '',
  region: '',
  description: ''
};

const SectorsPage = () => {
  const { user } = useAuth();
  const { pushNotification } = useUI();
  const { data: sectors, create, update, delete: remove, loading, error } = useTempStore(
    'sectors',
    'SELECT * FROM sectors ORDER BY name ASC'
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // Debug logging
  console.log('SectorsPage debug:', { sectors, loading, error });

  if (error) {
    console.error('SectorsPage error:', error);
    return (
      <div className="sectors-page">
        <PageHeader title="Sector partners" subtitle="Error loading sectors" />
        <div className="card">
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }

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

  const handleDelete = (sector) => {
    try {
      console.log('Deleting sector:', sector);
      remove(sector.id);
      pushNotification({
        title: 'Sector removed',
        message: `${sector.name} deleted (temporary)`,
        status: 'warning'
      });
    } catch (error) {
      console.error('Delete error:', error);
      pushNotification({
        title: 'Error',
        message: 'Failed to delete sector',
        status: 'error'
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }
    const payload = {
      name: form.name,
      type: form.type,
      contact: form.contact,
      region: form.region,
      description: form.description
    };
    
    try {
      console.log('Submitting sector:', payload);
      if (editingId) {
        console.log('Updating sector:', editingId);
        update(editingId, payload);
        pushNotification({ title: 'Sector updated (temporary)', message: form.name, status: 'success' });
      } else {
        console.log('Creating sector');
        create(payload);
        pushNotification({ title: 'Sector added (temporary)', message: form.name, status: 'success' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      pushNotification({ title: 'Error', message: 'Failed to save sector', status: 'error' });
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
              { label: 'Delete', intent: 'danger', onClick: handleDelete }
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
