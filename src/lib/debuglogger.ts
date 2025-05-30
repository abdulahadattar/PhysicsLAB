import { usePathname } from 'next/navigation';
import { useUserSession } from '@/contexts/user-session-context'; // Assuming this hook provides user info

interface DebugLogContext {
  [key: string]: any;
}

/**
 * Logs a debug message to the backend for analysis.
 * Includes context like current page and user role if available.
 * @param message - The primary debug message.
 * @param context - Optional additional data or context.
 */
export const debugLogger = (message: string, context?: DebugLogContext) => {
  // We use hooks here, so this function should be called within a React component or hook.
  // If you need to log outside of React (e.g., in a utility function not using hooks),
  // you'll need a different approach (e.g., passing context explicitly or using a global logger instance).
  try {
    const pathname = usePathname();
    const { userRole, currentUser } = useUserSession(); // Get user info from your session hook

    const logData = {
      message: message,
      context: {
        pathname,
        userRole: userRole || 'guest',
        userId: currentUser?.uid || 'anonymous', // Include user ID if available
        ...context, // Merge provided context
      },
    };

    // Send the log data to your API endpoint
    fetch('/api/log-debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    }).catch(error => {
      console.error('Failed to send debug log to API:', error);
    });

  } catch (error) {
    console.error('Error preparing or sending debug log:', error);
  }
};

// Note: This hook-based logger is suitable for use within components.
// For logging outside of React components, you might need to adapt this
// (e.g., by creating a context provider for the logger or passing data explicitly).
