import { getGeminiClient } from '../index';
import { GraphState } from '../../state';
import { SWOTAnalysis } from '../../types';
import { swotPromptTemplate } from './swot.prompt';
import { SwotParser } from './swot.parser';
import { logger } from '../../../shared/logger';

export class SwotService {
  private readonly parser = new SwotParser();

  /**
   * Executes Gemini LLM prompting to build a detailed corporate SWOT profile.
   */
  public async generateSwot(state: GraphState): Promise<SWOTAnalysis> {
    const companyName = state.profile?.name || state.company;
    const companySymbol = state.company;

    logger.info(`[SwotService] Commencing SWOT generation for: "${companyName}"`);

    const rawProfile = (state.validatedData?.profile || state.profile || {}) as any;
    const rawFinancials = (state.validatedData?.financials || state.financials || {}) as any;
    const rawStock = (state.validatedData?.stock || state.stock || {}) as any;
    const rawRisk = (state.risk || {}) as any;

    const profileSummary = {
      name: rawProfile.name,
      symbol: rawProfile.symbol,
      sector: rawProfile.sector,
      industry: rawProfile.industry,
      description: rawProfile.businessDescription,
    };

    const financialSummary = {
      revenue: rawFinancials.revenue,
      revenueGrowth: rawFinancials.revenueGrowth,
      netIncome: rawFinancials.netIncome,
      grossMargin: rawFinancials.grossMargin,
      operatingMargin: rawFinancials.operatingMargin,
      peRatio: rawFinancials.peRatio,
      debtToEquity: rawFinancials.debtToEquity,
      currentRatio: rawFinancials.currentRatio,
      healthScore: rawFinancials.healthScore,
    };

    const stockSummary = {
      currentPrice: rawStock.currentPrice,
      dailyChangePercent: rawStock.dailyChangePercent,
      fiftyTwoWeekHigh: rawStock.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: rawStock.fiftyTwoWeekLow,
      beta: rawStock.beta,
    };

    const newsList = state.validatedData?.news || state.news || [];
    const newsSummary = {
      totalArticles: newsList.length,
      sentiment: {
        positive: newsList.filter((n: any) => n.sentiment === 'Positive').length,
        negative: newsList.filter((n: any) => n.sentiment === 'Negative').length,
        neutral: newsList.filter((n: any) => n.sentiment === 'Neutral').length,
      },
    };

    const competitorSummary = {
      peersCount: (state.competitors || []).length,
      marketRanking: state.marketRanking || {},
      relativePerformance: state.relativePerformance || {},
    };

    const riskSummary = {
      overallRiskScore: rawRisk.overallRiskScore,
      overallRiskLevel: rawRisk.overallRiskLevel,
      majorRisks: rawRisk.majorRiskFactors || [],
    };

    const profileData = JSON.stringify(profileSummary, null, 2);
    const financialData = JSON.stringify(financialSummary, null, 2);
    const stockData = JSON.stringify(stockSummary, null, 2);
    const newsData = JSON.stringify(newsSummary, null, 2);
    const competitorData = JSON.stringify(competitorSummary, null, 2);
    const riskData = JSON.stringify(riskSummary, null, 2);

    const client = getGeminiClient();

    const promptInput = {
      companyName,
      companySymbol,
      profileData,
      financialData,
      stockData,
      newsData,
      competitorData,
      riskData,
      formatInstructions: this.parser.getFormatInstructions(),
    };

    const formattedPrompt = await swotPromptTemplate.format(promptInput);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        logger.info(`[SwotService] Model query attempt ${attempts}/${maxAttempts}`);
        
        const response = await client.invoke(formattedPrompt);
        const responseText = typeof response.content === 'string' 
          ? response.content 
          : JSON.stringify(response.content);

        const parsedResult = await this.parser.parse(responseText);
        logger.info(`[SwotService] Successfully generated and parsed SWOT on attempt ${attempts}`);
        
        return parsedResult;

      } catch (error: any) {
        logger.warn(`[SwotService] SWOT parsing failed on attempt ${attempts}: ${error.message}`);
        if (attempts >= maxAttempts) {
          throw new Error(`SWOT Analysis generation failed after ${maxAttempts} attempts: ${error.message}`);
        }
      }
    }

    throw new Error('SWOT Analysis generation failed.');
  }
}
