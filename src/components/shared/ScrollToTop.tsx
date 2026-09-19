import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Restores the window scroll position to the top whenever a new route is
 * pushed. The page scroll owner is the browser window (no layout-level scroll
 * container), and dashboard layouts stay mounted across child-route changes,
 * so without this the viewport keeps the previous page's scrollY.
 *
 * PUSH/REPLACE navigations (sidebar/header navigation, redirects) reset the
 * scroll position. POP navigations (browser back/forward) are left untouched
 * so the browser's native scroll restoration keeps working.
 */
export function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search, navigationType]);

  return null;
}