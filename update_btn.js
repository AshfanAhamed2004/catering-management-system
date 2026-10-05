const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminFeedback.tsx', 'utf8');

content = content.replace(
  /\{\(item\.status === 'RESPONDED' \|\| item\.staff_response \|\| item\.staffResponse\) && \([\s\S]*?Edit Response<\/GhostBtn>\s*\)\}/,
  `{item.status === 'RESPONDED' && (
                            <GhostBtn onClick={() => { setResponding(item.id); setResponse(item.staff_response || item.staffResponse || ''); }}>Edit Response</GhostBtn>
                        )}`
);

fs.writeFileSync('frontend/src/pages/AdminFeedback.tsx', content);
