import { useMemo } from 'react';
import MetricCard from '../../components/dashboard/MetricCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { data: users } = useSqlQuery('SELECT * FROM users ORDER BY created_at DESC LIMIT 5');
  const { data: events } = useSqlQuery(
    'SELECT events.*, sectors.name AS sector_name FROM events LEFT JOIN sectors ON events.sector_id = sectors.id ORDER BY start_date ASC LIMIT 5'
  );
  const { data: notifications } = useSqlQuery(
    "SELECT notifications.*, users.name AS user_name FROM notifications LEFT JOIN users ON users.id = notifications.user_id ORDER BY created_at DESC LIMIT 6"
  );
  const { data: connections } = useSqlQuery(
    'SELECT sector_connections.*, users.name AS user_name, sectors.name AS sector_name FROM sector_connections JOIN users ON users.id = sector_connections.user_id JOIN sectors ON sectors.id = sector_connections.sector_id ORDER BY created_at DESC LIMIT 5'
  );

  const metrics = useMemo(
    () => ({
      totalUsers: users?.length ?? 0,
      totalEvents: events?.length ?? 0,
      totalNotifications: notifications?.length ?? 0,
      totalConnections: connections?.length ?? 0
    }),
    [users, events, notifications, connections]
  );

  return (
    <div className="admin-dashboard">
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <PageHeader
            title="Administrator Dashboard"
            subtitle="Manage the platform and monitor all activities across sectors"
          />
        </div>
      </div>
      <section className="grid four">
        <MetricCard title="Active users" value={metrics.totalUsers} subtitle="Last 5 sign-ups" />
        <MetricCard title="Upcoming events" value={metrics.totalEvents} subtitle="Next scheduled" accent="secondary" />
        <MetricCard title="Alerts sent" value={metrics.totalNotifications} subtitle="Recent notifications" accent="accent" />
        <MetricCard title="Connections" value={metrics.totalConnections} subtitle="Pending follow-ups" />
      </section>
      <section className="two-column">
        <div className="card">
          <header className="section-header">
            <h3>Recently added users</h3>
            <p>View the latest members across all roles.</p>
          </header>
          <DataTable
            columns={[
              { title: 'Name', accessor: 'name' },
              { title: 'Email', accessor: 'email' },
              { title: 'Role', accessor: 'role' },
              { title: 'Location', accessor: 'location' }
            ]}
            data={users}
          />
        </div>
        <div className="card">
          <header className="section-header">
            <h3>Upcoming events</h3>
            <p>Keep track of community awareness activities.</p>
          </header>
          <DataTable
            columns={[
              { title: 'Event', accessor: 'name' },
              { title: 'Sector', accessor: 'sector_name' },
              { title: 'Start date', accessor: 'start_date' },
              { title: 'Location', accessor: 'location' }
            ]}
            data={events}
          />
        </div>
      </section>
      <section className="two-column">
        <div className="card">
          <header className="section-header">
            <h3>Notifications log</h3>
            <p>Track platform communications and alerts.</p>
          </header>
          <DataTable
            columns={[
              { title: 'Recipient', accessor: 'user_name' },
              { title: 'Title', accessor: 'title' },
              { title: 'Level', accessor: 'level' },
              { title: 'Sent at', accessor: 'created_at' }
            ]}
            data={notifications}
          />
        </div>
        <div className="card">
          <header className="section-header">
            <h3>Sector collaborations</h3>
            <p>Monitor the status of farmer-sector engagements.</p>
          </header>
          <DataTable
            columns={[
              { title: 'Farmer', accessor: 'user_name' },
              { title: 'Sector', accessor: 'sector_name' },
              { title: 'Status', accessor: 'status' },
              { title: 'Notes', accessor: 'notes' }
            ]}
            data={connections}
          />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
