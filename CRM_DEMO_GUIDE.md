# SE2030 Software Engineering - Progress Evaluation Demo Guide
## Module: Centralized CRM & Inquiry Consolidation System
**Role:** Customer Service Supervisor (Shamini Rathnayake)  
**Assigned Student:** Anshan S (IT25102396)  
**System:** Culinary Connect - Web-Based Catering Management System  

---

## 1. Evaluation Overview & Rubric Alignment (50 Marks)

| Rubric Criteria | Marks | How Your CRM Module Satisfies It |
| :--- | :---: | :--- |
| **CRUD Operations** | **15** | Full Create, Read, Update, Delete, and Status Advancement pipeline for catering inquiries. |
| **Database Connection** | **10** | Persistent MySQL connection with parameterized `PreparedStatement` queries + automatic SQLite fallback for zero-fail lab demonstration. |
| **UI Design & Usability** | **10** | Responsive Bootstrap 5 interface, metric KPI cards, color-coded status badges, channel tags, modal dialogs, and toast notifications. |
| **Input Validations** | **5** | Client-side HTML5 constraints and server-side Java validations (preventing empty names, invalid emails, short phone numbers, past event dates, and negative budgets). |
| **Teamwork & Delivery** | **5** | Smooth handoff from Module 1 (Profitability) and handover to Module 3 (Head Chef Nuwan's ingredient forecasting). |
| **Oral Communication & Q&A** | **5** | Confident technical explanation of the MVC pattern, DAO pattern, Singleton DB connection, and relational schema. |

---

## 2. Step-by-Step 2.5-Minute Demo Script

Follow this script word-for-word while performing the clicks on screen:

### Step 1: Introduction & Problem Context (30 seconds)
> **Spoken Words:**  
> *"Thank you [Teammate Name]. Good morning/afternoon, sir/madam. I am [Your Name], Student ID [Your ID], and I am responsible for the **Centralized CRM and Inquiry Consolidation System**.*  
> *During our initial requirements elicitation with Customer Service Supervisor Shamini Rathnayake, we identified that customer inquiries arrive in fragments across WhatsApp, phone calls, and emails. Inquiries were frequently misplaced, customer history was duplicated, and response times were slow.*  
> *To solve this, I developed this centralized inquiry board, providing real-time visibility into incoming leads, active negotiations, and confirmed catering contracts."*

### Step 2: Show Dashboard & Search/Filter (30 seconds)
> **Action:** Move your mouse over the KPI cards at the top and the search bar.  
> **Spoken Words:**  
> *"At the top of the interface, the management team has instant access to real-time KPI metrics: Total Inquiries, New Leads, Contacted Clients, Sent Quotations, Confirmed Bookings, and our current Conversion Rate.*  
> *Below, we have a dynamic filtering toolbar. I can filter inquiries instantly by communication channel—such as viewing only WhatsApp inquiries—or filter by pipeline status. I can also perform real-time search by customer name, phone number, or venue location."*

### Step 3: Demonstrating Form Validation & Create Operation (45 seconds)
> **Action:** Click the blue **"+ Log New Inquiry"** button.  
> **Action:** Leave the phone blank or choose a past date, and click **"Save Inquiry"**. The red validation warnings will appear.  
> **Spoken Words:**  
> *"For data integrity, I implemented comprehensive client-side and server-side validation. If a user attempts to submit an inquiry with a past date or an invalid contact number, the system prevents submission and highlights the exact input errors.*  
> *Now, let me enter a valid inquiry:*
> - *Customer: 'Kavinda Perera'*
> - *Phone: '0778899001'*
> - *Email: 'kavinda@gmail.com'*
> - *Event: 'Corporate Dinner'*
> - *Date: [Select a date next month]*
> - *Guests: 150*
> - *Venue: 'Galadari Hotel'*
> - *Budget: LKR 600,000*
> - *Channel: 'WhatsApp'*  
> *When I click Save, the inquiry is validated and persisted immediately into our database."*

### Step 4: Demonstrating Update & Pipeline Advancement (30 seconds)
> **Action:** Click the **Status Badge dropdown** on Kavinda's inquiry and change it from **"New Lead"** to **"Quotation Sent"**, and then **"Confirmed"**.  
> **Spoken Words:**  
> *"As the sales conversation progresses, Shamini can advance the inquiry stage directly from the board—from 'New Lead' to 'Quotation Sent', and once the advance deposit is paid, to 'Confirmed'.*  
> *Notice that our Confirmed counter and Conversion Rate update in real time without refreshing the page."*

### Step 5: Handoff to Next Member (15 seconds)
> **Action:** Click the **"Eye"** icon on the confirmed booking to show the detail view and handoff note.  
> **Spoken Words:**  
> *"Once this event is confirmed, the guest headcount and menu style are seamlessly handed over to Module 3. I will now hand over to Uthsara, who will demonstrate how Head Chef Nuwan uses this confirmed booking data to calculate dynamic ingredient procurement."*

---

## 3. High-Scoring Answers to Likely Viva / Examiner Questions

### Q1: "Which software design patterns did you implement in your module?"
> **Answer:**  
> *"I implemented two primary design patterns:*  
> 1. *The **Singleton Pattern** in `DBConnection.java`. The constructor is made private, and the static `getInstance()` method ensures that only a single database connection manager exists across the application, preventing resource leaks and connection exhaustion.*  
> 2. *The **Data Access Object (DAO) Pattern** using the `InquiryDAO` interface and `InquiryDAOImpl` class. This completely decouples our business logic and controllers from the underlying SQL persistence layer.*  
> *Additionally, the module follows the **MVC (Model-View-Controller)** architectural pattern."*

### Q2: "How did you prevent SQL Injection attacks?"
> **Answer:**  
> *"All SQL statements in `InquiryDAOImpl` use Java's `PreparedStatement` with parameterized placeholders (`?`). User inputs are treated strictly as literals rather than executable SQL fragments, completely neutralizing SQL injection risks."*

### Q3: "How is your database normalized?"
> **Answer:**  
> *"The schema is normalized to 3rd Normal Form (3NF). We separated customer identity into a `customers` table and booking requests into an `inquiries` table linked via a foreign key `customer_id`. This prevents data redundancy when the same corporate client books multiple events over time."*

### Q4: "What happens if client-side validation is bypassed?"
> **Answer:**  
> *"I built a two-layer validation defense. Even if someone disables JavaScript or submits a malicious POST request via Postman or curl, our backend `InquiryService.java` executes strict regex checks, date comparisons against `LocalDate.now()`, and positive number bounds before any DAO method is invoked, throwing a structured `ValidationException`."*

---

## 4. How to Run the Application

### Option A: Via IntelliJ IDEA (Recommended for Viva)
1. Open IntelliJ IDEA.
2. Click **File -> Open** and select the folder `c:\Users\User\Desktop\Project SE\crm-system`.
3. Allow IntelliJ to sync the Maven dependencies (`pom.xml`).
4. Navigate to `src/main/java/com/catering/crm/Main.java`.
5. Click the green **Run** arrow next to `public static void main`.
6. Open your browser to: **`http://localhost:8080/`**.

### Option B: Via Windows Command / Batch
Double-click `run.bat` located inside `crm-system`.
