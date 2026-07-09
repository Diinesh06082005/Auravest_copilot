import { getGeminiClient } from '../index';
import { GraphState } from '../../state';
import { InvestmentThesis } from '../../types';
import { investmentThesisPromptTemplate } from './investmentThesis.prompt';
import { InvestmentThesisParser } from './investmentThesis.parser';
import { logger } from '../../../shared/logger';

export class InvestmentThesisService {
  private readonly parser = new InvestmentThesisParser();

  /**
   * Generates a detailed corporate investment thesis based on current graph states.
   */
  public async generateThesis(state: GraphState): Promise<InvestmentThesis> {
    const companyName = state.profile?.name || state.company;
    const companySymbol = state.company;

    logger.info(`[InvestmentThesisService] Commencing Thesis generation for: "${companyName}"`);

    const rawProfile = (state.validatedData?.profile || state.profile || {}) as any;
    const rawFinancials = (state.validatedData?.financials || state.financials || {}) as any;
    const rawStock = (state.validatedData?.stock || state.stock || {}) as any;
    const rawRisk = (state.risk || {}) as any;
    const rawSwot = (state.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] }) as any;

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

    const swotSummary = {
      strengths: (rawSwot.strengths || []).map((s: any) => s.title),
      weaknesses: (rawSwot.weaknesses || []).map((w: any) => w.title),
      opportunities: (rawSwot.opportunities || []).map((o: any) => o.title),
      threats: (rawSwot.threats || []).map((t: any) => t.title),
    };

    const profileData = JSON.stringify(profileSummary, null, 2);
    const financialData = JSON.stringify(financialSummary, null, 2);
    const stockData = JSON.stringify(stockSummary, null, 2);
    const competitorData = JSON.stringify(competitorSummary, null, 2);
    const riskData = JSON.stringify(riskSummary, null, 2);
    const swotData = JSON.stringify(swotSummary, null, 2);

    const client = getGeminiClient();

    const promptInput = {
      companyName,
      companySymbol,
      profileData,
      financialData,
      stockData,
      competitorData,
      riskData,
      swotData,
      formatInstructions: this.parser.getFormatInstructions(),
    };

    const formattedPrompt = await investmentThesisPromptTemplate.format(promptInput);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        logger.info(`[InvestmentThesisService] Model query attempt ${attempts}/${maxAttempts}`);
        
        const response = await client.invoke(formattedPrompt);
        const responseText = typeof response.content === 'string' 
          ? response.content 
          : JSON.stringify(response.content);

        const parsedResult = await this.parser.parse(responseText);
        logger.info(`[InvestmentThesisService] Successfully generated and parsed Investment Thesis on attempt ${attempts}`);
        
        return parsedResult;

      } catch (error: any) {
        logger.warn(`[InvestmentThesisService] Thesis parsing failed on attempt ${attempts}: ${error.message}`);
        if (attempts >= maxAttempts) {
          throw new Error(`Investment Thesis generation failed after ${maxAttempts} attempts: ${error.message}`);
        }
      }
    }

    throw new Error('Investment Thesis generation failed.');
  }
}
