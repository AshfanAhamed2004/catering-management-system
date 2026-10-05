
const fs = require("fs");

// 1. Update FeedbackService.java
let svc = fs.readFileSync("backend/src/main/java/com/joy/catering/service/FeedbackService.java", "utf8");
if (!svc.includes("deleteFeedback")) {
  const newFunc = `
    public void deleteFeedback(Long feedbackId, Long customerId) {
        Feedback feedback = feedbackRepo.findById(feedbackId)
                .filter(f -> f.getCustomer().getId().equals(customerId))
                .orElseThrow(() -> new ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Feedback not found or access denied"));
        feedbackRepo.delete(feedback);
    }
  `;
  svc = svc.replace(/public String exportFeedbackCsv/, newFunc + "\n    public String exportFeedbackCsv");
  fs.writeFileSync("backend/src/main/java/com/joy/catering/service/FeedbackService.java", svc);
}

// 2. Update FeedbackController.java
let ctrl = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/FeedbackController.java", "utf8");
if (!ctrl.includes("@DeleteMapping")) {
  const delEndpoint = `
    @org.springframework.web.bind.annotation.DeleteMapping("/feedback/{id}")
    public org.springframework.http.ResponseEntity<Void> deleteFeedback(@org.springframework.web.bind.annotation.PathVariable Long id, org.springframework.security.core.Authentication auth) {
        feedbackService.deleteFeedback(id, me(auth).getId());
        return org.springframework.http.ResponseEntity.noContent().build();
    }
  `;
  ctrl = ctrl.replace(/(\/\/ --- Staff Endpoints ---)/, delEndpoint + "\n    $1");
  fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/FeedbackController.java", ctrl);
}

// 3. Update ClientDashboard.tsx
let ui = fs.readFileSync("frontend/src/pages/ClientDashboard.tsx", "utf8");

// State for edit form ID
if (!ui.includes("const [editingFeedbackId, setEditingFeedbackId]")) {
  ui = ui.replace(
    "const [feedbackForm, setFeedbackForm] = useState<number | null>(null);",
    "const [feedbackForm, setFeedbackForm] = useState<number | null>(null);\n  const [editingFeedbackId, setEditingFeedbackId] = useState<number | null>(null);"
  );
}

// Open edit function
if (!ui.includes("const openEditFeedback =")) {
  const openEditFunc = `
  const openEditFeedback = (f: any) => {
    setEditingFeedbackId(f.id);
    setRating(f.rating);
    setComment(f.comment);
    setCategories(f.categories || []);
    setFeedbackForm(f.booking_id);
  };
  
  const deleteFeedback = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.delete(\`/feedback/\${id}\`);
      fetchData();
    } catch(err) {
      alert(errorMessage(err));
    }
  };
  `;
  ui = ui.replace("const submitFeedback = async (bookingId: number) => {", openEditFunc + "\n  const submitFeedback = async (bookingId: number) => {");
}

// Modify submitFeedback to handle PUT if editingFeedbackId is set
const submitFuncOld = /const submitFeedback = async \(bookingId: number\) => \{[\s\S]*?fetchData\(\);\s*\} catch\(err\) \{\s*setError\(errorMessage\(err\).*?\);\s*\}\s*\};/;
const submitFuncNew = `const submitFeedback = async (bookingId: number) => {
    try {
      if (editingFeedbackId) {
        await api.put(\`/feedback/\${editingFeedbackId}\`, { rating, comment, categories });
      } else {
        await api.post(\`/bookings/\${bookingId}/feedback\`, { rating, comment, categories });
      }
      setFeedbackForm(null);
      setEditingFeedbackId(null);
      setRating(5);
      setComment('');
      setCategories([]);
      fetchData();
    } catch(err) {
      setError(errorMessage(err) || 'Failed to submit feedback');
    }
  };`;
ui = ui.replace(submitFuncOld, submitFuncNew);

// UI Buttons for Edit/Delete on Feedback List
const feedbackListCardOld = /<p className="text-gray-600 italic">"\{f\.comment\}"<\/p>\s*\}\)\s*<\/div>/;
const feedbackListCardNew = `<p className="text-gray-600 italic mb-2">"{f.comment}"</p>
                   <div className="flex gap-2 justify-end">
                     <button onClick={() => openEditFeedback(f)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 font-medium">Edit</button>
                     <button onClick={() => deleteFeedback(f.id)} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 font-medium">Delete</button>
                   </div>
               </div>
           ))}
        </div>`;
ui = ui.replace(feedbackListCardOld, feedbackListCardNew);

// Also reset states on cancel
ui = ui.replace(
  /onClick=\{.*?setFeedbackForm\(null\); setError\('\);.*?\}/g,
  "onClick={() => { setFeedbackForm(null); setEditingFeedbackId(null); setError(''); setRating(5); setComment(''); setCategories([]); }}"
);

// Title of modal
ui = ui.replace(/<h2 className="text-lg font-bold text-gray-900 mb-1">Rate Your Experience<\/h2>/, "<h2 className=\\"text-lg font-bold text-gray-900 mb-1\\">{editingFeedbackId ? 'Edit Your Feedback' : 'Rate Your Experience'}</h2>");
ui = ui.replace(/Submit Feedback<\/button>/, "{editingFeedbackId ? 'Update Feedback' : 'Submit Feedback'}</button>");


fs.writeFileSync("frontend/src/pages/ClientDashboard.tsx", ui);

