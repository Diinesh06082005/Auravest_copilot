# AuraVest Copilot ✦ Backend Service Documentation

This directory contains the backend REST API routes, mongoose data models, Tavily/Yahoo scrapers, and LangGraph workflow orchestration nodes.

---

# 🧠 LangGraph Analysis Nodes In-Depth

Detailed description of the validateCompanyNode execution node:

The validateCompanyNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the validateCompanyNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the financialAnalysisNode execution node:

The financialAnalysisNode is a key operational unit inside the stateful
LangGraph pipeline. It is responsible for executing a specific portion of the
analysis sequence. Under the hood, this node reads the active state variables
(such as the target company ticker symbol and past audit findings), triggers its
target API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the financialAnalysisNode reports its status to the
client-side orchestrator through the Server-Sent Events stream. It pushes the
node's name and its estimated contribution to the overall progress percentage,
allowing the user to view exactly what the AI is working on in real-time. If an
API query fails, this node includes fallback catch logic to ensure the rest of
the research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the stockAnalysisNode execution node:

The stockAnalysisNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the stockAnalysisNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the newsAnalysisNode execution node:

The newsAnalysisNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the newsAnalysisNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the competitorAnalysisNode execution node:

The competitorAnalysisNode is a key operational unit inside the stateful
LangGraph pipeline. It is responsible for executing a specific portion of the
analysis sequence. Under the hood, this node reads the active state variables
(such as the target company ticker symbol and past audit findings), triggers its
target API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the competitorAnalysisNode reports its status to the
client-side orchestrator through the Server-Sent Events stream. It pushes the
node's name and its estimated contribution to the overall progress percentage,
allowing the user to view exactly what the AI is working on in real-time. If an
API query fails, this node includes fallback catch logic to ensure the rest of
the research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the validationNode execution node:

The validationNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the validationNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the riskAnalysisNode execution node:

The riskAnalysisNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the riskAnalysisNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the swotAnalysisNode execution node:

The swotAnalysisNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the swotAnalysisNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the investmentThesisNode execution node:

The investmentThesisNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the investmentThesisNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the investmentScoringNode execution node:

The investmentScoringNode is a key operational unit inside the stateful
LangGraph pipeline. It is responsible for executing a specific portion of the
analysis sequence. Under the hood, this node reads the active state variables
(such as the target company ticker symbol and past audit findings), triggers its
target API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the investmentScoringNode reports its status to the
client-side orchestrator through the Server-Sent Events stream. It pushes the
node's name and its estimated contribution to the overall progress percentage,
allowing the user to view exactly what the AI is working on in real-time. If an
API query fails, this node includes fallback catch logic to ensure the rest of
the research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the generateRecommendationNode execution node:

The generateRecommendationNode is a key operational unit inside the stateful
LangGraph pipeline. It is responsible for executing a specific portion of the
analysis sequence. Under the hood, this node reads the active state variables
(such as the target company ticker symbol and past audit findings), triggers its
target API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the generateRecommendationNode reports its status to the
client-side orchestrator through the Server-Sent Events stream. It pushes the
node's name and its estimated contribution to the overall progress percentage,
allowing the user to view exactly what the AI is working on in real-time. If an
API query fails, this node includes fallback catch logic to ensure the rest of
the research pipeline can complete successfully instead of crashing the entire
system.

---

Detailed description of the reportGenerationNode execution node:

The reportGenerationNode is a key operational unit inside the stateful LangGraph
pipeline. It is responsible for executing a specific portion of the analysis
sequence. Under the hood, this node reads the active state variables (such as
the target company ticker symbol and past audit findings), triggers its target
API integrations (like Tavily or Yahoo Finance), and writes the resulting
structural metrics back to the shared graph memory. This design ensures that
subsequent nodes can read and build upon the data compiled by this node.

During execution, the reportGenerationNode reports its status to the client-side
orchestrator through the Server-Sent Events stream. It pushes the node's name
and its estimated contribution to the overall progress percentage, allowing the
user to view exactly what the AI is working on in real-time. If an API query
fails, this node includes fallback catch logic to ensure the rest of the
research pipeline can complete successfully instead of crashing the entire
system.

---

---

# 💾 Database Collection Schemas

Detailed explanation of the Mongoose schema for the UserCollection MongoDB
collection:

The UserCollection collection stores critical state data in the MongoDB
instance. It is managed by Mongoose schema models in the backend service layer.
The schema defines strict fields, type parameters (such as Strings, Numbers,
Booleans, or ObjectIds), index configurations, and validation rules to ensure
data integrity.

For example, fields like emails and tickers are stored in normalized uppercase
or lowercase formats, and indexes are added to expedite search operations. The
schema also implements standard timestamp properties that automatically record
creation and update times. When documents are saved, pre-save hooks are executed
to run sanitization checks, hash passwords if applicable, or populate relational
links.

---

Detailed explanation of the Mongoose schema for the ResearchReportCollection
MongoDB collection:

