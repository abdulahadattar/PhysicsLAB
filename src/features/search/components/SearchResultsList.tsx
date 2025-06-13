import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import type { SearchResult } from '@/lib/types';
import { SearchResultItem } from './SearchResultItem';

interface SearchResultsListProps {
  isLoading: boolean;
  results: SearchResult[];
  searchTerm: string;
  activeIndex: number;
  onResultClick: (href: string) => void;
}

/**
 * Renders the list of search results, or a loading/empty state.
 */
export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  isLoading,
  results,
  searchTerm,
  activeIndex,
  onResultClick,
}) => {
  if (isLoading && results.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Searching modules...
      </div>
    );
  }

  if (results.length === 0 && searchTerm.trim()) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No results found for "{searchTerm}".
      </div>
    );
  }

  if (results.length === 0) {
    return null; // Don't render anything if there's no search term or results
  }

  return (
    <ScrollArea className="h-full max-h-[calc(60vh-2rem)]">
      <div id="search-results-list" role="listbox" className="flex flex-col gap-0.5">
        {results.map((result, index) => (
          <SearchResultItem
            key={result.id}
            result={result}
            isActive={index === activeIndex}
            onClick={() => onResultClick(result.href)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};