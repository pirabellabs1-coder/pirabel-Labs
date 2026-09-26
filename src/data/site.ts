// Données partagées du site : coordonnées, navigation (méga-menu + tiroir mobile), pied de page.
// Source unique : app/site-nav.json, lue aussi par le serveur Express (app/nav.js) pour que
// les pages dynamiques (blog, réalisations…) aient exactement la même navigation.
import data from '../../app/site-nav.json';

export type NavLink = { href: string; label: string; desc?: string; icon?: string };
export type NavGroup = { title?: string; links: NavLink[] };
export type NavItem = { label: string; id: string; layout: 'wide' | 'cols' | 'compact'; groups: NavGroup[]; footer?: NavLink };

export const SITE = data.SITE;
export const NAV = data.NAV as NavItem[];
export const FOOTER_COLS = data.FOOTER_COLS as { title: string; links: NavLink[] }[];
