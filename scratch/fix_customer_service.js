
const fs = require("fs");
let code = fs.readFileSync("backend/src/main/java/com/joy/catering/service/CustomerManagementService.java", "utf8");

const newMethod = `    public com.joy.catering.dto.Dtos.Customer360Out toggleCustomerActive(Long customerId) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        
        if (user.getRole() != Role.CUSTOMER) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User is not a customer");
        }
        
        user.setActive(!user.isActive());
        userRepository.save(user);
        
        return getCustomer360(customerId);
    }
}`;

code = code.replace("}", newMethod);

fs.writeFileSync("backend/src/main/java/com/joy/catering/service/CustomerManagementService.java", code);

