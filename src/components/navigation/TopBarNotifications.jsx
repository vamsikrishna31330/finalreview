import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const TopBarNotifications = ({ notifications }) => {
  const [open, setOpen] = useState(false);
  const unreadCount = useMemo(() => notifications.length, [notifications]);

  return (
    <div className="notifications" onMouseLeave={() => setOpen(false)}>
      <button type="button" className="bell" onClick={() => setOpen((value) => !value)}>
        🔔
        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
      </button>
      {open && (
        <div className="panel">
          <div className="panel-header">
            <h4>Notifications</h4>
            <Link to="/notifications" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          <ul>
            {notifications.length ? (
              notifications.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <p className="title">{item.title}</p>
                  <p className="message">{item.message}</p>
                </li>
              ))
            ) : (
              <li className="empty">No new alerts</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TopBarNotifications;
