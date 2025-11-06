import './EmptyState.css';

const EmptyState = ({ icon = '🌱', title, description, actions }) => {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
};

export default EmptyState;
