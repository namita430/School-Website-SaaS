import { createContext, useContext } from 'react';
import type { PublicSite } from '../types/content';

/** Gives SitePage (and any nested content) access to site-wide info without prop-drilling through the router. */
export const SiteContext = createContext<PublicSite | null>(null);

export function useSite(): PublicSite {
  const site = useContext(SiteContext);
  if (!site) {
    throw new Error('useSite() called outside SiteContext - the site must be loaded before rendering routes.');
  }
  return site;
}
