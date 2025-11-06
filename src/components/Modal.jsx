import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ open, title, description, children, onClose, footer }) => {
  if (!open) {
    return null;
  }
  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header>
          <div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="close">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
