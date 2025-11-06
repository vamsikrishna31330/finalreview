import { useMemo, useState } from 'react';
import MetricCard from '../../components/dashboard/MetricCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import CardList from '../../components/CardList.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // If no user data, show a message
  if (!user) {
    return (
      <div className="user-dashboard">
        <div className="no-user-state">
          <div className="no-user-icon">👤</div>
          <h2>No User Data Available</h2>
          <p>Please log in to view your personalized dashboard.</p>
          <Button onClick={() => window.location.assign('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  
  const { data: userEvents } = useSqlQuery(
    'SELECT events.*, sectors.name AS sector_name FROM events LEFT JOIN sectors ON sectors.id = events.sector_id ORDER BY start_date ASC LIMIT 6'
  );
  
  const { data: userResources } = useSqlQuery(
    "SELECT resources.*, users.name AS owner FROM resources LEFT JOIN users ON users.id = resources.created_by ORDER BY created_at DESC LIMIT 4"
  );
  
  const { data: userForums } = useSqlQuery(
    'SELECT forums.*, users.name AS created_by_name FROM forums LEFT JOIN users ON users.id = forums.created_by ORDER BY created_at DESC LIMIT 4'
  );
  
  const { data: userConnections } = useSqlQuery(
    'SELECT sector_connections.*, sectors.name AS sector_name FROM sector_connections JOIN sectors ON sectors.id = sector_connections.sector_id WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
    [user?.id]
  );

  const { data: userNotifications } = useSqlQuery(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
    [user?.id]
  );

  const metrics = useMemo(
    () => ({
      totalEvents: userEvents?.length ?? 0,
      totalResources: userResources?.length ?? 0,
      activeForums: userForums?.length ?? 0,
      activeConnections: userConnections?.filter(item => item.status !== 'pending')?.length ?? 0,
      unreadNotifications: userNotifications?.filter(n => !n.read_at)?.length ?? 0
    }),
    [userEvents, userResources, userForums, userConnections, userNotifications]
  );

  const getRoleInfo = () => {
    const roleConfig = {
      admin: {
        icon: '👑',
        color: '#8b5cf6',
        label: 'Administrator',
        description: 'Platform management and oversight'
      },
      farmer: {
        icon: '🌾',
        color: '#10b981',
        label: 'Farmer',
        description: 'Agricultural resources and connections'
      },
      expert: {
        icon: '🎓',
        color: '#f59e0b',
        label: 'Agricultural Expert',
        description: 'Knowledge sharing and guidance'
      },
      public: {
        icon: '🌍',
        color: '#3b82f6',
        label: 'Public User',
        description: 'Community participation'
      }
    };
    return roleConfig[user.role] || roleConfig.public;
  };

  const roleInfo = getRoleInfo();

  const renderOverviewTab = () => (
    <>
      <section className="metrics-grid">
        <MetricCard title="Upcoming Events" value={metrics.totalEvents} subtitle="Next engagements" icon="📅" />
        <MetricCard title="Available Resources" value={metrics.totalResources} subtitle="Learning materials" icon="📚" accent="secondary" />
        <MetricCard title="Active Discussions" value={metrics.activeForums} subtitle="Community forums" icon="💬" accent="accent" />
        <MetricCard title="Your Connections" value={metrics.activeConnections} subtitle="Partnerships" icon="🤝" />
        <MetricCard title="Notifications" value={metrics.unreadNotifications} subtitle="Unread messages" icon="🔔" accent="warning" />
      </section>

      <div className="content-grid">
        <div className="content-section">
          <div className="section-card">
            <h3>Recent Events</h3>
            <p>Upcoming activities across all sectors</p>
            {userEvents?.length > 0 ? (
              <div className="event-list">
                {userEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="event-item">
                    <div className="event-date">
                      <span className="day">{new Date(event.start_date).getDate()}</span>
                      <span className="month">{new Date(event.start_date).toLocaleDateString('en', { month: 'short' })}</span>
                    </div>
                    <div className="event-info">
                      <h4>{event.name}</h4>
                      <p>{event.sector_name || 'General'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No upcoming events" />
            )}
          </div>
        </div>

        <div className="content-section">
          <div className="section-card">
            <h3>Recent Resources</h3>
            <p>Latest learning materials and guides</p>
            {userResources?.length > 0 ? (
              <div className="resource-list">
                {userResources.slice(0, 3).map((resource) => (
                  <div key={resource.id} className="resource-item">
                    <div className="resource-icon">📄</div>
                    <div className="resource-info">
                      <h4>{resource.title}</h4>
                      <p>{resource.category}</p>
                      <span className="resource-author">by {resource.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No resources available" />
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderProfileTab = () => (
    <div className="profile-content">
      <div className="profile-main">
        <div className="profile-avatar-large">
          <span>{user.name?.[0]?.toUpperCase()}</span>
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <div className="profile-role" style={{ color: roleInfo.color }}>
            <span className="role-icon">{roleInfo.icon}</span>
            <span>{roleInfo.label}</span>
          </div>
          <p className="profile-description">{roleInfo.description}</p>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="detail-card">
          <h3>Contact Information</h3>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{user.email}</span>
            </div>
            {user.location && (
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{user.location}</span>
              </div>
            )}
            {user.organization && (
              <div className="detail-item">
                <span className="detail-label">Organization</span>
                <span className="detail-value">{user.organization}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-card">
          <h3>Account Information</h3>
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value">#{user.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">{new Date(user.created_at).toLocaleDateString('en', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Status</span>
              <span className="detail-value status-active">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="activity-content">
      <div className="activity-grid">
        <div className="activity-section">
          <div className="section-card">
            <h3>Community Discussions</h3>
            <p>Recent conversations in forums</p>
            {userForums?.length > 0 ? (
              <div className="forum-list">
                {userForums.map((forum) => (
                  <div key={forum.id} className="forum-item">
                    <div className="forum-icon">💬</div>
                    <div className="forum-info">
                      <h4>{forum.title}</h4>
                      <p>{forum.description}</p>
                      <div className="forum-meta">
                        <span>Created by {forum.created_by_name}</span>
                        <Button variant="ghost" size="small" onClick={() => window.location.assign(`/forums/${forum.id}`)}>
                          Join Discussion
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No active discussions" />
            )}
          </div>
        </div>

        {userConnections?.length > 0 && (
          <div className="activity-section">
            <div className="section-card">
              <h3>Sector Connections</h3>
              <p>Your partnerships and collaborations</p>
              <DataTable
                columns={[
                  { title: 'Sector', accessor: 'sector_name' },
                  { title: 'Status', accessor: 'status' },
                  { title: 'Connected', accessor: 'created_at' }
                ]}
                data={userConnections}
                emptyMessage="No connections found"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="user-dashboard">
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <PageHeader
            title={`${user.name}'s Dashboard`}
            subtitle="Manage your profile and track your farming activities"
          />
        </div>
      </div>
      
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="profile-summary">
            <div className="profile-avatar">
              <span>{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="profile-summary-info">
              <h3>{user.name}</h3>
              <div className="role-badge" style={{ backgroundColor: roleInfo.color }}>
                {roleInfo.icon} {roleInfo.label}
              </div>
            </div>
          </div>

          <nav className="dashboard-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              Profile Details
            </button>
            <button
              className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="nav-icon">🔄</span>
              Recent Activity
            </button>
          </nav>

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
              <Button variant="ghost" size="small" onClick={() => window.location.assign('/resources')}>
                Browse Resources
              </Button>
              <Button variant="ghost" size="small" onClick={() => window.location.assign('/forums')}>
                Join Forums
              </Button>
              <Button variant="ghost" size="small" onClick={() => window.location.assign('/events')}>
                View Events
              </Button>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'activity' && renderActivityTab()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
