import { ChatPromptTemplate } from '@langchain/core/prompts';

export const baseResearchPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are an expert AI financial analyst assistant.'],
  ['human', 'Conduct a complete financial research analysis for the ticker: {ticker}'],
]);
