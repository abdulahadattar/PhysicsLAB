// src/app/(app)/simulations/[simId]/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic"; // Use next/dynamic for dynamic import
import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner"; // Assuming a loading spinner component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define a dynamic import mapping for placeholder components
// Keys should match the 'componentName' string from Firestore data + "Placeholder" suffix
const PlaceholderComponents: { [key: string]: React.ComponentType<any> } = {
  LogicGatesSimPlaceholder: dynamic(() => import("@/components/simulations/placeholders/LogicGatesSimPlaceholder"), { loading: () => <LoadingSpinner /> }),
  ProjectileMotionSimPlaceholder: dynamic(() => import("@/components/simulations/placeholders/ProjectileMotionSimPlaceholder"), { loading: () => <LoadingSpinner /> }),
  DensityLabSimPlaceholder: dynamic(() => import("@/components/simulations/placeholders/DensityLabSimPlaceholder"), { loading: () => <LoadingSpinner /> }),
  WaveInterferenceSimPlaceholder: dynamic(() => import("@/components/simulations/placeholders/WaveInterferenceSimPlaceholder"), { loading: () => <LoadingSpinner /> }),
  // Add more placeholder components here as needed, ensure the key matches componentName + "Placeholder"
};

// Define the type for simulation metadata
interface SimulationMeta {
  simId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  componentName: string; // Name used to identify the component to load (initially placeholders)
  // Add an optional field for actual interactive component name later:
  // interactiveComponentName?: string;
}

interface SimulationViewerPageProps {
  params: {
    simId: string;
  };
}

// Fetch simulation metadata from Firestore
async function getSimulationMetadata(simId: string): Promise<SimulationMeta | null> {
  try {
    const docRef = doc(db, "simulationsMeta", simId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as SimulationMeta; // Cast to our type
    } else {
      console.warn(`Simulation with ID ${simId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching simulation metadata for ${simId}:`, error);
    // In a real app, you might want more sophisticated error handling/logging
    return null;
  }
}

export default async function SimulationViewerPage({ params }: SimulationViewerPageProps) {
  const { simId } = params;

  // Fetch the simulation metadata on the server side
  const simulationMetadata = await getSimulationMetadata(simId);

  // If metadata is not found, show a 404 page
  if (!simulationMetadata) {
    notFound(); // Next.js built-in notFound function
  }

  const { title, description, componentName } = simulationMetadata;

  // --- Dynamic Component Loading Logic ---
  // This is where you'll later add logic to switch between placeholder and interactive.
  // For now, we only load from the placeholder map.

  // Construct the key to look up in our dynamic component map.
  // Assuming placeholder components are named like `${componentName}Placeholder`.
  const componentLookupKey = `${componentName}Placeholder`;

  // Get the dynamically imported placeholder component
  const SimulationComponent = PlaceholderComponents[componentLookupKey];

  // --- End Dynamic Component Loading Logic ---


  // If the componentName is specified but doesn't map to a known placeholder
  // Or if componentName was missing entirely (though type suggests it's required)
  if (!SimulationComponent) {
    // Log an error server-side
    console.error(`No component found for lookup key: ${componentLookupKey} (from componentName: ${componentName})`);
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Could not find a simulation component for "{title}". The configuration might be incorrect.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/*
        Instructions for Integrating Actual Interactive Simulations:

        1.  Create a new directory for your actual interactive simulation components, e.g., src/components/simulations/interactive/.
        2.  Develop your interactive simulation React component inside this directory (e.g., src/components/simulations/interactive/InteractiveLogicGatesSim.tsx). This component should contain the full simulation logic and UI.
        3.  Modify the `SimulationMeta` type above to include an optional field, e.g., `interactiveComponentName?: string;`.
        4.  Update the Firestore `simulationsMeta` document for a simulation when its interactive component is ready, adding the `interactiveComponentName` field (e.g., `interactiveComponentName: "InteractiveLogicGatesSim"`).
        5.  Modify the dynamic component loading logic *below* this comment block.
            *   Check if `simulationMetadata.interactiveComponentName` exists.
            *   If it exists, construct a lookup key for the interactive component (e.g., `simulationMetadata.interactiveComponentName`).
            *   Create a *separate* mapping for interactive components (`InteractiveComponents`).
            *   Attempt to load the component from `InteractiveComponents` first.
            *   If `interactiveComponentName` is NOT provided, or the lookup in `InteractiveComponents` fails, THEN fall back to the `PlaceholderComponents` mapping using the original `componentName`.
        6.  Ensure both placeholder and interactive components accept the necessary props (e.g., `title`, `metadata`).
        7.  Remember to handle dependencies and build processes for any complex simulation libraries you might use.
      */}

      {/* Render the dynamically loaded simulation component */}
      {/* The loading state is handled by next/dynamic\'s loading option now */}
      <SimulationComponent metadata={simulationMetadata} /> {/* Pass metadata as prop */}

    </div>
  );
}
// src/app/(app)/simulations/[simId]/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { notFound } from "next/navigation";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner"; // Assuming a loading spinner component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define a mapping from componentName string to the actual placeholder component
// This allows dynamic import based on the string name from Firestore
const placeholderComponents: { [key: string]: React.ComponentType<any> } = {
  LogicGatesPlaceholder: lazy(() => import("@/components/simulations/placeholders/LogicGatesPlaceholder")),
  ProjectileMotionPlaceholder: lazy(() => import("@/components/simulations/placeholders/ProjectileMotionPlaceholder")),
  WaveInterferencePlaceholder: lazy(() => import("@/components/simulations/placeholders/WaveInterferencePlaceholder")),
  // Add more placeholder components here as needed
};

