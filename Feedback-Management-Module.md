# Feedback Management Module

## 1. Module Purpose and Actors
The Feedback Management Module provides a unified system for capturing, reviewing, and analyzing customer feedback for catered events.
- **Customers**: Can submit feedback for their past approved bookings, and view/edit their own feedback.
- **Staff (Customer Relations Officer, Admin)**: Can view all customer feedback, search and filter the queue, reply with staff responses, and transition the status of feedback through a resolution workflow. They can also view aggregated insights.

## 2. Use Cases
- **Customer submits feedback**: After an event has occurred, the customer leaves a rating (1-5), optional categories (e.g., Food Quality), and an optional comment.
- **Customer edits feedback**: If the feedback is still in `NEW` status, the customer can amend it.
- **Staff reviews queue**: Customer Relations scans the feedback queue, instantly spotting critical reviews (1-2 stars) which require immediate attention.
- **Staff resolves feedback**: Staff review a feedback entry, add an internal staff response, and update the status from `NEW` to `IN_REVIEW`, then eventually to `RESOLVED` or `CLOSED`.
- **Management reviews insights**: Admins and Officers view the Feedback Insights report to see average ratings, category breakdowns, and outstanding action items.

## 3. Database Relationships
The `Feedback` entity serves as the core of the module:
- **OneToOne with `Booking`**: Enforces exactly one feedback entry per booking at the database level.
- **ManyToOne with `User`**: Links the feedback back to the customer who submitted it.
- The entity persists a list of `FeedbackCategory` enum values.

## 4. API Endpoints

### Customer API (`/bookings` and `/feedback`)
- `POST /bookings/{bookingId}/feedback`: Submit new feedback for a past booking.
- `GET /feedback`: Retrieve all feedback for the authenticated customer.
- `GET /feedback/{id}`: Retrieve details of a specific feedback entry.
- `PUT /feedback/{id}`: Update an existing feedback entry (if `NEW`).

### Staff API (`/staff/feedback`)
- `GET /staff/feedback`: Search/filter feedback (supports status, rating, category, date ranges, and text search across booking reference or customer details).
- `GET /staff/feedback/report`: Retrieve aggregated insights (total count, average rating, distribution, low ratings).
- `GET /staff/feedback/{id}`: Retrieve comprehensive details for staff review.
- `PUT /staff/feedback/{id}`: Update feedback status and append a staff response.

## 5. Validation and Security Rules
- **Ratings Constraint**: Must be an integer between 1 and 5.
- **Critical Comment Requirement**: A text comment is strictly required if the rating is 1 or 2.
- **Role-Based Access Control (RBAC)**: 
  - Customer endpoints require the `CUSTOMER` role. 
  - Staff endpoints require either `CUSTOMER_RELATIONS_OFFICER` or `ADMIN`.
- **Data Ownership**: Customers can only view and edit feedback that they own (verified via `customerId`).

## 6. Test Checklist
- [x] Submit feedback on a valid, past, approved booking.
- [x] Prevent duplicate feedback submission on the same booking.
- [x] Prevent feedback on future bookings or unapproved bookings.
- [x] Validate that a comment is rejected if rating <= 2 and comment is empty.
- [x] Ensure only `NEW` status feedback can be edited by customers.
- [x] Verify staff can successfully transition feedback statuses and save staff responses.
- [x] Verify report calculations accurately reflect average ratings and category distribution.
- [x] Ensure unauthorized roles (e.g., `SENIOR_CHEF`) cannot access the staff feedback queue.

## 7. Design Patterns
- **Controller-Service-Repository Layering**: The module strictly adheres to Spring's standard layering. 
  - `FeedbackController` handles HTTP/REST routing and authorization.
  - `FeedbackService` handles core business rules (eligibility, state transition validation).
  - `FeedbackRepository` handles Spring Data JPA abstractions and dynamic queries (`Specification`).
- **Data Transfer Object (DTO) Pattern**: Uses Java Records (e.g., `StaffFeedbackOut`, `FeedbackReportOut`) to strictly define API contracts and prevent over-posting or entity leakage.
- **Specification Pattern**: The staff search API utilizes JPA Specifications (`Specification<Feedback>`) for dynamic, criteria-based filtering (status, rating, text search) without writing heavily branched native queries.

## 8. Known Limitations
- **Feedback Eligibility**: Currently relies on checking if the booking status is `APPROVED` and the `eventDate` is in the past. This works for now, but a more robust mechanism would be for the booking owner or system to explicitly set a true `COMPLETED` status upon the successful wrap-up of an event.
