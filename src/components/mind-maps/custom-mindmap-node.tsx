// src/components/mind-maps/custom-mindmap-node.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react'; // Removed ConnectionLineType as it's not used here
import { Card, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardContent as it's not used here
import { cn } from '@/lib/utils';

// Define the structure of data your custom node expects
export interface CustomNodeData {
  label: string;
  nodeType?: 'root' | 'chapter' | 'subtopic' | 'keyConcept'; // Added 'root'
  // You can add more data fields here if needed, e.g., description, icon
}

const CustomMindMapNode: React.FC<NodeProps<CustomNodeData>> = ({
  data,
  isConnectable,
  selected,
  // targetPosition = Position.Top, // Default if not specified
  // sourcePosition = Position.Bottom, // Default if not specified
}) => {
  const isRootOrChapter = data.nodeType === 'root' || data.nodeType === 'chapter';

  return (
    <Card
      className={cn(
        "shadow-lg border-2 transition-all duration-150 ease-in-out w-auto max-w-xs", // Control width here
        isRootOrChapter ? "bg-primary/10 border-primary text-primary-foreground min-w-[180px]" : "bg-card border-border min-w-[150px]",
        selected ? (isRootOrChapter ? "ring-4 ring-primary ring-offset-2" : "ring-2 ring-accent ring-offset-2") : "",
        "hover:shadow-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" // Added focus for accessibility
      )}
      tabIndex={0} // Make card focusable
    >
      <CardHeader className={cn("p-0", isRootOrChapter ? "py-3 px-4" : "py-2 px-3")}>
        <CardTitle className={cn("text-center break-words", isRootOrChapter ? "text-base md:text-lg" : "text-sm md:text-base font-medium")}>
          {data.label}
        </CardTitle>
      </CardHeader>
      {/* Example of adding more content if needed
      {data.description && (
        <CardContent className="p-2 text-xs text-muted-foreground">
          <p>{data.description}</p>
        </CardContent>
      )}
      */}

      {/* Handles for connecting edges. You can customize their positions and styles. */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-slate-400 w-2.5 h-2.5 !border-0 rounded-full hover:!bg-slate-600 transition-colors"
        id="top-target"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-slate-400 w-2.5 h-2.5 !border-0 rounded-full hover:!bg-slate-600 transition-colors"
        id="bottom-source"
      />
       {/* Optional: Add left/right handles for more complex layouts */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!bg-slate-400 w-2.5 h-2.5 !border-0 rounded-full hover:!bg-slate-600 transition-colors"
        id="left-target"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!bg-slate-400 w-2.5 h-2.5 !border-0 rounded-full hover:!bg-slate-600 transition-colors"
        id="right-source"
      />
    </Card>
  );
};

export default memo(CustomMindMapNode);
