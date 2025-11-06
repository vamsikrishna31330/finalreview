import './Button.css';

const Button = ({ variant = 'primary', children, ...props }) => {
  return (
    <button type="button" className={`btn ${variant}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
