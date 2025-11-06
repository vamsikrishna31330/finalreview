import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormSection from '../../components/forms/FormSection.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { useDatabase } from '../../hooks/useDatabase.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../hooks/useUI.js';
import './EventsPage.css';

const defaultEventForm = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  location: '',
  sector_id: null
};

const EventsPage = () => {
  const { user } = useAuth();
  const { run } = useDatabase();
  const { pushNotification } = useUI();
  const { data: events } = useSqlQuery(
    'SELECT events.*, sectors.name AS sector_name, users.name AS creator_name FROM events LEFT JOIN sectors ON sectors.id = events.sector_id LEFT JOIN users ON users.id = events.created_by ORDER BY start_date ASC'
  );
  const { data: sectors } = useSqlQuery('SELECT id, name FROM sectors ORDER BY name ASC');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultEventForm);
  const [editingId, setEditingId] = useState(null);

  const sectorOptions = useMemo(() => sectors.map((item) => ({ value: item.id, label: item.name })), [sectors]);

  const openCreate = () => {
    setForm(defaultEventForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (eventItem) => {
    setForm({
      name: eventItem.name,
      description: eventItem.description ?? '',
      start_date: eventItem.start_date ?? '',
      end_date: eventItem.end_date ?? '',
      location: eventItem.location ?? '',
      sector_id: eventItem.sector_id ?? null
    });
    setEditingId(eventItem.id);
    setModalOpen(true);
  };

  const removeEvent = (eventItem) => {
    run('DELETE FROM events WHERE id = ?', [eventItem.id]);
    pushNotification({ title: 'Event removed', message: eventItem.name, status: 'warning' });
  };

  const handleSubmit = (submitEvent) => {
    submitEvent.preventDefault();
    if (!form.name.trim()) {
      return;
    }
    const values = [
      form.name,
      form.description,
      form.start_date,
      form.end_date,
      form.location,
      form.sector_id ? Number(form.sector_id) : null,
      user.id
    ];
    if (editingId) {
      run(
        'UPDATE events SET name = ?, description = ?, start_date = ?, end_date = ?, location = ?, sector_id = ?, created_by = ? WHERE id = ?',
        [...values, editingId]
      );
      pushNotification({ title: 'Event updated', message: form.name, status: 'success' });
    } else {
      run(
        'INSERT INTO events (name, description, start_date, end_date, location, sector_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        values
      );
      pushNotification({ title: 'Event created', message: form.name, status: 'success' });
    }
    setModalOpen(false);
  };

  return (
    <div className="events-page">
      <PageHeader
        title="Events & workshops"
        subtitle="Organize trainings, awareness drives, and sector meetups for farmers."
        actions={<Button onClick={openCreate}>Create event</Button>}
      />
      <div className="card">
        {events.length ? (
          <DataTable
            columns={[
              { title: 'Name', accessor: 'name' },
              { title: 'Sector', accessor: 'sector_name' },
              { title: 'Starts', accessor: 'start_date' },
              { title: 'Ends', accessor: 'end_date' },
              { title: 'Location', accessor: 'location' }
            ]}
            data={events}
            actions={[
              { label: 'Edit', onClick: openEdit },
              { label: 'Delete', intent: 'danger', onClick: removeEvent }
            ]}
          />
        ) : (
          <EmptyState
            title="No events scheduled"
            description="Use the button above to schedule awareness campaigns."
            actions={<Button onClick={openCreate}>Plan event</Button>}
          />
        )}
      </div>
      <Modal
        open={modalOpen}
        title={editingId ? 'Update event' : 'Create event'}
        description="Share key logistics and connect it to a relevant sector."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="event-form">
              {editingId ? 'Save changes' : 'Create event'}
            </button>
          </div>
        }
      >
        <form id="event-form" onSubmit={handleSubmit} className="event-form">
          <FormSection title="Event overview" description="Farmers and partners will see this information.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="event-name">Name</label>
                <input
                  id="event-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="event-sector">Sector</label>
                <select
                  id="event-sector"
                  value={form.sector_id ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, sector_id: e.target.value || null }))}
                >
                  <option value="">General</option>
                  {sectorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </FormSection>
          <FormSection title="Schedule" description="Share timing and location.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="event-start">Start date</label>
                <input
                  id="event-start"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="event-end">End date</label>
                <input
                  id="event-end"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="event-location">Location</label>
                <input
                  id="event-location"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default EventsPage;
