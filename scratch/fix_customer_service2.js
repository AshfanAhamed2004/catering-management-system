
const fs = require("fs");
let content = fs.readFileSync("backend/src/main/java/com/joy/catering/service/CustomerManagementService.java", "utf8");

content = content.replace("this.invoiceRepository = invoiceRepository;\n        public", "this.invoiceRepository = invoiceRepository;\n    }\n\n    public");
content = content.replace("return getCustomer360(customerId);\n    }\n}\n\n    public List<CustomerSummaryOut> searchCustomers", "return getCustomer360(customerId);\n    }\n\n    public List<CustomerSummaryOut> searchCustomers");

fs.writeFileSync("backend/src/main/java/com/joy/catering/service/CustomerManagementService.java", content);

