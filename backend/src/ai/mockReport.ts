export const appleMockReport = {
  companyOverview: {
    name: "Apple Inc.",
    symbol: "AAPL",
    ceo: "Tim Cook",
    industry: "Consumer Electronics",
    sector: "Technology",
    hq: "Cupertino, CA",
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, AirPods, Apple TV, Apple Watch, Beats products, and HomePod.",
  },
  financialSummary: {
    revenue: 383285000000,
    netIncome: 96995000000,
    grossMargin: 44.13,
    operatingMargin: 29.82,
    eps: 6.13,
    peRatio: 28.5,
    financialHealthScore: 88,
  },
  stockSummary: {
    currentPrice: 185.5,
    changePercent: 1.2,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 124.17,
    beta: 1.28,
  },
  newsSummary: {
    articleCount: 15,
    categories: { Product: 5, Financial: 4, "M&A": 1, Legal: 5 },
    recentNews: [
      { title: "Apple Vision Pro sales exceed early expectations", sentiment: "Positive", impact: 4, source: "Bloomberg", time: "Recent" },
      { title: "Apple faces new EU antitrust scrutiny over App Store", sentiment: "Negative", impact: 3, source: "Reuters", time: "Recent" },
      { title: "Next-gen iPhone to feature major AI upgrades", sentiment: "Positive", impact: 5, source: "The Verge", time: "Recent" },
    ],
  },
  competitorSummary: {
    competitors: [
      { name: "Microsoft", symbol: "MSFT", marketCap: 3100000000000, revenue: 211000000000 },
      { name: "Alphabet", symbol: "GOOGL", marketCap: 1750000000000, revenue: 297000000000 },
      { name: "Samsung", symbol: "SMSN.IL", marketCap: 380000000000, revenue: 234000000000 },
    ],
  },
  riskSummary: {
    overallRiskScore: 35,
    overallRiskLevel: "Low-Medium",
    majorRisks: [
      "Heavy reliance on iPhone sales for majority of revenue.",
      "Increasing regulatory scrutiny in the EU and US.",
      "Supply chain vulnerabilities in Asia.",
    ],
  },
  swot: {
    strengths: [
      { title: "Brand Loyalty", explanation: "Unparalleled customer retention and brand equity globally.", confidenceScore: 95 },
      { title: "Ecosystem Integration", explanation: "Seamless integration across hardware, software, and services.", confidenceScore: 92 },
    ],
    weaknesses: [
      { title: "High Prices", explanation: "Premium pricing limits market share in developing nations.", confidenceScore: 85 },
      { title: "Product Dependency", explanation: "Over-reliance on iPhone product cycles.", confidenceScore: 88 },
    ],
    opportunities: [
      { title: "Services Growth", explanation: "Rapidly expanding high-margin services segment (Apple Music, iCloud, Pay).", confidenceScore: 90 },
      { title: "Healthcare & AR", explanation: "Expansion into wearables for health and augmented reality.", confidenceScore: 85 },
    ],
    threats: [
      { title: "Regulatory Pressure", explanation: "Antitrust investigations targeting App Store fees.", confidenceScore: 89 },
      { title: "Intense Competition", explanation: "Aggressive innovation from Samsung and Google.", confidenceScore: 82 },
    ],
  },
  thesis: {
    executiveSummary: { title: "Strong Hold", explanation: "Apple remains a core holding due to its robust ecosystem and cash flow, despite near-term macro headwinds.", confidenceScore: 90, supportingEvidence: [] },
    businessModel: { title: "Ecosystem Lock-in", explanation: "High switching costs and growing services revenue provide immense pricing power.", confidenceScore: 95, supportingEvidence: [] },
    competitiveAdvantage: { title: "Vertical Integration", explanation: "Custom silicon and tight hardware/software control create an unassailable moat.", confidenceScore: 92, supportingEvidence: [] },
    growthDrivers: { title: "Services & AR", explanation: "Future growth hinges on the Services segment and the adoption of Vision Pro/AR technologies.", confidenceScore: 85, supportingEvidence: [] },
    financialStrengths: { title: "Cash Generation", explanation: "Massive free cash flow allows for aggressive buybacks and dividends.", confidenceScore: 98, supportingEvidence: [] },
    financialWeaknesses: { title: "Hardware Saturation", explanation: "Slowing upgrade cycles for smartphones globally.", confidenceScore: 80, supportingEvidence: [] },
    industryOutlook: { title: "Consumer Tech Maturation", explanation: "The broader consumer electronics market is maturing, requiring pivots to AI and services.", confidenceScore: 85, supportingEvidence: [] },
    futureCatalysts: { title: "Generative AI Integration", explanation: "On-device AI integration in iOS 18 could spark a massive super-cycle of upgrades.", confidenceScore: 88, supportingEvidence: [] },
    majorConcerns: { title: "China Exposure", explanation: "Geopolitical tensions and local competition threaten market share in China.", confidenceScore: 85, supportingEvidence: [] },
    longTermOutlook: { title: "Stable Compounder", explanation: "Apple will likely remain a dominant, slow-growing, highly profitable compounder.", confidenceScore: 90, supportingEvidence: [] },
    investmentThesis: { title: "Ecosystem Resilience", explanation: "Apple's transition from a hardware company to a services ecosystem justifies its premium valuation. The stickiness of iOS guarantees long-term recurring revenue.", confidenceScore: 92, supportingEvidence: [] },
  },
  scores: {
    financialHealth: { value: 9.5, weight: 0.15, explanation: "Exceptional cash reserves and manageable debt.", calculationDetails: "" },
    growth: { value: 6.0, weight: 0.15, explanation: "Moderate hardware growth offset by services.", calculationDetails: "" },
    profitability: { value: 9.0, weight: 0.15, explanation: "Industry-leading margins.", calculationDetails: "" },
    valuation: { value: 6.5, weight: 0.1, explanation: "Trading at a premium to historical averages.", calculationDetails: "" },
    marketPerformance: { value: 8.0, weight: 0.1, explanation: "Consistent market outperformance.", calculationDetails: "" },
    competitiveStrength: { value: 9.5, weight: 0.1, explanation: "Incredible moat and brand power.", calculationDetails: "" },
    newsSentiment: { value: 7.0, weight: 0.05, explanation: "Generally positive but mixed with regulatory fears.", calculationDetails: "" },
    risk: { value: 8.5, weight: 0.1, explanation: "Low overall risk profile.", calculationDetails: "" },
    management: { value: 9.0, weight: 0.05, explanation: "Tim Cook's operational excellence is proven.", calculationDetails: "" },
    innovation: { value: 7.5, weight: 0.05, explanation: "More iterative than disruptive recently.", calculationDetails: "" },
    overallScore: 82,
    grade: "B+",
  },
  recommendation: {
    rating: "BUY",
    targetPrice: "$210.00",
    horizon: "12-18 Months",
    rationale: [
      "Services segment continues to expand margins.",
      "Unmatched customer loyalty and ecosystem stickiness.",
      "Massive capital return program via buybacks.",
      "Upcoming AI integrations could drive a hardware super-cycle."
    ],
  },
  confidence: 88,
  sources: [
    "Yahoo Finance API",
    "Tavily Search API",
    "Mock Fallback System"
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
  },
};
