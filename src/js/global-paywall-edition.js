/**
 * KidsFit Global Paid Edition Gatekeeper
 * 
 * Enforces Korean Free Diagnostic Studio default on truthofmarket.com.
 * Activates global paid paywall strictly when ?edition=global or ?paywall=1 is present.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KidsFitGlobalPaywall = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  function isGlobalPaidEdition() {
    if (typeof window === 'undefined') return false;
    var search = window.location.search || '';

    // If explicit Korean mode, do not activate paywall
    if (search.indexOf('edition=ko') !== -1) {
      return false;
    }

    // Explicit global edition activation via query string
    if (search.indexOf('edition=global') !== -1 || search.indexOf('paywall=1') !== -1) {
      return true;
    }

    // Default: false (Korean Free Growth & Learning Analysis Studio)
    return false;
  }

  // Set global flag
  if (typeof window !== 'undefined') {
    window.__KIDSFIT_GLOBAL_PAID_EDITION = isGlobalPaidEdition();
  }

  return {
    isGlobalPaidEdition: isGlobalPaidEdition
  };
}));
