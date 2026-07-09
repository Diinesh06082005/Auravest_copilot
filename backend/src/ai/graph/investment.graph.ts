import { StateGraph, START, END } from '@langchain/langgraph';
import { InvestmentStateAnnotation } from '../state';
import { validateCompanyNode } from '../nodes/validateCompany.node';
import { companyProfileNode } from '../nodes/companyProfile.node';
import { financialAnalysisNode } from '../nodes/financialAnalysis.node';
import { stockAnalysisNode } from '../nodes/stockAnalysis.node';
import { newsAnalysisNode } from '../nodes/newsAnalysis.node';
import { competitorAnalysisNode } from '../nodes/competitorAnalysis.node';
import { validationNode } from '../nodes/validation.node';
import { riskAnalysisNode } from '../nodes/riskAnalysis.node';
import { swotAnalysisNode } from '../nodes/swotAnalysis.node';
import { investmentThesisNode } from '../nodes/investmentThesis.node';
import { investmentScoreNode } from '../nodes/investmentScore.node';
import { recommendationNode } from '../nodes/recommendation.node';
import { reportGenerationNode } from '../nodes/reportGeneration.node';

// Set up the graph builder mapping nodes sequentially
const builder = new StateGraph(InvestmentStateAnnotation)
  .addNode('validateCompany', validateCompanyNode)
  .addNode('companyProfile', companyProfileNode)
  .addNode('financialAnalysis', financialAnalysisNode)
  .addNode('stockAnalysis', stockAnalysisNode)
  .addNode('newsAnalysis', newsAnalysisNode)
  .addNode('competitorAnalysis', competitorAnalysisNode)
  .addNode('validation', validationNode)
  .addNode('riskAnalysis', riskAnalysisNode)
  .addNode('swotAnalysis', swotAnalysisNode)
  .addNode('investmentThesis', investmentThesisNode)
  .addNode('investmentScoring', investmentScoreNode)
  .addNode('generateRecommendation', recommendationNode)
  .addNode('reportGeneration', reportGenerationNode);

// Define parallel execution DAG
builder
  .addEdge(START, 'validateCompany')
  
  // Fork parallel data-fetching nodes
  .addEdge('validateCompany', 'companyProfile')
  .addEdge('validateCompany', 'financialAnalysis')
  .addEdge('validateCompany', 'stockAnalysis')
  .addEdge('validateCompany', 'newsAnalysis')
  .addEdge('validateCompany', 'competitorAnalysis')
  
  // Join parallel nodes into validation/merge audit
  .addEdge('companyProfile', 'validation')
  .addEdge('financialAnalysis', 'validation')
  .addEdge('stockAnalysis', 'validation')
  .addEdge('newsAnalysis', 'validation')
  .addEdge('competitorAnalysis', 'validation')
  
  // Sequential reasoning flow after join
  .addEdge('validation', 'riskAnalysis')
  
  // Parallel reasoning: Fork riskAnalysis to swotAnalysis and investmentThesis
  .addEdge('riskAnalysis', 'swotAnalysis')
  .addEdge('riskAnalysis', 'investmentThesis')
  
  // Join parallel reasoning nodes into scoring
  .addEdge('swotAnalysis', 'investmentScoring')
  .addEdge('investmentThesis', 'investmentScoring')
  
  .addEdge('investmentScoring', 'generateRecommendation')
  .addEdge('generateRecommendation', 'reportGeneration')
  .addEdge('reportGeneration', END);

// Compile the workflow structure
export const investmentGraph = builder.compile();
