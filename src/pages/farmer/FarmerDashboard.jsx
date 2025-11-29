import { useMemo } from 'react';
import MetricCard from '../../components/dashboard/MetricCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const { data: resources } = useSqlQuery(
    "SELECT resources.*, users.name AS owner FROM resources LEFT JOIN users ON users.id = resources.created_by WHERE resources.category IN ('Guides','Finance') ORDER BY created_at DESC LIMIT 5"
  );
  const { data: events } = useSqlQuery(
    'SELECT events.*, sectors.name AS sector_name FROM events LEFT JOIN sectors ON sectors.id = events.sector_id ORDER BY start_date ASC LIMIT 5'
  );
  const { data: connections } = useSqlQuery(
    'SELECT sector_connections.*, sectors.name AS sector_name, sectors.type AS sector_type FROM sector_connections JOIN sectors ON sectors.id = sector_connections.sector_id WHERE user_id = 2 ORDER BY created_at DESC'
  );
  const { data: forums } = useSqlQuery(
    'SELECT forums.*, users.name AS created_by_name FROM forums LEFT JOIN users ON users.id = forums.created_by ORDER BY created_at DESC LIMIT 4'
  );

  const metrics = useMemo(
    () => ({
      totalResources: Array.isArray(resources) ? resources.length : 0,
      upcomingEvents: Array.isArray(events) ? events.length : 0,
      activeConnections: Array.isArray(connections) ? connections.filter((item) => item.status !== 'pending').length : 0,
      discussionBoards: Array.isArray(forums) ? forums.length : 0
    }),
    [resources, events, connections, forums]
  );

  return (
    <div className="farmer-dashboard">
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <PageHeader
            title="Farmer Dashboard"
            subtitle="Access agricultural resources and manage your farming connections"
          />
        </div>
      </div>
      <PageHeader
        title="Farmer Hub"
        subtitle="Discover tailored resources, manage partnerships, and stay updated on sector collaborations."
        actions={<Button onClick={() => window.location.assign('/resources')}>Browse library</Button>}
      />
      <section className="grid four">
        <MetricCard title="Helpful resources" value={metrics.totalResources} subtitle="Handpicked for you" />
        <MetricCard title="Upcoming events" value={metrics.upcomingEvents} subtitle="Next engagements" accent="secondary" />
        <MetricCard title="Active partners" value={metrics.activeConnections} subtitle="Live collaborations" />
        <MetricCard title="Forums" value={metrics.discussionBoards} subtitle="New conversations" accent="accent" />
      </section>
      <section className="two-column">
        <div className="card">
          <header className="section-header">
            <h3>Recent learning resources</h3>
            <p>Guides, financial templates, and support documents.</p>
          </header>
          {resources.length ? (
            <DataTable
              columns={[
                { title: 'Title', accessor: 'title' },
                { title: 'Category', accessor: 'category' },
                { title: 'Added by', accessor: 'owner' },
                { title: 'Link', accessor: 'link', render: (value) => (value ? <a href={value}>Open</a> : 'Uploaded') }
              ]}
              data={resources}
            />
          ) : (
            <EmptyState title="No resources yet" description="Admins and experts can add guides for you." />
          )}
        </div>
        <div className="card">
          <header className="section-header">
            <h3>Sector connections</h3>
            <p>Track collaboration status with partners.</p>
          </header>
          {connections.length ? (
            <DataTable
              columns={[
                { title: 'Sector', accessor: 'sector_name' },
                { title: 'Type', accessor: 'sector_type' },
                { title: 'Status', accessor: 'status' },
                { title: 'Notes', accessor: 'notes' }
              ]}
              data={connections}
            />
          ) : (
            <EmptyState
              title="No collaborations"
              description="Use the sector directory to request new partnerships."
              actions={<Button onClick={() => window.location.assign('/sectors')}>View sectors</Button>}
            />
          )}
        </div>
      </section>
      <section className="two-column">
        <div className="card">
          <header className="section-header">
            <h3>Upcoming events</h3>
            <p>Join sessions hosted by experts and sector partners.</p>
          </header>
          {events.length ? (
            <DataTable
              columns={[
                { title: 'Event', accessor: 'name' },
                { title: 'Sector', accessor: 'sector_name' },
                { title: 'Start', accessor: 'start_date' },
                { title: 'Location', accessor: 'location' }
              ]}
              data={events}
            />
          ) : (
            <EmptyState title="No upcoming events" description="Check back soon for new workshops." />
          )}
        </div>
        <div className="card">
          <header className="section-header">
            <h3>Forum highlights</h3>
            <p>Recent discussions you can participate in.</p>
          </header>
          {forums.length ? (
            <DataTable
              columns={[
                { title: 'Topic', accessor: 'title' },
                { title: 'Sector', accessor: 'sector' },
                { title: 'Host', accessor: 'created_by_name' },
                { title: 'Created', accessor: 'created_at' }
              ]}
              data={forums}
            />
          ) : (
            <EmptyState
              title="Quiet fields"
              description="Start a new discussion and invite peers."
              actions={<Button onClick={() => window.location.assign('/forums')}>Open forums</Button>}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default FarmerDashboard;
