// ============================================================
// TEMA VIDAFEM — Baseado no Design System oficial
// ============================================================

// --- CORES (valores hex) ---
export const cores = {
  // Primária — Lilás suave (HSL 259 100% 74%)
  primaria: '#9B6BFF',

  // Secundária — Rosa suave (HSL 347 100% 76%)
  secundaria: '#FF6B8A',

  // Destaque — Lilás muito claro (HSL 259 100% 96%)
  destaque: '#F0EBFF',

  // Texto do destaque — Lilás mais escuro (HSL 259 100% 54%)
  textoDestaque: '#6B1FFF',

  // Destrutivo — Rosa/vermelho (HSL 347 100% 76%)
  destrutivo: '#FF6B8A',

  // Sucesso — Verde (HSL 160 100% 36%)
  sucesso: '#00B874',

  // Fundo — Branco quase puro (HSL 0 0% 99.2%)
  fundo: '#FDFDFD',

  // Texto principal — Cinza escuro (HSL 184 14% 20.8%)
  textoPrincipal: '#2D3535',

  // Muted — Cinza claro (HSL 214 32% 93%)
  muted: '#E8ECF4',

  // Borda — Cinza muito claro (HSL 214 32% 91%)
  borda: '#E2E7F2',

  // Branco puro
  branco: '#FFFFFF',
} as const;

export type TokenCor = keyof typeof cores;

// --- TIPOGRAFIA ---
// Outfit para títulos, Inter para corpo
export const tipografia = {
  // Famílias
  fonteDisplay: 'Outfit',
  fonteCorpo: 'Inter',

  // Tamanhos
  tamanhoXp: 11,
  tamanhoPq: 13,
  tamanhoMd: 15,
  tamanhoGd: 18,
  tamanhoXg: 22,
  tamanho2xg: 28,

  // Pesos
  regular: '400' as const,
  medio: '500' as const,
  semibold: '600' as const,
  negrito: '700' as const,
};

// --- ESPAÇAMENTOS ---
export const espacamento = {
  xp: 4,
  pq: 8,
  md: 16,
  gd: 24,
  xg: 32,
  xxg: 48,
};

// --- BORDAS ---
export const borda = {
  pq: 6,
  md: 12,
  gd: 20,
  cheia: 999,
};

// --- SOMBRAS ---
export const sombra = {
  pq: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// --- EXPORT DEFAULT ---
const tema = { cores, tipografia, espacamento, borda, sombra };
export default tema;
