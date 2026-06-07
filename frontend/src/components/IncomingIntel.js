import React from 'react';
import { AlertCircle } from 'lucide-react';
import '../styles/IncomingIntel.css';

function IncomingIntel({ notifications, onMarkRead }) {
  return (
    <div className="incoming-intel">
      <h2>
        <AlertCircle size={20} />
        GELEN BİLDİRİM AKIŞI
      </h2>
      <div className="intel-items">
        {notifications.map((notif) => (
          <div 
            key={notif._id} 
            className={`intel-item ${notif.isRead ? 'read' : 'unread'}`}
            onClick={() => {
              if (!notif.isRead && onMarkRead) {
                onMarkRead(notif._id);
              }
            }}
          >
            <div className="intel-header">
              <h4>{notif.driver}</h4>
              <span className="date">{notif.date}</span>
            </div>
            <p className="intel-message">{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncomingIntel;