The ResearchReportCollection collection stores critical state data in the
MongoDB instance. It is managed by Mongoose schema models in the backend service
layer. The schema defines strict fields, type parameters (such as Strings,
Numbers, Booleans, or ObjectIds), index configurations, and validation rules to
ensure data integrity.

For example, fields like emails and tickers are stored in normalized uppercase
or lowercase formats, and indexes are added to expedite search operations. The
schema also implements standard timestamp properties that automatically record
creation and update times. When documents are saved, pre-save hooks are executed
to run sanitization checks, hash passwords if applicable, or populate relational
links.

---

Detailed explanation of the Mongoose schema for the SearchHistoryCollection
MongoDB collection:

The SearchHistoryCollection collection stores critical state data in the MongoDB
instance. It is managed by Mongoose schema models in the backend service layer.
The schema defines strict fields, type parameters (such as Strings, Numbers,
Booleans, or ObjectIds), index configurations, and validation rules to ensure
data integrity.

For example, fields like emails and tickers are stored in normalized uppercase
or lowercase formats, and indexes are added to expedite search operations. The
schema also implements standard timestamp properties that automatically record
creation and update times. When documents are saved, pre-save hooks are executed
to run sanitization checks, hash passwords if applicable, or populate relational
links.

---

Detailed explanation of the Mongoose schema for the WatchlistCollection MongoDB
collection:

The WatchlistCollection collection stores critical state data in the MongoDB
instance. It is managed by Mongoose schema models in the backend service layer.
The schema defines strict fields, type parameters (such as Strings, Numbers,
Booleans, or ObjectIds), index configurations, and validation rules to ensure
data integrity.

For example, fields like emails and tickers are stored in normalized uppercase
or lowercase formats, and indexes are added to expedite search operations. The
schema also implements standard timestamp properties that automatically record
creation and update times. When documents are saved, pre-save hooks are executed
to run sanitization checks, hash passwords if applicable, or populate relational
links.

---

Detailed explanation of the Mongoose schema for the
NotificationPreferenceCollection MongoDB collection:

The NotificationPreferenceCollection collection stores critical state data in
the MongoDB instance. It is managed by Mongoose schema models in the backend
service layer. The schema defines strict fields, type parameters (such as
Strings, Numbers, Booleans, or ObjectIds), index configurations, and validation
rules to ensure data integrity.

For example, fields like emails and tickers are stored in normalized uppercase
or lowercase formats, and indexes are added to expedite search operations. The
schema also implements standard timestamp properties that automatically record
creation and update times. When documents are saved, pre-save hooks are executed
to run sanitization checks, hash passwords if applicable, or populate relational
links.

---

---

# 📂 Backend File Catalog & Implementation

Detailed analysis of backend/src/index.ts: This is the primary entry point for
the backend application. Upon startup, it establishes connections to MongoDB,
verifies API keys for Gemini and Tavily, and seeds the default demo account if
it does not exist.

Detailed analysis of backend/src/presentation/controllers/auth.controller.ts:
Handles user authentication, login, and signup routes. It signs JWT tokens and
stores them in secure HTTP-only cookies.

Detailed analysis of
backend/src/presentation/controllers/research.controller.ts: Coordinates the SSE
analysis stream. It launches the LangGraph engine and streams research progress.
It also handles YouTube video searches.

Detailed analysis of backend/src/business/services/ai/prompts.ts: Contains all
prompt templates for the LangGraph nodes, guiding the Gemini API on how to
structure the investment thesis and SWOT analysis.

Detailed analysis of backend/src/business/services/pdf/pdf.service.ts: Uses
PDFKit to generate print-ready PDF reports, complete with cover pages, financial
charts, and SWOT matrices.

Detailed analysis of backend/src/data/services/yahoo-finance.service.ts: Fetches
stock profiles, historical close prices, and quarterly financial sheets from the
Yahoo Finance API.

Detailed analysis of backend/src/data/services/tavily.service.ts: Scrapes active
news articles about a stock and scores sentiment to assess market headwinds.

Detailed analysis of backend/src/data/models/user.model.ts: Defines the User
schema in MongoDB, storing emails, password hashes, and user roles.

Detailed analysis of backend/src/data/models/research.model.ts: Defines the
Research model schema, saving financial metrics, SWOT matrices, and investment
reports.

---

# 🛡 Troubleshooting & Stability Operations

Authentication Stream Dropping: If Server-Sent Events streams fail due to
authorization token expiration, configure pre-flight verification policies to
synchronize access cookies.

Autofocus Layout Shifts: If subcomponents steal focus and scroll the page to the
bottom, use element scrollTop overrides to maintain page alignment at the top
coordinates.

API Rate Limit Exceeded: If Gemini or Tavily search API requests exceed key
rotation limits, implement catch retry operations to ensure the research
pipeline completes.

Database Connection Timeout: Check MongoDB URI variables and verify network
connectivity settings if startup bootstraps fail.

---
