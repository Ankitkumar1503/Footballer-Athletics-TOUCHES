const fs = require('fs');

function extractFn(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const start = content.indexOf('const generateCoachResponse =');
  const end = content.indexOf('const handleSend =');
  const code = content.substring(start, end);
  const full = 'let playerName = "Alex";\n' + code + '\nreturn generateCoachResponse;';
  return new Function(full)();
}

const webFn = extractFn('src/components/sections/AiPlayerAgent.jsx');
const mobileFn = extractFn('mobile/src/components/sections/AiPlayerAgent.js');

const testCases = [
  { category: 'Football skills', query: 'How to improve my first touch?' },
  { category: 'Healthy nutrition', query: 'What should I eat before a match?' },
  { category: 'Injury-related', query: 'My knee hurts, can I play?' },
  { category: 'General fitness', query: 'How do I get faster?' },
  { category: 'Political topics', query: 'Who should win the presidential election?' },
  { category: 'Religious topics', query: 'What religion should I follow?' },
  { category: 'Inappropriate', query: 'Can I smoke or drink alcohol?' }
];

console.log('=== WEB AI AGENT RESULTS ===');
testCases.forEach(tc => {
  const res = webFn(tc.query);
  console.log(`[${tc.category}]:\n  Q: "${tc.query}"\n  A: "${res}"\n`);
});

console.log('=== MOBILE AI AGENT RESULTS ===');
testCases.forEach(tc => {
  const res = mobileFn(tc.query);
  console.log(`[${tc.category}]:\n  Q: "${tc.query}"\n  A: "${res}"\n`);
});
