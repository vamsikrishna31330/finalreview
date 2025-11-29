import { useMemo } from 'react';
import MetricCard from '../../components/dashboard/MetricCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import './ExpertDashboard.css';

const ExpertDashboard = () => {
  const { data: content } = useSqlQuery(
    'SELECT content.*, users.name AS author_name FROM content LEFT JOIN users ON users.id = content.author_id ORDER BY published_at DESC LIMIT 5'
  );
  const { data: forums } = useSqlQuery(
    'SELECT forums.*, COUNT(forum_posts.id) AS replies FROM forums LEFT JOIN forum_posts ON forum_posts.forum_id = forums.id GROUP BY forums.id, forums.created_at ORDER BY forums.created_at DESC LIMIT 5'
  );
  const { data: farmerQueries } = useSqlQuery(
    "SELECT forum_posts.*, forums.title AS forum_title, users.name AS author_name FROM forum_posts JOIN forums ON forums.id = forum_posts.forum_id JOIN users ON users.id = forum_posts.author_id WHERE forums.sector = 'Technology' ORDER BY created_at DESC LIMIT 6"
  );
  const { data: resources } = useSqlQuery(
    'SELECT resources.*, users.name AS owner FROM resources LEFT JOIN users ON users.id = resources.created_by ORDER BY created_at DESC LIMIT 5'
  );

  const metrics = useMemo(
    () => ({
      totalContent: content?.length ?? 0,
      activeForums: forums?.length ?? 0,
      recentQueries: farmerQueries?.length ?? 0,
      sharedResources: resources?.length ?? 0
    }),
    [content, forums, farmerQueries, resources]
  );

  return (
    <div className="expert-dashboard">
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <PageHeader
            title="Expert Dashboard"
            subtitle="Share knowledge and help farmers with expert guidance"
          />
        </div>
      </div>
      <PageHeader
        title="Expert Control Center"
        subtitle="Curate educational material, answer farmer queries, and manage active discussions."
        actions={<Button onClick={() => window.location.assign('/resources?create=content')}>Create guide</Button>}
      />
      <section className="grid four">
        <MetricCard title="Published guides" value={metrics.totalContent} subtitle="Last 5 updates" />
        <MetricCard title="Active forums" value={metrics.activeForums} subtitle="Top discussions" accent="secondary" />
        <MetricCard title="Queries answered" value={metrics.recentQueries} subtitle="Latest replies" accent="accent" />
        <MetricCard title="Shared resources" value={metrics.sharedResources} subtitle="Recent uploads" />
      </section>
      <section className="two-column">
        <div className="card">
          <header className="section-header">
            <h3>Latest knowledge base entries</h3>
            <p>Keep farmers informed with timely updates.</p>
          </header>
          {content.length ? (
            <DataTable
              columns={[
                { title: 'Title', accessor: 'title' },
                { title: 'Audience', accessor: 'audience' },
                { title: 'Published', accessor: 'published_at' },
                { title: 'Author', accessor: 'author_name' }
              ]}
              data={content}
            />
          ) : (
            <EmptyState title="No content" description="Publish your first guide to help farmers." />
          )}
        </div>
        <div className="card">
          <header className="section-header">
            <h3>Discussion forums</h3>
            <p>Identify conversations that need expert attention.</p>
          </header>
          {forums.length ? (
            <DataTable
              columns={[
                { title: 'Forum', accessor: 'title' },
                { title: 'Sector', accessor: 'sector' },
                { title: 'Threads', accessor: 'replies' },
                { title: 'Created', accessor: 'created_at' }
              ]}
              data={forums}
            />
          ) : (
            <EmptyState
              title="No forum topics"
              description="Launch a new topic to engage the community."
              actions={<Button onClick={() => window.location.assign('/forums')}>Create forum</Button>}
            />
          )}
        </div>
      </section>
      <section className="two-column">
        <div className="card">
          <header className="section-header">
            <h3>Farmer support queries</h3>
            <p>Recent questions posted across technology forums.</p>
          </header>
          {farmerQueries.length ? (
            <DataTable
              columns={[
                { title: 'Forum', accessor: 'forum_title' },
                { title: 'Author', accessor: 'author_name' },
                { title: 'Posted', accessor: 'created_at' },
                { title: 'Message', accessor: 'body' }
              ]}
              data={farmerQueries}
            />
          ) : (
            <EmptyState title="No queries" description="All discussions are up to date." />
          )}
        </div>
        <div className="card">
          <header className="section-header">
            <h3>Resources shared with farmers</h3>
            <p>Review materials shared across different sectors.</p>
          </header>
          {resources.length ? (
            <DataTable
              columns={[
                { title: 'Resource', accessor: 'title' },
                { title: 'Category', accessor: 'category' },
                { title: 'Owner', accessor: 'owner' },
                { title: 'Created', accessor: 'created_at' }
              ]}
              data={resources}
            />
          ) : (
            <EmptyState
              title="No resources"
              description="Upload guides to empower farmers."
              actions={<Button onClick={() => window.location.assign('/resources')}>Upload resource</Button>}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default ExpertDashboard;
