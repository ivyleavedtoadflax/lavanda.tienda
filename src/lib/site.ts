/**
 * Everything about the farm that changes: contact details, products, prices.
 * Edit here, not in the pages.
 *
 * TODO before launch: every value marked TODO is a placeholder.
 */

/** Orders and bookings arrive here. TODO: the farm's real address. */
export const EMAIL = 'hola@lavanda.tienda';

/** WhatsApp number, international format, digits only. TODO: the real number. */
export const WHATSAPP = '34600000000';

export type Lang = 'es' | 'en';
type T = Record<Lang, string>;

export interface Product {
  name: T;
  description: T;
  /** e.g. { es: '100 g', en: '100 g' }. Leave empty to show "ask us". */
  size?: T;
  /** e.g. '8 €'. Leave empty to show "ask us". */
  price?: string;
}

// TODO: sizes and prices.
export const products: Product[] = [
  {
    name: { es: 'Flor de lavanda en bolsa', en: 'Lavender flowers in a bag' },
    description: {
      es: 'Flor seca de nuestra lavanda, cortada y embolsada en la finca.',
      en: 'Dried flowers from our own lavender, cut and bagged on the farm.',
    },
  },
];

export const experience = {
  // TODO: price per person, duration, group size, dates.
  price: undefined as string | undefined,
};

export function whatsapp(text: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function mailto(subject: string, body = ''): string {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
