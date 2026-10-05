const fs = require('fs');
let content = fs.readFileSync('backend/src/main/java/com/joy/catering/controller/FeedbackController.java', 'utf8');

const deleteEndpoint = `
    @DeleteMapping("/staff/feedback/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER_SERVICE_SUPERVISOR','GENERAL_MANAGER')")
    public ResponseEntity<Void> deleteStaffFeedback(@PathVariable Long id) {
        feedbackService.deleteStaffFeedback(id);
        return ResponseEntity.noContent().build();
    }
`;

content = content.replace(/public FeedbackReportOut getFeedbackReport\(\) \{\s*return feedbackService\.getFeedbackReport\(\);\s*\}/, 'public FeedbackReportOut getFeedbackReport() { return feedbackService.getFeedbackReport(); }\n' + deleteEndpoint);
fs.writeFileSync('backend/src/main/java/com/joy/catering/controller/FeedbackController.java', content);
