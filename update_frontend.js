const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminFeedback.tsx', 'utf8');

// Add DangerBtn import
content = content.replace(/GhostBtn, Toast/, 'GhostBtn, Toast, DangerBtn');

// Add handleDelete function
const deleteFunc = `
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(\`/staff/feedback/\${id}\`);
      fetchFeedback();
      setToast('Feedback deleted successfully.');
    } catch (err) {
      alert(errorMessage(err) || 'Failed to delete feedback');
    }
  };

  const filtered = feedback.filter`;
content = content.replace(/const filtered = feedback\.filter/, deleteFunc);

// Refactor the action buttons block
const newActionBlock = `                  <div className="border-t border-[var(--color-divider)] pt-4 flex gap-2 items-center flex-wrap w-full">
                    {responding === item.id ? (
                      <div className="space-y-3 w-full">
                        <Textarea
                          rows={3}
                          placeholder="Write a professional response to the client..."
                          value={response}
                          onChange={e => setResponse(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <PrimaryBtn onClick={() => handleUpdateStatus(item.id, 'RESPONDED', response)}>Submit Response</PrimaryBtn>
                          <SecondaryBtn onClick={() => { setResponding(null); setResponse(''); }}>Cancel</SecondaryBtn>
                        </div>
                      </div>
                    ) : (
                      <>
                        {item.status === 'SUBMITTED' && (
                            <SecondaryBtn onClick={() => handleUpdateStatus(item.id, 'UNDER_REVIEW', '')}>Mark Under Review</SecondaryBtn>
                        )}
                        {(item.status === 'UNDER_REVIEW' || !item.staff_response && !item.staffResponse) && (
                            <GhostBtn onClick={() => setResponding(item.id)}>Respond to Client</GhostBtn>
                        )}
                        {(item.status === 'RESPONDED' || item.staff_response || item.staffResponse) && (
                            <GhostBtn onClick={() => { setResponding(item.id); setResponse(item.staff_response || item.staffResponse || ''); }}>Edit Response</GhostBtn>
                        )}
                        {item.status === 'RESPONDED' && (
                            <GhostBtn onClick={() => handleUpdateStatus(item.id, 'RESOLVED', item.staff_response || item.staffResponse)}>Mark Resolved</GhostBtn>
                        )}
                        <DangerBtn onClick={() => handleDelete(item.id)} className="ml-auto">Delete</DangerBtn>
                      </>
                    )}
                  </div>`;

// We need to replace the exact block. Let's use regex matching from <div className="border-t to the end of that block.
const actionBlockRegex = /<div className="border-t border-\[var\(--color-divider\)] pt-4 flex gap-2 items-center flex-wrap">[\s\S]*?<\/div>\s*<\/SectionCard>/;
content = content.replace(actionBlockRegex, newActionBlock + '\n                </SectionCard>');

fs.writeFileSync('frontend/src/pages/AdminFeedback.tsx', content);
