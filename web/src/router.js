/**
 * TrafficTest — Hash-Based SPA Router
 * Provides direct-linkable URLs for Google Play Console compliance.
 */

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.onRouteChange = null;
    window.addEventListener('hashchange', () => this.resolve());
  }

  /**
   * Register a route with its render function.
   * @param {string} path — hash path (e.g., 'home', 'privacy')
   * @param {Function} renderFn — returns HTML string
   */
  register(path, renderFn) {
    this.routes.set(path, renderFn);
    return this;
  }

  /**
   * Navigate to a hash path.
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Resolve the current hash to a route and render it.
   */
  resolve() {
    const hash = window.location.hash.slice(1) || 'home';
    const renderFn = this.routes.get(hash) || this.routes.get('home');

    if (renderFn) {
      this.currentRoute = hash;
      if (this.onRouteChange) {
        this.onRouteChange(hash, renderFn);
      }
    }
  }

  /**
   * Get the current route path.
   */
  getCurrentRoute() {
    return this.currentRoute || 'home';
  }
}
