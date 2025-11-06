import './MetricCard.css';

const MetricCard = ({ title, value, subtitle, accent = 'primary' }) => {
  return (
    <div className={`metric-card ${accent}`}>
      <p className="metric-title">{title}</p>
      <div className="metric-value">{value}</div>
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}
    </div>
  );
};

export default MetricCard;
