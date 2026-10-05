import re
with open('backend/src/main/java/com/joy/catering/service/CustomerManagementService.java', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken constructor
content = content.replace('''        this.invoiceRepository = invoiceRepository;
        public com.joy.catering.dto.Dtos.Customer360Out toggleCustomerActive(Long customerId) {''', 
'''        this.invoiceRepository = invoiceRepository;
    }

    public com.joy.catering.dto.Dtos.Customer360Out toggleCustomerActive(Long customerId) {''')

# Remove the extra } that was added prematurely
content = content.replace('''        return getCustomer360(customerId);
    }
}

    public List<CustomerSummaryOut> searchCustomers(String search) {''', 
'''        return getCustomer360(customerId);
    }

    public List<CustomerSummaryOut> searchCustomers(String search) {''')

with open('backend/src/main/java/com/joy/catering/service/CustomerManagementService.java', 'w', encoding='utf-8') as f:
    f.write(content)
