import React from 'react';

interface SimulationMeta {
  title: string;
  // Include other relevant metadata fields if needed by the placeholder
}

interface LogicGatesSimPlaceholderProps {
  simMetadata: SimulationMeta;
}

const LogicGatesSimPlaceholder: React.FC<LogicGatesSimPlaceholderProps> = ({ simMetadata }) => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">{simMetadata.title}</h2>
      <p className="text-gray-600">
        Interactive {simMetadata.title} placeholder. Actual simulation will be loaded here.
      </p>
    </div>
  );
};

export default LogicGatesSimPlaceholder;