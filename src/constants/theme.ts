/**
 * WARM_EARTHY preset with the brief's mineral overrides.
 * The preset `name` is preserved exactly as it appears in preset.ts.
 */
export const theme = {
  name: 'warm-earthy',

  colors: {
    // depth
    background: '#221016',
    backgroundDeep: '#17090E',
    scrim: 'rgba(34,16,22,0.88)',
    scrimSoft: 'rgba(34,16,22,0.70)',

    // material surfaces
    primary: '#AB2A58',
    accent: '#28C8E0',
    stone: '#592C26',
    stoneLight: '#70392F',
    stoneDeep: '#3C1C1D',

    // text
    textPrimary: '#F0E9EC',
    textSecondary: '#E8DDC4',
    textMuted: '#D8C9A8',
    onAccent: '#221016',

    // mineral pigments
    limestone: '#E8DDC4',
    ochre: '#D9B36C',
    terracotta: '#D97B4D',
    lapis: '#355C9A',
    olive: '#7FA46B',
    rose: '#AB2A58',
    darkStone: '#592C26',
    chalk: '#FAF5EC',

    // lines
    border: 'rgba(232,221,196,0.18)',
    borderStrong: 'rgba(232,221,196,0.35)',
    borderFaint: 'rgba(232,221,196,0.10)',
    highlight: 'rgba(250,245,236,0.14)',
  },

  gradients: {
    loader: ['#221016', '#592C26', '#180A10'] as string[],
    menu: ['#592C26', '#221016', '#4A1830'] as string[],
    game: ['#221016', '#3C1C1D', '#221016'] as string[],
    result: ['#592C26', '#AB2A58', '#221016'] as string[],
    museum: ['#221016', '#43212A', '#592C26'] as string[],
    action: ['#28C8E0', '#9FE4EC', '#E8DDC4'] as string[],
    stone: ['#6B372E', '#592C26', '#48231F'] as string[],
    tray: ['#653128', '#51271F'] as string[],
  },

  typography: {
    hero: { fontSize: 40, fontWeight: '700' as const, lineHeight: 44, letterSpacing: 0.5 },
    heading: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: 0.2 },
    section: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
    cardTitle: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
    button: { fontSize: 16, fontWeight: '700' as const, lineHeight: 24, letterSpacing: 0.8 },
    caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.8 },
    stat: { fontSize: 22, fontWeight: '700' as const, lineHeight: 26 },
  },

  radius: { sm: 8, md: 14, lg: 16, xl: 20, full: 999 },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  shadows: {
    card: {
      shadowColor: '#140609',
      shadowOpacity: 0.28,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    action: {
      shadowColor: '#28C8E0',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 7,
    },
    tray: {
      shadowColor: '#120508',
      shadowOpacity: 0.45,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: -2 },
      elevation: 8,
    },
  },

  anim: {
    press: { tension: 180, friction: 16 },
    fade: 220,
    quick: 180,
  },
} as const;

export type Theme = typeof theme;
