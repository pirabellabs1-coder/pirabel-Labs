/**
 * Pirabel Labs — mapping Tailwind des tokens de design.
 * Les classes utilitaires consomment les variables CSS de tokens.css
 * (aucune valeur dupliquée — source unique de vérité).
 * Importer tokens.css globalement avant d'utiliser ces classes.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        fond: {
          DEFAULT: 'var(--bg)',
          alt: 'var(--bg-2)',
          surface: 'var(--surface)',
          'surface-2': 'var(--surface-2)',
        },
        texte: {
          DEFAULT: 'var(--text)',
          bright: 'var(--text-bright)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          clair: 'var(--accent-2)',
          soft: 'var(--accent-soft)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        'on-accent': 'var(--on-accent)',
      },
      fontFamily: {
        affichage: ['var(--police-affichage)'],
        titre: ['var(--police-titre)'],
        texte: ['var(--police-texte)'],
        mono: ['var(--police-mono)'],
      },
      borderRadius: {
        sm: 'var(--rayon-sm)',
        md: 'var(--rayon-md)',
        lg: 'var(--rayon-lg)',
        full: 'var(--rayon-full)',
      },
      boxShadow: {
        sm: 'var(--ombre-sm)',
        md: 'var(--ombre-md)',
        lg: 'var(--ombre-lg)',
      },
      maxWidth: { page: 'var(--largeur-max)' },
      transitionTimingFunction: { marque: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    },
  },
};
