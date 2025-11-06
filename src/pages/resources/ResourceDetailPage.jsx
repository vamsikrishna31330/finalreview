import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSqlQuery } from '../../hooks/useSqlQuery.js';
import { base64ToBlobUrl } from '../../utils/fileHelpers.js';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import './ResourceDetailPage.css';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useSqlQuery(
    'SELECT resources.*, users.name AS author_name FROM resources LEFT JOIN users ON users.id = resources.created_by WHERE resources.id = ?',
    [Number(id) || 0]
  );
  const resource = data?.[0];

  const downloadUrl = useMemo(() => {
    if (!resource?.file_blob) {
      return null;
    }
    return base64ToBlobUrl(resource.file_blob);
  }, [resource]);

  if (loading) {
    return null;
  }

  if (!resource) {
    return (
      <EmptyState
        title="Resource not found"
        description="It may have been removed."
        actions={<Button onClick={() => navigate(-1)}>Go back</Button>}
      />
    );
  }

  return (
    <div className="resource-detail">
      <PageHeader
        title={resource.title}
        subtitle={`Provided by ${resource.author_name ?? 'Unknown'} · ${new Date(resource.created_at).toLocaleString()}`}
        actions={
          <Button onClick={() => navigate('/resources')} variant="ghost">
            Back to library
          </Button>
        }
      />
      <div className="card overview">
        <h3>Summary</h3>
        <p>{resource.description || 'No summary provided.'}</p>
        <dl>
          <div>
            <dt>Category</dt>
            <dd>{resource.category}</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>{resource.link ? <a href={resource.link}>Open link</a> : resource.file_name ? 'Downloadable file' : 'N/A'}</dd>
          </div>
        </dl>
        {resource.file_name && downloadUrl && (
          <Button
            onClick={() => {
              const anchor = document.createElement('a');
              anchor.href = downloadUrl;
              anchor.download = resource.file_name;
              document.body.appendChild(anchor);
              anchor.click();
              document.body.removeChild(anchor);
            }}
          >
            Download {resource.file_name}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResourceDetailPage;
