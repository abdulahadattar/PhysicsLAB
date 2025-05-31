import React from 'react';
import { TimelineEvent } from './timeline-types'; // Import TimelineEvent

interface EventDetailModalProps {
  event: TimelineEvent | null;
  onClose: () => void;
  isOpen: boolean; // Assuming isOpen is also needed to control visibility
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, isOpen }) => {
  if (!isOpen || !event) {
    return null; // Don't render if not open or no event
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <h2 style={{ marginTop: 0 }}>{event.title || 'Event Details'}</h2>
        <p>{event.description || event.shortDescription || 'No description available.'}</p>
        {/* Add more event details here as needed */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.2em',
            cursor: 'pointer'
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export { EventDetailModal };