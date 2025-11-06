import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { useDatabase } from '../../hooks/useDatabase.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../hooks/useUI.js';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormSection from '../../components/forms/FormSection.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { fileToBase64 } from '../../utils/fileHelpers.js';
import './ResourcesPage.css';

const initialForm = {
  title: '',
  category: 'Guides',
  description: '',
  link: '',
  file_name: '',
  file_blob: null
};

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { run } = useDatabase();
  const { pushNotification } = useUI();
  const { data: resources } = useSqlQuery(
    'SELECT resources.*, users.name AS author_name FROM resources LEFT JOIN users ON users.id = resources.created_by ORDER BY created_at DESC'
  );
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = useMemo(
    () => ['Guides', 'Finance', 'Policy', 'Training', 'Technology', 'Data', 'Marketplace'],
    []
  );

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setUploading(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpenModal(true);
  };

  const handleEdit = (resource) => {
    setForm({
      title: resource.title,
      category: resource.category,
      description: resource.description ?? '',
      link: resource.link ?? '',
      file_name: resource.file_name ?? '',
      file_blob: resource.file_blob ?? null
    });
    setEditingId(resource.id);
    setOpenModal(true);
  };

  const handleDelete = (resource) => {
    run('DELETE FROM resources WHERE id = ?', [resource.id]);
    pushNotification({
      title: 'Resource removed',
      message: `${resource.title} deleted`,
      status: 'warning'
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      return;
    }
    setUploading(true);
    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      link: form.link,
      file_name: form.file_name,
      file_blob: form.file_blob,
      created_by: user.id
    };
    if (editingId) {
      run(
        'UPDATE resources SET title = ?, category = ?, description = ?, link = ?, file_name = ?, file_blob = ? WHERE id = ?',
        [
          payload.title,
          payload.category,
          payload.description,
          payload.link,
          payload.file_name,
          payload.file_blob,
          editingId
        ]
      );
      pushNotification({ title: 'Resource updated', message: payload.title, status: 'success' });
    } else {
      run(
        'INSERT INTO resources (title, category, description, link, file_name, file_blob, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          payload.title,
          payload.category,
          payload.description,
          payload.link,
          payload.file_name,
          payload.file_blob,
          payload.created_by
        ]
      );
      pushNotification({ title: 'Resource added', message: payload.title, status: 'success' });
    }
    resetForm();
    setOpenModal(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const base64 = await fileToBase64(file);
    setForm((prev) => ({ ...prev, file_name: file.name, file_blob: base64, link: '' }));
  };

  const columns = [
    { title: 'Title', accessor: 'title' },
    { title: 'Category', accessor: 'category' },
    { title: 'Added by', accessor: 'author_name' },
    {
      title: 'Access',
      accessor: 'link',
      render: (value, row) => (
        <div className="resource-actions">
          {value ? (
            <a href={value} target="_blank" rel="noreferrer">
              Visit
            </a>
          ) : row.file_name ? (
            <button type="button" onClick={() => navigate(`/resources/${row.id}`)}>
              Download
            </button>
          ) : (
            'N/A'
          )}
        </div>
      )
    },
    { title: 'Created', accessor: 'created_at' }
  ];

  return (
    <div className="resources-page">
      <PageHeader
        title="Resource library"
        subtitle="Central repository of guides, finance templates, policies, and multimedia for all roles."
        actions={<Button onClick={handleOpenCreate}>Add resource</Button>}
      />
      <div className="card">
        {resources.length ? (
          <DataTable
            columns={columns}
            data={resources}
            actions={[
              { label: 'Edit', onClick: handleEdit },
              { label: 'Delete', intent: 'danger', onClick: handleDelete }
            ]}
          />
        ) : (
          <EmptyState
            title="No resources yet"
            description="Admins and experts can populate guides, forms, and data sets."
            actions={<Button onClick={handleOpenCreate}>Add your first resource</Button>}
          />
        )}
      </div>
      <Modal
        open={openModal}
        title={editingId ? 'Update resource' : 'Add resource'}
        description="Fill in details and optionally upload a document."
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setOpenModal(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="resource-form" disabled={uploading}>
              {uploading ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <form id="resource-form" onSubmit={handleSubmit} className="resource-form">
          <FormSection title="Resource details" description="Describe the material farmers or experts will access.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </FormSection>
          <FormSection title="Access" description="Either provide an external link or upload the document.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="link">External link</label>
                <input
                  id="link"
                  type="url"
                  value={form.link}
                  placeholder="https://"
                  onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="file">Upload document</label>
                <input id="file" type="file" onChange={handleFileUpload} />
              </div>
            </div>
            {form.file_name && (
              <p className="file-preview">Selected file: {form.file_name}</p>
            )}
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default ResourcesPage;
