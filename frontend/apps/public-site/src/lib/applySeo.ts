import type { PublicPage, PublicSite } from '../types/content';

function setMetaByName(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function removeMetaByName(name: string) {
  document.querySelector(`meta[name="${name}"]`)?.remove();
}

function setMetaByProperty(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let tag = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

/** Site-wide <head> tags - applied once per site load, not per page. */
export function applySiteHead(site: PublicSite) {
  if (site.faviconUrl) {
    setLink('icon', site.faviconUrl);
  }
  if (site.robotsIndexable) {
    removeMetaByName('robots');
  } else {
    setMetaByName('robots', 'noindex, nofollow');
  }
}

/** Per-page <head> tags - title, meta description, Open Graph, canonical URL. */
export function applyPageHead(page: PublicPage, schoolName: string) {
  document.title = page.title ? `${page.title} — ${schoolName}` : schoolName;

  if (page.metaDescription) {
    setMetaByName('description', page.metaDescription);
  } else {
    removeMetaByName('description');
  }

  setMetaByProperty('og:title', document.title);
  setMetaByProperty('og:type', 'website');
  setMetaByProperty('og:url', window.location.href);
  if (page.metaDescription) {
    setMetaByProperty('og:description', page.metaDescription);
  }
  if (page.ogImageUrl) {
    setMetaByProperty('og:image', page.ogImageUrl);
  }

  setLink('canonical', window.location.href);
}
