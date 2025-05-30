import React from 'react';

interface SimulationMetadata {
  title: string;
  // Include other relevant metadata fields if needed
}

interface WaveInterferenceSimPlaceholderProps {
  simMetadata: SimulationMetadata;
}

const WaveInterferenceSimPlaceholder: React.FC<WaveInterferenceSimPlaceholderProps> = ({ simMetadata }) => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold mb-2">{simMetadata.title}</h2>
      <p className="text-gray-600">
        Interactive {simMetadata.title} placeholder. Actual simulation will be loaded here.
      </p>
    </div>
  );
};

export default WaveInterferenceSimPlaceholder;