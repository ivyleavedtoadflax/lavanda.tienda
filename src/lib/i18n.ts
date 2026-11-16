import type { Lang } from './site';

/**
 * Spanish lives at the root, English under /en/. Every page is one file in
 * src/pages/[...lang]/ that builds both (see `langPaths`).
 */
export const langPaths = () => [{ params: { lang: undefined } }, { params: { lang: 'en' } }];

export const langOf = (param: string | undefined): Lang => (param === 'en' ? 'en' : 'es');

/** Root-relative path of a page in a language, e.g. ('en', '/lavanda') -> '/en/lavanda'. */
export const pathFor = (lang: Lang, slug: string) => (lang === 'es' ? slug : `/en${slug === '/' ? '/' : slug}`);

export const nav = [
  { slug: '/', es: 'Inicio', en: 'Home' },
  { slug: '/lavanda', es: 'Lavanda', en: 'Lavender' },
  { slug: '/experiencias', es: 'Experiencias', en: 'Experiences' },
  { slug: '/contacto', es: 'Contacto', en: 'Contact' },
];
