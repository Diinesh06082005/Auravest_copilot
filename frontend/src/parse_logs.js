const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/dines/.gemini/antigravity/brain/1b02204c-ce80-4cff-9b51-858226c2d6c5/.system_generated/logs/overview.txt';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const parsed = JSON.parse(line);
    if (parsed.step_index >= 20 && parsed.step_index <= 25) {
      console.log(`--- Step ${parsed.step_index} (${parsed.type}) ---`);
      if (parsed.tool_calls) {
        console.log("Tool Calls:", JSON.stringify(parsed.tool_calls, null, 2));
      }
      if (parsed.tool_results) {
        console.log("Tool Results:", JSON.stringify(parsed.tool_results, null, 2).substring(0, 1000));
      }
      if (parsed.content) {
        console.log("Content:", parsed.content.substring(0, 500));
      }
    }
  } catch (err) {
    console.error("Error parsing line:", err.message);
  }
}
