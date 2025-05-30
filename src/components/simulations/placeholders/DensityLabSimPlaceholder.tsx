import React from 'react';

interface DensityLabSimPlaceholderProps {
  simMetadata: {
    title: string;
    // Add other metadata fields if needed by the placeholder
    [key: string]: any;
  };
}

const DensityLabSimPlaceholder: React.FC<DensityLabSimPlaceholderProps> = ({ simMetadata }) => {
  return (
    <div className="p-4 text-center">
      <h2>{simMetadata.title}</h2>
      <p>Interactive {simMetadata.title} placeholder. Actual simulation will be loaded here.</p>
    </div>
  );
};

export default DensityLabSimPlaceholder;