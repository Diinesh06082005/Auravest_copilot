const fs = require('fs');

const logPath = 'C:/Users/dines/.gemini/antigravity/brain/1b02204c-ce80-4cff-9b51-858226c2d6c5/.system_generated/logs/overview.txt';
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

const types = new Set();
const keys = new Set();

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const parsed = JSON.parse(line);
    types.add(parsed.type);
    Object.keys(parsed).forEach(k => keys.add(k));
  } catch (err) {}
}

console.log("Types:", Array.from(types));
console.log("Keys:", Array.from(keys));
