
const fs = require("fs");
let code = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/CustomerManagementController.java", "utf8");

// Add the method to the controller
const newEndpoint = `    @PostMapping("/{customerId}/toggle-active")
    public com.joy.catering.dto.Dtos.Customer360Out toggleActive(@PathVariable Long customerId) {
        return service.toggleCustomerActive(customerId);
    }
}`;

code = code.replace("}", newEndpoint);

fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/CustomerManagementController.java", code);

