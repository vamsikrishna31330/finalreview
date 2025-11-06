import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/tables/DataTable.jsx';
import Modal from '../../components/Modal.jsx';
import FormSection from '../../components/forms/FormSection.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { useDatabase } from '../../hooks/useDatabase.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useUI } from '../../hooks/useUI.js';
import './ForumsPage.css';

const initialForumForm = {
  title: '',
  sector: 'Technology',
  description: ''
};

const initialPostForm = {
  forum_id: null,
  body: ''
};

const ForumsPage = () => {
  const { user } = useAuth();
  const { run } = useDatabase();
  const { pushNotification } = useUI();
  const { data: forums } = useSqlQuery(
    'SELECT forums.*, users.name AS author_name, COUNT(forum_posts.id) AS replies FROM forums LEFT JOIN users ON users.id = forums.created_by LEFT JOIN forum_posts ON forum_posts.forum_id = forums.id GROUP BY forums.id ORDER BY created_at DESC'
  );
  const [forumModalOpen, setForumModalOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [selectedForum, setSelectedForum] = useState(null);
  const [forumForm, setForumForm] = useState(initialForumForm);
  const [postForm, setPostForm] = useState(initialPostForm);
  const { data: posts } = useSqlQuery(
    selectedForum
      ? 'SELECT forum_posts.*, users.name AS author_name FROM forum_posts JOIN users ON users.id = forum_posts.author_id WHERE forum_posts.forum_id = ? ORDER BY forum_posts.created_at DESC'
      : null,
    selectedForum ? [selectedForum.id] : []
  );

  const sectors = useMemo(
    () => ['Technology', 'Finance', 'Logistics', 'Marketplace', 'Soil', 'Climate'],
    []
  );

  const openCreateForum = () => {
    setForumForm(initialForumForm);
    setForumModalOpen(true);
  };

  const openCreatePost = (forum) => {
    setSelectedForum(forum);
    setPostForm({ forum_id: forum.id, body: '' });
    setPostModalOpen(true);
  };

  const handleCreateForum = (event) => {
    event.preventDefault();
    if (!forumForm.title.trim()) {
      return;
    }
    run('INSERT INTO forums (title, description, created_by, sector) VALUES (?, ?, ?, ?)', [
      forumForm.title,
      forumForm.description,
      user.id,
      forumForm.sector
    ]);
    pushNotification({ title: 'Forum created', message: forumForm.title, status: 'success' });
    setForumModalOpen(false);
  };

  const handleCreatePost = (event) => {
    event.preventDefault();
    if (!postForm.body.trim()) {
      return;
    }
    run('INSERT INTO forum_posts (forum_id, author_id, body) VALUES (?, ?, ?)', [postForm.forum_id, user.id, postForm.body]);
    pushNotification({ title: 'Reply added', message: 'Your response is live.', status: 'success' });
    setPostModalOpen(false);
  };

  return (
    <div className="forums-page">
      <PageHeader
        title="Community forums"
        subtitle="Collaborate with peers, seek expert help, and share farming knowledge."
        actions={<Button onClick={openCreateForum}>Start new forum</Button>}
      />
      <div className="forum-layout">
        <div className="card">
          {forums.length ? (
            <DataTable
              columns={[
                { title: 'Title', accessor: 'title' },
                { title: 'Sector', accessor: 'sector' },
                { title: 'Created by', accessor: 'author_name' },
                { title: 'Replies', accessor: 'replies' }
              ]}
              data={forums}
              onRowClick={setSelectedForum}
              actions={[
                {
                  label: 'Reply',
                  onClick: (forum) => openCreatePost(forum)
                }
              ]}
            />
          ) : (
            <EmptyState
              title="No forums yet"
              description="Be the first to start a discussion for your community."
              actions={<Button onClick={openCreateForum}>Start a forum</Button>}
            />
          )}
        </div>
        <div className="card posts-panel">
          {selectedForum ? (
            <>
              <header className="section-header">
                <div>
                  <h3>{selectedForum.title}</h3>
                  <p>{selectedForum.description || 'No description provided.'}</p>
                </div>
                <Button onClick={() => openCreatePost(selectedForum)}>Reply</Button>
              </header>
              <ul className="posts-list">
                {posts?.length ? (
                  posts.map((post) => (
                    <li key={post.id}>
                      <h4>{post.author_name}</h4>
                      <time>{new Date(post.created_at).toLocaleString()}</time>
                      <p>{post.body}</p>
                    </li>
                  ))
                ) : (
                  <EmptyState
                    title="No replies yet"
                    description="Start the conversation with your insights."
                    actions={<Button onClick={() => openCreatePost(selectedForum)}>Post first reply</Button>}
                  />
                )}
              </ul>
            </>
          ) : (
            <EmptyState
              title="Select a forum"
              description="Choose a forum from the list to view posts and contribute."
            />
          )}
        </div>
      </div>
      <Modal
        open={forumModalOpen}
        title="Create forum"
        description="Establish a new topic and invite participants."
        onClose={() => setForumModalOpen(false)}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setForumModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="forum-form">
              Launch forum
            </button>
          </div>
        }
      >
        <form id="forum-form" onSubmit={handleCreateForum} className="forum-form">
          <FormSection title="Forum details" description="Set context for participants.">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="forum-title">Title</label>
                <input
                  id="forum-title"
                  value={forumForm.title}
                  onChange={(event) => setForumForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="forum-sector">Sector</label>
                <select
                  id="forum-sector"
                  value={forumForm.sector}
                  onChange={(event) => setForumForm((prev) => ({ ...prev, sector: event.target.value }))}
                >
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="forum-description">Description</label>
              <textarea
                id="forum-description"
                rows={4}
                value={forumForm.description}
                onChange={(event) => setForumForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </FormSection>
        </form>
      </Modal>
      <Modal
        open={postModalOpen}
        title={selectedForum ? `Reply to ${selectedForum.title}` : 'Reply'}
        description="Share updates, ask questions, or provide solutions."
        onClose={() => setPostModalOpen(false)}
        footer={
          <div className="form-actions">
            <button type="button" className="secondary" onClick={() => setPostModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary" form="post-form">
              Share reply
            </button>
          </div>
        }
      >
        <form id="post-form" onSubmit={handleCreatePost} className="post-form">
          <FormSection title="Response" description="Compose your message.">
            <div className="field">
              <textarea
                rows={6}
                value={postForm.body}
                onChange={(event) => setPostForm((prev) => ({ ...prev, body: event.target.value }))}
                required
              />
            </div>
          </FormSection>
        </form>
      </Modal>
    </div>
  );
};

export default ForumsPage;