interface SimulationViewerPageProps {
  params: {
    simId: string;
  };
}

// Fetch simulation metadata from Firestore
async function getSimulationMetadata(simId: string): Promise<DocumentData | null> {
  try {
    const docRef = doc(db, "simulationsMeta", simId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn(`Simulation with ID ${simId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching simulation metadata for ${simId}:`, error);
    return null;
  }
}

export default async function SimulationViewerPage({ params }: SimulationViewerPageProps) {
  const { simId } = params;

  // Fetch the simulation metadata on the server side
  const simulationMetadata = await getSimulationMetadata(simId);

  // If metadata is not found, show a 404 page
  if (!simulationMetadata) {
    notFound();
  }

  const { title, description, componentName } = simulationMetadata;

  // Find the corresponding placeholder component based on componentName
  const PlaceholderComponent = componentName ? placeholderComponents[componentName] : null;

  // If the componentName is specified but doesn't map to a known placeholder
  if (componentName && !PlaceholderComponent) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Could not find a component for simulation "{title}". The component name "{componentName}" is not recognized.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {PlaceholderComponent ? (
            // Dynamically render the placeholder component
            // Use Suspense to show a fallback while the component is loading
            <Suspense fallback={<LoadingSpinner />}>
              <PlaceholderComponent title={title} metadata={simulationMetadata} /> {/* Pass props if needed */}
            </Suspense>
          ) : (
             // Fallback if no componentName is provided in metadata (shouldn't happen if data is valid)
             <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Content Missing</AlertTitle>
                <AlertDescription>
                  No specific component is configured for this simulation.
                </AlertDescription>
             </Alert>
          )}
        </CardContent>
      </Card>

      {/*
        Instructions for Integrating Actual Interactive Simulations:

        1.  Create a new directory for your actual interactive simulation components, e.g., src/components/simulations/interactive/.
        2.  Develop your interactive simulation React component inside this directory (e.g., src/components/simulations/interactive/InteractiveLogicGates.tsx). This component should contain the full simulation logic and UI.
        3.  Decide how you want to manage switching between placeholder and interactive versions. Two common approaches:
            a)  **Update `componentName` in Firestore:** Change the `componentName` field in the `simulationsMeta` document for this simulation to point to the new interactive component (e.g., "InteractiveLogicGates").
            b)  **Introduce a new field (e.g., `actualComponentName`):** Add a new field in the `simulationsMeta` document (e.g., `actualComponentName: "InteractiveLogicGates"`). This allows you to keep the placeholder reference.
        4.  Modify the `placeholderComponents` mapping above.
            *   If using approach (a), update the mapping entry for the relevant `componentName` to use `lazy(() => import("@/components/simulations/interactive/InteractiveLogicGates"))`. You might rename the mapping variable to something like `simulationComponents`.
            *   If using approach (b), check for `actualComponentName` in the fetched `simulationMetadata` first. If it exists, use that name to dynamically import from a separate mapping for interactive components. Fallback to the placeholder mapping if `actualComponentName` is not present.
        5.  Ensure your actual interactive component handles any props passed to it (like `title` or the full `metadata`).
        6.  Remember to handle dependencies and build processes for any complex simulation libraries you might use.
      */}
    </div>
  );
}