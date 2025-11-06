import { Fragment } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import CardList from '../../components/CardList.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import './PublicPortal.css';

const PublicPortal = () => {
  const { data: events } = useSqlQuery(
    'SELECT events.*, sectors.name AS sector_name FROM events LEFT JOIN sectors ON sectors.id = events.sector_id ORDER BY start_date ASC LIMIT 6'
  );
  const { data: resources } = useSqlQuery(
    "SELECT id, title, category, description, link FROM resources WHERE category IN ('Guides','Policy','Training') ORDER BY created_at DESC LIMIT 6"
  );
  const { data: forums } = useSqlQuery(
    'SELECT forums.*, users.name AS author_name FROM forums LEFT JOIN users ON users.id = forums.created_by ORDER BY created_at DESC LIMIT 4'
  );
  const { data: content } = useSqlQuery(
    "SELECT title, body, tags, published_at FROM content WHERE audience LIKE '%public%' OR audience LIKE '%farmer%' ORDER BY published_at DESC LIMIT 4"
  );

  return (
    <div className="public-portal">
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <PageHeader
            title="Discover farming initiatives"
            subtitle="Explore upcoming events, learn from experts, and engage with farmer communities."
          />
        </div>
      </div>
      <section className="hero">
        <div className="hero-card">
          <h2>Why farming matters</h2>
          <p>
            Agriculture sustains communities. Join campaigns that support sustainable practices, connect with sector experts, and access
            resources crafted for both farmers and the public.
          </p>
          <div className="actions">
            <Button onClick={() => window.location.assign('/forums')}>Join a discussion</Button>
            <Button variant="ghost" onClick={() => window.location.assign('/events')}>
              Upcoming events
            </Button>
          </div>
        </div>
        <div className="stats-card">
          <h3>Impact snapshot</h3>
          <ul>
            <li>
              <span className="label">Community events held</span>
              <strong>{events.length}</strong>
            </li>
            <li>
              <span className="label">Educational resources</span>
              <strong>{resources.length}</strong>
            </li>
            <li>
              <span className="label">Open discussion forums</span>
              <strong>{forums.length}</strong>
            </li>
          </ul>
        </div>
      </section>
      <section className="content-section">
        <header>
          <h3>Featured learning guides</h3>
          <Button variant="ghost" onClick={() => window.location.assign('/resources')}>
            View all resources
          </Button>
        </header>
        {resources.length ? (
          <CardList
            items={resources}
            renderItem={(item) => (
              <article key={item.id} className="resource-card">
                <h4>{item.title}</h4>
                <p>{item.description || 'No description provided.'}</p>
                <div className="meta">
                  <span>{item.category}</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => (item.link ? window.open(item.link, '_blank') : window.location.assign(`/resources/${item.id}`))}
                >
                  Access
                </Button>
              </article>
            )}
          />
        ) : (
          <EmptyState title="No resources" description="Check back later for new materials." />
        )}
      </section>
      <section className="content-section">
        <header>
          <h3>Community forums</h3>
          <Button variant="ghost" onClick={() => window.location.assign('/forums')}>
            Explore forums
          </Button>
        </header>
        {forums.length ? (
          <CardList
            items={forums}
            renderItem={(item) => (
              <article key={item.id} className="forum-card">
                <h4>{item.title}</h4>
                <p>{item.description || 'No description provided.'}</p>
                <div className="meta">
                  <span>Sector: {item.sector || 'General'}</span>
                  <span>Hosted by {item.author_name}</span>
                </div>
              </article>
            )}
          />
        ) : (
          <EmptyState title="No forum discussions" description="Start a conversation to involve farmers and the public." />
        )}
      </section>
      <section className="content-section">
        <header>
          <h3>Insights from experts</h3>
        </header>
        {content.length ? (
          <CardList
            items={content}
            renderItem={(item, index) => (
              <article key={`${item.title}-${index}`} className="article-card">
                <h4>{item.title}</h4>
                <p>{item.body.slice(0, 160)}...</p>
                <div className="meta">
                  <span>{new Date(item.published_at).toLocaleDateString()}</span>
                  <span>{item.tags?.split(',').join(' · ')}</span>
                </div>
              </article>
            )}
          />
        ) : (
          <EmptyState title="No articles yet" description="Experts will publish guidance soon." />
        )}
      </section>
      <section className="content-section">
        <header>
          <h3>Event calendar</h3>
          <Button variant="ghost" onClick={() => window.location.assign('/events')}>
            Full calendar
          </Button>
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
          <EmptyState title="No events scheduled" description="Community events will appear here." />
        )}
      </section>
    </div>
  );
};

export default PublicPortal;
