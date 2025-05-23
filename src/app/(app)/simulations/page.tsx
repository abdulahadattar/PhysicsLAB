
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SIMULATION_TOPICS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Search, Orbit, Ruler, Weight, LineChart, Move, Atom, Waves, Projector, Zap, Network, Binary, RefreshCw, Anchor, BatteryCharging, MoveVertical, Sigma, Replace, Timer, Thermometer, Magnet, GitCommitHorizontal, Sun, Pipette, Archive } from "lucide-react"; // Added Archive
import Image from "next/image";

export default function SimulationsPage() {
  // Placeholder for search functionality
  // const [searchTerm, setSearchTerm] = useState("");
  // const filteredSimulations = SIMULATION_TOPICS.filter(topic =>
  //   topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="space-y-8">
      <Card className="animate-in fade-in-0 slide-in-from-top-5 duration-500 ease-out">
        <CardHeader>
          <CardTitle className="text-3xl">Interactive Physics Simulations</CardTitle>
          <CardDescription>Explore various physics concepts through hands-on simulations. Adjust parameters and observe the outcomes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search simulations by topic or keyword..."
              className="pl-10"
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SIMULATION_TOPICS.map((topic, index) => {
          const IconComponent = topic.icon || Orbit; 
          const isPlaceholderImage = !topic.image || topic.image.startsWith("https://placehold.co");
          return (
            <Card 
              key={topic.id} 
              className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-in fade-in-0 slide-in-from-bottom-5 duration-500 ease-out"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-40 bg-secondary/30 flex items-center justify-center" data-ai-hint={topic.aiHint || "physics diagram"}>
                {isPlaceholderImage ? (
                  <IconComponent className="h-16 w-16 text-primary/70" strokeWidth={1.5}/>
                ) : (
                  <Image src={topic.image!} alt={topic.name} layout="fill" objectFit="cover" />
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <IconComponent className="h-5 w-5 text-primary"/>
                   {topic.name}
                </CardTitle>
                <CardDescription>Grade {topic.grade}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
              </CardContent>
              <CardContent>
                <Link href={`/simulations/${topic.id}`} passHref>
                  <Button className="w-full">Launch Simulation</Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
