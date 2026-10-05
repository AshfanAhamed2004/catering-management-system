
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/ClientDashboard.tsx", "utf8");

// We need to add state for categories
if (!code.includes("const [categories, setCategories] = useState<string[]>([])")) {
  code = code.replace(
    "const [comment, setComment] = useState('');",
    "const [comment, setComment] = useState('');\n  const [categories, setCategories] = useState<string[]>([]);"
  );
}

// Update submitFeedback to send categories
code = code.replace(
  /await api\.post\('\/api\/feedback', \{ bookingId: id, rating, comment \}\);/,
  "await api.post('/api/feedback', { bookingId: id, rating, comment, categories });"
);

// We need an SVG Star component or simple star icons
const newFeedbackModal = `
        {feedbackForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 p-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Rate Your Experience</h2>
                    <p className="text-sm text-gray-500">How did we do on your event?</p>
                  </div>
                  <button onClick={() => { setFeedbackForm(null); setError(''); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                
                <div className="p-6">
                  {error && <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}
                  
                  <div className="flex flex-col items-center mb-8">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                          <svg className={\`w-10 h-10 \${rating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}\`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-500 mt-2">
                      {rating === 5 ? 'Exceptional (5.0 / 5.0)' : rating === 4 ? 'Great (4.0 / 5.0)' : rating === 3 ? 'Average (3.0 / 5.0)' : rating === 2 ? 'Poor (2.0 / 5.0)' : 'Terrible (1.0 / 5.0)'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-800 mb-3">What made your event special? <span className="text-gray-400 font-normal text-xs">(Select all that apply)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {['FOOD_QUALITY', 'SERVICE', 'PUNCTUALITY', 'VALUE', 'OVERALL'].map((cat) => {
                        const labels: Record<string, string> = {
                          FOOD_QUALITY: 'Food Quality & Presentation',
                          SERVICE: 'Staff Professionalism',
                          PUNCTUALITY: 'Timely & Punctual',
                          VALUE: 'Value & Pricing',
                          OVERALL: 'Overall Coordination'
                        };
                        const isSelected = categories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategories(isSelected ? categories.filter(c => c !== cat) : [...categories, cat])}
                            className={\`text-xs font-medium px-4 py-2 rounded-full transition-colors border \${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}\`}
                          >
                            {isSelected && <span className="mr-1">?</span>}{labels[cat]}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-bold text-gray-800">Additional Comments & Highlights</label>
                      <span className="text-xs text-gray-400">{comment.length} / 500 chars</span>
                    </div>
                    <textarea 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      maxLength={500}
                      rows={3} 
                      placeholder="Tell us what you loved, or what we can improve..."
                      className="w-full border border-gray-200 bg-gray-50 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    ></textarea>
                  </div>
                </div>
                
                <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center">
                   <div className="flex items-center text-xs text-green-600 font-medium">
                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     Reviews reward our event team directly
                   </div>
                   <div className="flex gap-3">
                     <button onClick={() => { setFeedbackForm(null); setError(''); }} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
                     <button onClick={() => submitFeedback(feedbackForm)} className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                       Submit Feedback
                     </button>
                   </div>
                </div>
             </div>
          </div>
        )}`;

// Regex to replace the old feedbackForm
const regex = /\{feedbackForm && \([\s\S]*?\}\)/;
code = code.replace(regex, newFeedbackModal);

fs.writeFileSync("frontend/src/pages/ClientDashboard.tsx", code);

