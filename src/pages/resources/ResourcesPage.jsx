import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  file_blob: null,
  file_type: 'document'
};

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushNotification } = useUI();
  const { query, run } = useDatabase();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load resources from database
  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await query('SELECT resources.*, users.name AS author_name FROM resources LEFT JOIN users ON users.id = resources.created_by ORDER BY created_at DESC');
      setResources(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load resources on component mount
  useEffect(() => {
    loadResources();
  }, []);

  // Create resource
  const create = async (resourceData) => {
    try {
      const result = await run(
        'INSERT INTO resources (title, category, description, link, file_name, file_blob, file_type, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [resourceData.title, resourceData.category, resourceData.description, resourceData.link, resourceData.file_name, resourceData.file_blob, resourceData.file_type, resourceData.created_by]
      );
      await loadResources(); // Reload data
      return result;
    } catch (err) {
      throw err;
    }
  };

  // Update resource
  const update = async (id, resourceData) => {
    try {
      const result = await run(
        'UPDATE resources SET title = $1, category = $2, description = $3, link = $4, file_name = $5, file_blob = $6, file_type = $7 WHERE id = $8',
        [resourceData.title, resourceData.category, resourceData.description, resourceData.link, resourceData.file_name, resourceData.file_blob, resourceData.file_type, id]
      );
      await loadResources(); // Reload data
      return result;
    } catch (err) {
      throw err;
    }
  };

  // Delete resource
  const remove = async (id) => {
    try {
      await run('DELETE FROM resources WHERE id = $1', [id]);
      await loadResources(); // Reload data
    } catch (err) {
      throw err;
    }
  };

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin';

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
      file_blob: resource.file_blob ?? null,
      file_type: resource.file_type ?? 'document'
    });
    setEditingId(resource.id);
    setOpenModal(true);
  };

  const handleDelete = async (resource) => {
    try {
      await remove(resource.id);
      pushNotification({
        title: 'Resource removed',
        message: `${resource.title} deleted successfully`,
        status: 'success'
      });
    } catch (err) {
      pushNotification({
        title: 'Error',
        message: 'Failed to delete resource',
        status: 'error'
      });
    }
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
      file_type: form.file_type,
      created_by: user.id,
      author_name: user.name
    };
    
    try {
      if (editingId) {
        await update(editingId, payload);
        pushNotification({ title: 'Resource updated', message: payload.title, status: 'success' });
      } else {
        await create(payload);
        pushNotification({ title: 'Resource added', message: payload.title, status: 'success' });
      }
    } catch (error) {
      pushNotification({ title: 'Error', message: 'Failed to save resource', status: 'error' });
    }
    
    resetForm();
    setOpenModal(false);
    setUploading(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const base64 = await fileToBase64(file);
    const fileType = file.type.startsWith('video/') ? 'video' : 'document';
    setForm((prev) => ({ 
      ...prev, 
      file_name: file.name, 
      file_blob: base64, 
      link: '',
      file_type: fileType
    }));
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
            row.file_type === 'video' ? (
              <button type="button" onClick={() => navigate(`/video/${row.id}`)}>
                🎥 Watch
              </button>
            ) : (
              <button type="button" onClick={() => navigate(`/resources/${row.id}`)}>
                Download
              </button>
            )
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
        actions={isAdmin ? <Button onClick={handleOpenCreate}>Add resource</Button> : null}
      />
      <div className="card">
        {resources.length ? (
          <DataTable
            columns={columns}
            data={resources}
            actions={isAdmin ? [
              { label: 'Edit', onClick: handleEdit },
              { label: 'Delete', intent: 'danger', onClick: handleDelete }
            ] : [
              { label: 'Delete', intent: 'danger', onClick: handleDelete }
            ]}
          />
        ) : (
          <EmptyState
            title="No resources yet"
            description="Admins and experts can populate guides, forms, and data sets."
            actions={isAdmin ? <Button onClick={handleOpenCreate}>Add your first resource</Button> : null}
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
          <FormSection title="Access" description="Provide an external link, upload a document, or add a video file.">
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
                <label htmlFor="file">Upload file (Document or Video)</label>
                <input 
                  id="file" 
                  type="file" 
                  accept=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.wmv,.webm"
                  onChange={handleFileUpload} 
                />
              </div>
            </div>
            {form.file_name && (
              <p className="file-preview">
                Selected file: {form.file_name} 
                {form.file_type === 'video' && ' 🎥 Video'}
              </p>
            )}
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default ResourcesPage;
