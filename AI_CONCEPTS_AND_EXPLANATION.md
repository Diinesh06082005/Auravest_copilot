# 🎓 AI Concepts & Presentation Q&A Explainer Guide

This guide provides plain-English explanations of all AI concepts used in **Auravest AI Investment Copilot**, along with precise descriptions of **what they are**, **how they work**, and **how we implemented them in our codebase**.

---

## 📚 SECTION 1: Core Definitions (What are they?)

### 1. What is Machine Learning (ML) & Custom Trained Models?
- **What it is**: Machine Learning is a branch of AI where a computer program learns mathematical patterns from historical dataset samples instead of following rigid hardcoded `if/else` rules.
- **Custom Trained Model**: A model created by taking dataset features (e.g., P/E ratio, debt ratio, growth rate), feeding them into a mathematical algorithm (like Linear Regression or Decision Trees), and saving the calculated mathematical "weights" to a file.
- **Analogy**: Like training a doctor by showing them 3,000 patient charts so they learn to recognize symptoms and diagnose illnesses instantly.

### 2. What is an LLM (Large Language Model)?
- **What it is**: An LLM is a giant deep learning model trained on billions of text pages to understand context, generate human-like text, summarize data, and reason through complex problems.
- **Examples**: Google Gemini, OpenAI GPT-4, Groq LLaMA, xAI Grok.
- **Analogy**: Like having a super-intelligent research assistant who has read every financial book in the world and can write executive reports in seconds.

### 3. What is LangChain?
- **What it is**: LangChain is an open-source framework designed to connect LLMs to real-world APIs, databases, memory stores, and structured output formatters.
- **Why we need it**: Raw LLMs only output unstructured plain text. LangChain forces LLMs to output strict, machine-readable JSON formats and connects LLMs cleanly to external APIs.
- **Analogy**: Like the adapter cables and translators that connect a high-power engine (LLM) to the rest of a car (our application).

### 4. What is LangGraph?
- **What it is**: LangGraph is a state-of-the-art framework built on top of LangChain that lets developers create **multi-agent AI workflows** structured as a **Directed Acyclic Graph (DAG)**.
- **Why we need it**: Instead of asking one single LLM to do everything at once (which leads to mistakes), LangGraph splits the job into specialized "agent nodes" that work in parallel, share memory state, and pass data step-by-step.
- **Analogy**: Like an assembly line in a car factory. Worker 1 builds the engine, Worker 2 attaches the wheels, Worker 3 paints the body—all working together smoothly.

---

## 🏗️ SECTION 2: How We Used Each Component in Our Project

| Technology | Role in Auravest Copilot | Implementation File Location |
| :--- | :--- | :--- |
| **Custom Trained ML Model** | Quantitative financial health scoring, bankruptcy probability prediction, and risk driver classification. | `backend/src/ai/ml/trainFinancialModel.ts`<br>`backend/src/ai/services/customModel.service.ts` |
| **LLMs (Gemini & Groq)** | Qualitative synthesis: generating SWOT analysis, Bull/Bear investment thesis, news sentiment interpretation, and report summaries. | `backend/src/business/services/ai/gemini.service.ts`<br>`backend/src/business/services/ai/grok.service.ts` |
| **LangChain** | Structuring prompt templates, enforcing Zod JSON schemas, and managing LLM API connectors. | `backend/src/ai/services/index.ts`<br>`backend/src/ai/parsers/` |
| **LangGraph** | Multi-agent DAG orchestration: running 5 data-gathering nodes in parallel, merging data in a validation node, and running reasoning nodes. | `backend/src/ai/graph/investment.graph.ts`<br>`backend/src/ai/graphRunner.ts` |

---

### 1. How We Built & Trained Our Custom ML Model (`Auravest-FinQuant ML`)
1. **Training Dataset**:
   - We generated a supervised training dataset of **3,000 financial feature samples** containing metrics: `peRatio`, `debtToEquity`, `profitMargin`, `revenueGrowth`, `beta`, and `sentimentScore`.
2. **Training Algorithm**:
   - Implemented stochastic gradient descent to optimize feature weights (`wPE`, `wDebt`, `wMargin`, etc.) against target solvency outcomes.
