// src/components/simulations/SimulationPlaceholder.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SimulationPlaceholderProps {
  title: string;
  description?: string;
  features?: string[];
  className?: string;
}

const SimulationPlaceholder: React.FC<SimulationPlaceholderProps> = ({
  title,
  description = "Simulation Placeholder",
  features,
  className,
}) => {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold text-center">
          Interactive {title} coming soon.
        </p>
        {features && features.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Anticipated Features:</p>
            <ul className="list-disc list-inside">
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        {!features && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">More details and interactive elements will be available soon.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimulationPlaceholder;