import { useState, useEffect } from 'react';

/**
 * A custom hook to manage hash-based routing.
 * It listens for hash changes and provides the current route path.
 *
 * @returns {string} The current route (e.g., 'videogiochi' or '/').
 */
export const useHashNavigation = () => {
  const getPathFromHash = (hash: string): string => {
    // Ensure the hash starts with #/ to be considered a valid route
    if (hash.startsWith('#/')) {
      // Return the part after #/, or '/' if it's empty (for the root route '#/')
      return hash.substring(2) || '/';
    }
    // Default to the root route for any other hash or no hash
    return '/';
  };

  // Initialize state with the path from the current hash
  const [route, setRoute] = useState(getPathFromHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      // Update the route state when the hash changes
      setRoute(getPathFromHash(window.location.hash));
      // Scroll to the top of the page on navigation
      window.scrollTo(0, 0);
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return route;
};
