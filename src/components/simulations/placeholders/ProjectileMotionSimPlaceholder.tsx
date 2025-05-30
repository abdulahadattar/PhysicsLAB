import React from 'react';

interface ProjectileMotionSimPlaceholderProps {
  simMetadata: {
    title: string;
    // Include other relevant simMetadata fields if needed
  };
}

const ProjectileMotionSimPlaceholder: React.FC<ProjectileMotionSimPlaceholderProps> = ({ simMetadata }) => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">{simMetadata.title}</h2>
      <p className="text-gray-600">
        Interactive {simMetadata.title} placeholder. Actual simulation will be loaded here.
      </p>
      {/* You can add a simple placeholder image or spinner here if desired */}
    </div>
  );
};

export default ProjectileMotionSimPlaceholder;