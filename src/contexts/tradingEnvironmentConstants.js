export const TRADING_MODES = {
  INTERNAL: 'INTERNAL',
  PAPER: 'PAPER',
};

export const MODE_CONFIG = {
  [TRADING_MODES.INTERNAL]: {
    label: '系統模擬',
    shortLabel: 'SIM',
    description: '使用內建撮合引擎產生的模擬行情',
    badge: '🔧',
    accentHue: '263',
  },
  [TRADING_MODES.PAPER]: {
    label: '市場模擬',
    shortLabel: 'PAPER',
    description: '串接 CCXT 即時市場行情，模擬下單',
    badge: '📡',
    accentHue: '155',
  },
};