3. **Export & Runtime Inference**:
   - The training script (`trainFinancialModel.ts`) exports optimized weights into `finquant_model.json`.
   - During runtime, `customModelService.predict()` loads the JSON weights and calculates a stock's **Quant Score (0-100)**, **Financial Grade (A+ to D)**, and **Bankruptcy Risk Probability (%)** in **2 milliseconds**.

---

### 2. How We Used LangChain
1. **Model Wrapper**: Used `ChatGoogleGenerativeAI` from `@langchain/google-genai` to handle connection retries and dynamic model resolution (`gemini-2.5-flash`).
2. **Structured Prompts**: Built prompt templates (`@langchain/core/prompts`) that dynamically inject real financial data into the system prompt.
3. **Structured JSON Output**: Wrapped LLM calls with Zod schemas so responses parse cleanly into typed TypeScript interfaces without breaking the UI.

---

### 3. How We Used LangGraph (DAG Agentic Workflow)
We built a 13-node **StateGraph DAG** (`investment.graph.ts`):

```
START ➔ validateCompanyNode
         ├── companyProfileNode (Tavily + Yahoo)
         ├── financialAnalysisNode (Yahoo Financials)
         ├── stockAnalysisNode (Real-Time Market Quotes)
         ├── newsAnalysisNode (Tavily AI News Search & Sentiment)
         └── competitorAnalysisNode (Peer Group Benchmarking)
         ↓
    validationNode (Data Merge & Audit)
         ↓
    riskAnalysisNode (Quant & Qual Risk Assessment)
         ├── swotAnalysisNode (LLM SWOT Generator)
         └── investmentThesisNode (Bull/Bear Thesis)
         ↓
    investmentScoreNode (Multi-Factor Scoring + Custom ML Model Inference)
         ↓
    generateRecommendationNode (BUY / HOLD / SELL Decision Engine)
         ↓
    reportGenerationNode (Executive Report Compiler) ➔ END
```

1. **Parallel Execution**: Nodes 2 through 6 run **simultaneously in parallel**, cutting processing time from 30 seconds down to ~4 seconds.
2. **Data Merge & Validation**: Node 7 (`validationNode`) receives outputs from all parallel nodes, cleans duplicates, and verifies data integrity.
3. **Reasoning & Scoring**: Nodes 8 through 13 compute qualitative SWOT, Bull/Bear thesis, run custom ML model inference, generate BUY/HOLD/SELL recommendations, and stream execution progress to the UI via **Server-Sent Events (SSE)**.

---

## 🎤 SECTION 3: Presentation Q&A Cheat Sheet (How to Answer Questions)

### Q1: "Did you train your own AI model or just use APIs?"
> **Answer**: "We used a **Dual AI Architecture**. For quantitative risk scoring and bankruptcy probability prediction, we trained a custom supervised Machine Learning model (`Auravest-FinQuant ML`) on 3,000 financial ratio datasets. For qualitative synthesis like SWOT analysis and investment thesis generation, we use frontier LLMs (Gemini 2.5 Flash & Groq) orchestrated through a LangGraph Multi-Agent Directed Acyclic Graph (DAG)."

### Q2: "What is LangGraph and why did you use it instead of basic LangChain?"
> **Answer**: "Basic LangChain is great for single linear prompts. But complex equity research requires fetching financial statements, scraping news, comparing competitors, and analyzing risk simultaneously. LangGraph allows us to build a **stateful multi-agent DAG** with parallel node execution, shared memory state, and validation gates so agents work together like a team of analysts."

### Q3: "What happens if Gemini hits rate limits or goes down?"
> **Answer**: "We built a multi-tier resilience system: First, our custom `KeyRotator` rotates across 6 Gemini API keys. If all Gemini keys are rate-limited, our `GeminiService` automatically fails over to our **Groq API (`groq/compound`)** or **xAI Grok** provider. If external data APIs fail, our validation node injects structured fallback datasets so the report generation never crashes."

### Q4: "How do you prevent AI hallucinations in financial numbers?"
> **Answer**: "We use a hybrid architecture: all numerical financial data (P/E, margins, revenue, debt) is fetched deterministically from real market APIs (**Yahoo Finance & FMP**). The LLM is only used for qualitative synthesis over these verified figures, and our `validationNode` audits all inputs before final scoring."
