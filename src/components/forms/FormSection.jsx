import './FormSection.css';

const FormSection = ({ title, description, children, aside }) => {
  return (
    <section className="form-section">
      <header>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {aside && <div className="aside">{aside}</div>}
      </header>
      <div className="body">{children}</div>
    </section>
  );
};

export default FormSection;
