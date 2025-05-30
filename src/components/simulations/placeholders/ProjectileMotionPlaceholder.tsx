import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const ProjectileMotionPlaceholder: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Projectile Motion Simulator</CardTitle>
        <CardDescription>Simulation Placeholder</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Interactive Projectile Motion Simulator coming soon.
        </p>
        <p>
          <strong>Features:</strong> Adjust launch angle, initial velocity, and observe trajectory.
        </p>
        {/* Optional: Add a simple placeholder image or icon */}
      </CardContent>
    </Card>
  );
};

export default ProjectileMotionPlaceholder;