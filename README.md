# Culinary Connect - Centralized CRM & Inquiry Consolidation System
**SE2030: Software Engineering Project**  
**Student Major Function:** Centralized CRM and Inquiry Consolidation System  
**Stakeholder:** Shamini Rathnayake (Customer Service Supervisor)  

---

## Quick Start Guide

### 1. Database Setup (MySQL)
Open MySQL Workbench and execute the script in `schema.sql`:
```sql
SOURCE schema.sql;
```
*Note: If MySQL is not running or credentials differ on an evaluation lab PC, the system automatically runs with an embedded SQLite fallback (`catering_crm.db`) so your demo will never fail.*

### 2. Launch the Web Application
Either:
- Double-click **`run.bat`**, OR
- Open this folder (`crm-system`) in **IntelliJ IDEA** and run `com.catering.crm.Main.java`.

### 3. Open the Dashboard in Browser
Visit: **[http://localhost:8080/](http://localhost:8080/)**

---

## Project Structure
```
crm-system/
├── pom.xml                 # Maven configuration
├── run.bat                 # 1-Click execution script
├── schema.sql              # MySQL schema and demo seed records
├── CRM_DEMO_GUIDE.md       # 2.5-min speaking script & Viva Q&A answers
└── src/main/
    ├── java/com/catering/crm/
    │   ├── Main.java                   # Embedded HTTP server launcher
    │   ├── model/                      # Customer, Inquiry, InquiryStatus
    │   ├── dao/                        # DBConnection (Singleton) & InquiryDAO (DAO Pattern)
    │   ├── service/                    # Business rules & two-layer validation
    │   └── controller/                 # REST Controller & HTTP routing
    └── resources/web/
        ├── index.html                  # Responsive Bootstrap 5 UI
        ├── css/styles.css              # Custom styling & status badges
        └── js/app.js                   # Frontend AJAX & client-side validation
```
