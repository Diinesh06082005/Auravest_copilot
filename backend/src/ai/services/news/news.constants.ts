export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Earnings: ['earnings', 'revenue', 'quarterly', 'fiscal', 'eps', 'net income', 'profit', 'sales report', 'dividend', 'guidance'],
  'Product Launch': ['launch', 'introduce', 'unveil', 'release', 'new version', 'roll out', 'announced', 'debut'],
  Acquisition: ['acquire', 'acquisition', 'merger', 'buyout', 'purchased', 'takeover', 'bought'],
  Management: ['ceo', 'cfo', 'director', 'board', 'leadership', 'hire', 'resign', 'executive', 'succession', 'chairman'],
  Regulation: ['sec', 'regulatory', 'ftc', 'compliance', 'government', 'policy', 'ban', 'antitrust', 'investigation', 'probe'],
  Lawsuit: ['lawsuit', 'sue', 'litigation', 'court', 'patent dispute', 'allegation', 'complaint', 'settlement', 'damages'],
  Partnership: ['partnership', 'collaborate', 'alliance', 'joint venture', 'agreement', 'cooperate', 'deal'],
  Investment: ['investment', 'fundraise', 'venture capital', 'stake', 'buy share', 'funding', 'invests', 'capital expenditure'],
  Technology: ['ai', 'artificial intelligence', 'tech', 'software', 'chip', 'semiconductor', 'cloud', 'quantum', 'infrastructure'],
  Market: ['stock price', 'shares', 'nasdaq', 'dow', 'index', 'bull market', 'bear market', 'valuation', 'ticker', 'shares of', 'trade'],
};

export const POSITIVE_KEYWORDS = [
  'bullish', 'profit', 'growth', 'launch', 'partnership', 'gain', 'upgrade', 'success', 
  'innovative', 'expand', 'record-breaking', 'beats', 'exceeds', 'positive', 'raise', 'higher',
  'strong', 'optimistic', 'surpass', 'outperform'
];

export const NEGATIVE_KEYWORDS = [
  'bearish', 'loss', 'decline', 'regulatory', 'lawsuit', 'sue', 'penalty', 'investigation', 
  'layoff', 'drop', 'plunge', 'miss', 'warn', 'negative', 'risk', 'lower', 'fail', 
  'deficit', 'slump', 'downsize', 'investigating'
];
