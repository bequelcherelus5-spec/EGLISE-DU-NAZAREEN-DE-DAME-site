/**
 * Détection du sous-domaine officiel pour le Secrétariat
 * Prend en charge:
 * - secretariat.eglisedunazareendedame.org
 * - secretaria.eglisedunazareendedame.org
 * - Les sous-domaines commençant par 'secretariat.' ou 'secretaria.'
 * - Paramètre URL pour test ou environnement de prévisualisation: ?subdomain=secretariat
 */
export const isSecretariatSubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);

    return (
      hostname === 'secretariat.eglisedunazareendedame.org' ||
      hostname === 'secretaria.eglisedunazareendedame.org' ||
      hostname.startsWith('secretariat.') ||
      hostname.startsWith('secretaria.') ||
      searchParams.get('subdomain') === 'secretariat' ||
      searchParams.get('subdomain') === 'secretaria'
    );
  } catch {
    return false;
  }
};
