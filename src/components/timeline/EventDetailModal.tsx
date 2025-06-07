// /home/user/PhysicsLAB/src/components/timeline/EventDetailModal.tsx
import React from 'react';
import { TimelineEvent } from './timeline-types';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Badge } from '@/components/ui/badge'; // Assuming you have a Badge component
import { X } from 'lucide-react'; // For a nicer close icon

interface EventDetailModalProps {
  event: TimelineEvent | null;
  onClose: () => void;
  isOpen: boolean;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, isOpen }) => {
  if (!isOpen || !event) {
    return null;
  }

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isOpen]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-4"
      onClick={onClose} // Close modal if backdrop is clicked
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to backdrop
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close event details"
        >
          <X size={20} />
        </Button>

        <h2 className="text-2xl font-semibold mb-3 pr-10">{event.title || 'Event Details'}</h2>
        
        <p className="text-gray-700 mb-2 text-sm">
          <strong>Date:</strong> {event.year || (event.startYear && event.endYear ? `${event.startYear} - ${event.endYear}` : event.startYear || 'N/A')}
        </p>
        
        {event.significanceRating !== undefined && event.significanceRating !== null && (
           <p className="text-gray-700 mb-2 text-sm">
            <strong>Significance:</strong> {event.significanceRating}/5
          </p>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {event.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}

        {event.relatedConcepts && event.relatedConcepts.length > 0 && (
           <p className="text-gray-700 mb-4 text-sm">
             <strong>Related Concepts:</strong> {event.relatedConcepts.join(', ')}
           </p>
        )}

        {/* Display External Links */}
        {event.externalLinks && event.externalLinks.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium border-b pb-1 mb-2">External Resources:</h3>
            {event.externalLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm block"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
          {event.detailedDescription || event.shortDescription || 'No detailed description available.'}
        </p>

        {/* Placeholder Section for Key Takeaways / Impact */}
        <div className="mb-4 p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-500 text-yellow-800">
            <h3 className="font-medium text-yellow-800">Key Takeaways / Impact (Placeholder)</h3>
            <p className="text-sm italic">This section will contain a summary of the event's importance or consequences.</p>
        </div>

        {/* Placeholder Section for AI-Powered Connections */}
        <div className="mb-4 p-3 bg-purple-50 rounded-md border-l-4 border-purple-500 text-purple-800">
            <h3 className="font-medium text-purple-800">AI-Powered Connections (Placeholder)</h3>
            <p className="text-sm italic">Related events, figures, and concepts suggested by AI will appear here.</p>
        </div>

        {/* Placeholder Section for AI-Powered Connections */}
        <div className="mb-4 p-3 bg-purple-50 rounded-md border-l-4 border-purple-500 text-purple-800">
            <h3 className="font-medium text-purple-800">AI-Powered Connections (Placeholder)</h3>
            <p className="text-sm italic">Related events, figures, and concepts suggested by AI will appear here.</p>
        </div>

        {/* Removed old 'details' section as information is moved to main event */}
        {event.scientist && (
          <div className="mb-3 p-3 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-700">Key Figure: {event.scientist.name}</h3>
            <p className="text-sm text-blue-600">
              ({event.scientist.birthYear} - {event.scientist.deathYear || 'Present'})
            </p>
          </div>
        )}

        {/* Display Images */}
        {event.imageUrls && event.imageUrls.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium border-b pb-1 mb-2">Images:</h3>
            {event.imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Event image ${index + 1}`} className="mt-2 rounded max-h-60 object-contain mx-auto"/>
            ))}
          </div>
        )}

        {/* Display Media (Video/Audio) */}
        {event.mediaUrls && event.mediaUrls.length > 0 && (
          <div className="space-y-3 mt-4">
            <h3 className="text-lg font-medium border-b pb-1 mb-2">Media:</h3>
            {event.mediaUrls.map((media, index) => (
              <div key={index} className="w-full">
                {media.type === 'video' && (
                  <video src={media.url} controls className="w-full rounded"></video>
                )}
                {media.type === 'audio' && (
                  <audio src={media.url} controls className="w-full"></audio>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { EventDetailModal };