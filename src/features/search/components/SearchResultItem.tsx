import React from 'react';
import { Button } from '@/components/ui/button';
import { FileTextIcon } from 'lucide-react';
import type { SearchResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SearchResultItemProps {
  result: SearchResult;
  isActive: boolean;
  onClick: () => void;
}

/**
 * A presentational component for a single item in the search results list.
 * It is accessibility-ready with role and aria attributes.
 */
export const SearchResultItem: React.FC<SearchResultItemProps> = React.memo(({ result, isActive, onClick }) => {
  const Icon = result.icon || FileTextIcon;

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto w-full justify-start rounded-sm px-3 py-2.5 text-left",
        isActive && "bg-accent"
      )}
      onClick={onClick}
      role="option"
      aria-selected={isActive}
      id={`search-result-${result.id}`}
    >
      <Icon className="mr-2.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{result.label}</p>
        {result.description && (
          <p className="truncate text-xs text-muted-foreground">
            {result.description}
          </p>
        )}
      </div>
    </Button>
  );
});

SearchResultItem.displayName = 'SearchResultItem';