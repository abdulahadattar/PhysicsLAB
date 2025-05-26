import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  icon?: string;
  color?: string;
  definition?: string;
  stbbRelevance?: string;
  page_no?: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onToggleExpand?: (nodeId: string) => void;
  onShowDetails?: (data: CustomNodeData) => void;
  width?: number;
  height?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomMindMapNode: React.FC<NodeProps<any>> = (props) => {
  // Type assertion to fix React Flow's NodeProps data typing
  const data = props.data as CustomNodeData;
  const { id, type } = props;
  const IconComponent = data.icon ? (LucideIcons as any)[data.icon] || LucideIcons.FileText : LucideIcons.FileText;

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onShowDetails?.(data);
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onToggleExpand?.(id as string);
  };

  return (
    <Card
      className={cn(
        "w-[200px] shadow-lg border-2 nodrag",
        data.color || 'bg-card border-border',
        type === 'rootSubjectNode' && 'w-[250px] !border-4',
        type === 'unitNode' && 'w-[220px] !border-2'
      )}
      style={{ width: data.width || 200, height: data.height || 'auto' }}
    >
      <Handle type="target" position={Position.Left} className="!bg-primary" isConnectable={false} />
      <CardHeader className={cn("p-2 flex flex-row items-center justify-between", data.color?.replace('border-', 'bg-').replace('text-', 'text-') || 'bg-muted/50')}>
        <div className="flex items-center space-x-2">
          <IconComponent className="h-4 w-4" />
          <CardTitle className="text-xs font-semibold truncate" title={data.label}>{data.label}</CardTitle>
        </div>
        {data.hasChildren && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleExpandClick}
            className="h-5 w-5 p-0"
            aria-label={data.isExpanded ? "Collapse" : "Expand"}
          >
            {data.isExpanded ? <LucideIcons.MinusCircle className="h-3 w-3" /> : <LucideIcons.PlusCircle className="h-3 w-3" />}
          </Button>
        )}
      </CardHeader>
      {(data.definition || data.stbbRelevance) && (
        <CardContent className="p-2 text-center">
          <Button variant="outline" size="sm" onClick={handleDetailsClick} className="w-full text-xs">
            <LucideIcons.Info className="mr-1 h-3 w-3" /> Details
          </Button>
        </CardContent>
      )}
      {data.hasChildren && <Handle type="source" position={Position.Right} className="!bg-primary" isConnectable={false} />}
    </Card>
  );
};
