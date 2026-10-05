const fs = require('fs');
let content = fs.readFileSync('backend/src/main/java/com/joy/catering/service/FeedbackService.java', 'utf8');

const deleteMethod = `
    public void deleteStaffFeedback(Long feedbackId) {
        Feedback feedback = feedbackRepo.findById(feedbackId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Feedback not found"));
        feedbackRepo.delete(feedback);
    }
`;

content = content.replace(/public FeedbackReportOut getFeedbackReport\(\) \{/, deleteMethod + '\n    public FeedbackReportOut getFeedbackReport() {');
fs.writeFileSync('backend/src/main/java/com/joy/catering/service/FeedbackService.java', content);
