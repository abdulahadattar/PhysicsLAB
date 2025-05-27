// src/lib/getIcon.ts
import * as LucideIcons from 'lucide-react';

/**
 * Returns a Lucide icon component by name string. Falls back to Zap if not found.
 * @param iconName The name of the Lucide icon (e.g. 'Zap', 'Anchor', 'Orbit').
 */
export function getIcon(iconName?: string): React.ElementType {
  if (!iconName) return LucideIcons.Zap;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Zap;
}
