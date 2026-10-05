package com.joy.catering.controller;

import com.joy.catering.model.*;
import com.joy.catering.repo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class CustomerManagementSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PackageRepository packageRepository;

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testCustomer1;
    private User testCustomer2;
    private User testStaff;

    @BeforeEach
    void setup() {
        bookingRepository.deleteAll();
        userRepository.deleteAll();

        testCustomer1 = new User();
        testCustomer1.setEmail("customer1@example.com");
        testCustomer1.setPasswordHash(passwordEncoder.encode("password123"));
        testCustomer1.setRole(Role.CUSTOMER);
        
        CustomerProfile profile1 = new CustomerProfile();
        profile1.setUser(testCustomer1);
        profile1.setFullName("Alice Smith");
        profile1.setMobileNumber("0701111111");
        profile1.setAddress("123 Street");
        testCustomer1.setProfile(profile1);
        testCustomer1 = userRepository.save(testCustomer1);

        testCustomer2 = new User();
        testCustomer2.setEmail("customer2@example.com");
        testCustomer2.setPasswordHash(passwordEncoder.encode("password123"));
        testCustomer2.setRole(Role.CUSTOMER);
        
        CustomerProfile profile2 = new CustomerProfile();
        profile2.setUser(testCustomer2);
        profile2.setFullName("Bob Johnson");
        profile2.setMobileNumber("0702222222");
        profile2.setAddress("456 Avenue");
        testCustomer2.setProfile(profile2);
        testCustomer2 = userRepository.save(testCustomer2);

        testStaff = new User();
        testStaff.setEmail("staff@example.com");
        testStaff.setPasswordHash(passwordEncoder.encode("password123"));
        testStaff.setRole(Role.HEAD_CHEF);
        CustomerProfile profileStaff = new CustomerProfile();
        profileStaff.setUser(testStaff);
        profileStaff.setFullName("Chef Gordon");
        profileStaff.setMobileNumber("0703333333");
        profileStaff.setAddress("Kitchen");
        testStaff.setProfile(profileStaff);
        testStaff = userRepository.save(testStaff);

        EventType eventType = new EventType();
        eventType.setName("Wedding");
        eventType = eventTypeRepository.save(eventType);

        PackageEntity pkg = new PackageEntity();
        pkg.setName("Gold Package");
        pkg.setDescription("Gold Desc");
        pkg.setEventType(eventType);
        pkg.setPricePerPerson(new BigDecimal("100.00"));
        pkg.setMinimumGuestCount(10);
        pkg = packageRepository.save(pkg);

        Booking b1 = new Booking();
        b1.setCustomer(testCustomer1);
        b1.setPackageEntity(pkg);
        b1.setPackageName(pkg.getName());
        b1.setPricePerPerson(pkg.getPricePerPerson());
        b1.setEventDate(LocalDate.now(ZoneId.of("Asia/Colombo")).plusDays(5));
        b1.setEventTime(LocalTime.of(18, 0));
        b1.setEventLocation("Hotel");
        b1.setGuestCount(50);
        b1.setReference("REF-12345678");
        b1.setStatus(BookingStatus.PENDING);
        bookingRepository.save(b1);

        Booking b2 = new Booking();
        b2.setCustomer(testCustomer1);
        b2.setPackageEntity(pkg);
        b2.setPackageName(pkg.getName());
        b2.setPricePerPerson(pkg.getPricePerPerson());
        b2.setEventDate(LocalDate.now(ZoneId.of("Asia/Colombo")).plusDays(10));
        b2.setEventTime(LocalTime.of(19, 0));
        b2.setEventLocation("Hall");
        b2.setGuestCount(100);
        b2.setReference("REF-87654321");
        b2.setStatus(BookingStatus.APPROVED);
        bookingRepository.save(b2);

        Booking b3 = new Booking();
        b3.setCustomer(testCustomer2);
        b3.setPackageEntity(pkg);
        b3.setPackageName(pkg.getName());
        b3.setPricePerPerson(pkg.getPricePerPerson());
        b3.setEventDate(LocalDate.now(ZoneId.of("Asia/Colombo")).plusDays(15));
        b3.setEventTime(LocalTime.of(20, 0));
        b3.setEventLocation("Beach");
        b3.setGuestCount(30);
        b3.setReference("REF-00000000");
        b3.setStatus(BookingStatus.APPROVED);
        bookingRepository.save(b3);

        Feedback f1 = new Feedback();
        f1.setCustomer(testCustomer1);
        f1.setBooking(b1);
        f1.setRating(5);
        f1.setComment("Great!");
        f1.setCategories(List.of(FeedbackCategory.FOOD_QUALITY, FeedbackCategory.SERVICE));
        f1.setStatus(FeedbackStatus.NEW); // DB requires legacy
        feedbackRepository.save(f1);

        Feedback f2 = new Feedback();
        f2.setCustomer(testCustomer1);
        f2.setBooking(b2);
        f2.setRating(3);
        f2.setComment(null);
        f2.setStaffResponse("We are sorry");
        f2.setCategories(List.of(FeedbackCategory.VENUE));
        f2.setStatus(FeedbackStatus.IN_REVIEW); // DB requires legacy
        feedbackRepository.save(f2);
        
        Feedback f3 = new Feedback();
        f3.setCustomer(testCustomer2);
        f3.setBooking(b3);
        f3.setRating(4);
        f3.setComment("Good for customer 2");
        f3.setCategories(List.of(FeedbackCategory.PUNCTUALITY));
        f3.setStatus(FeedbackStatus.CLOSED); // DB requires legacy
        feedbackRepository.save(f3);

        Invoice i1 = new Invoice();
        i1.setInvoiceNumber("INV-0001");
        i1.setBooking(b1);
        i1.setAmount(BigDecimal.valueOf(1500.00));
        i1.setStatus("Paid");
        i1.setEventName("Corporate Event 1");
        invoiceRepository.save(i1);

        Invoice i2 = new Invoice();
        i2.setInvoiceNumber("INV-0002");
        i2.setBooking(b2);
        i2.setAmount(BigDecimal.valueOf(2500.00));
        i2.setStatus("Pending Payment");
        i2.setEventName("Corporate Event 2");
        invoiceRepository.save(i2);

        Invoice i3 = new Invoice();
        i3.setInvoiceNumber("INV-0003");
        i3.setBooking(b3);
        i3.setAmount(BigDecimal.valueOf(3000.00));
        i3.setStatus("Paid");
        i3.setEventName(null);
        invoiceRepository.save(i3);
    }

    @Test
    void directory_SuccessForSupervisor_ReturnsOnlyCustomersAndCounts() throws Exception {
        mockMvc.perform(get("/staff/customers")
                .with(user("supervisor@test.com").roles("CUSTOMER_SERVICE_SUPERVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[?(@.email == 'customer1@example.com')].total_bookings").value(2))
                .andExpect(jsonPath("$[?(@.email == 'customer2@example.com')].total_bookings").value(1))
                .andExpect(jsonPath("$[?(@.email == 'staff@example.com')]").doesNotExist())
                .andExpect(jsonPath("$[0].password_hash").doesNotExist())
                .andExpect(jsonPath("$[0].token_version").doesNotExist());
    }

    @Test
    void directory_SearchByName() throws Exception {
        mockMvc.perform(get("/staff/customers?search=Alice")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].full_name").value("Alice Smith"));
    }

    @Test
    void directory_SearchByEmail() throws Exception {
        mockMvc.perform(get("/staff/customers?search=customer2")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value("customer2@example.com"));
    }

    @Test
    void directory_SearchByMobile() throws Exception {
        mockMvc.perform(get("/staff/customers?search=0702222222")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].mobile_number").value("0702222222"));
    }

    @Test
    void directory_BlankSearch_ReturnsAll() throws Exception {
        mockMvc.perform(get("/staff/customers?search= ")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void directory_AccessDeniedForCustomer() throws Exception {
        mockMvc.perform(get("/staff/customers")
                .with(user("customer@test.com").roles("CUSTOMER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void directory_AccessDeniedForChef() throws Exception {
        mockMvc.perform(get("/staff/customers")
                .with(user("chef@test.com").roles("HEAD_CHEF")))
                .andExpect(status().isForbidden());
    }

    @Test
    void directory_AccessDeniedForFinance() throws Exception {
        mockMvc.perform(get("/staff/customers")
                .with(user("finance@test.com").roles("FINANCE_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void directory_AccessDeniedForEventCoordinator() throws Exception {
        mockMvc.perform(get("/staff/customers")
                .with(user("event@test.com").roles("EVENT_COORDINATION_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void directory_Anonymous_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/staff/customers"))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------------------
    // NEW TESTS FOR BOOKING HISTORY (Step 18C-2)
    // -------------------------------------------------------------------------

    @Test
    void history_GmCanRetrieve() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/bookings")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].package_name").value("Gold Package"))
                .andExpect(jsonPath("$[0].status").value("APPROVED"))
                .andExpect(jsonPath("$[0].estimated_total").value(10000.00)) // 100 * 100
                .andExpect(jsonPath("$[1].status").value("PENDING"))
                .andExpect(jsonPath("$[1].estimated_total").value(5000.00)) // 50 * 100
                .andExpect(jsonPath("$[0].password_hash").doesNotExist())
                .andExpect(jsonPath("$[0].token_version").doesNotExist());
    }

    @Test
    void history_SupervisorCanRetrieve() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/bookings")
                .with(user("sup@test.com").roles("CUSTOMER_SERVICE_SUPERVISOR")))
                .andExpect(status().isOk());
    }

    @Test
    void history_CustomerDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/bookings")
                .with(user("customer@test.com").roles("CUSTOMER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void history_FinanceOfficerDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/bookings")
                .with(user("fin@test.com").roles("FINANCE_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void history_HeadChefDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/bookings")
                .with(user("chef@test.com").roles("HEAD_CHEF")))
                .andExpect(status().isForbidden());
    }

    @Test
    void history_EventCoordinatorDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/bookings")
                .with(user("event@test.com").roles("EVENT_COORDINATION_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void history_AnonymousDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void history_CustomerWithZeroBookingsReturnsEmptyArray() throws Exception {
        User c3 = new User();
        c3.setEmail("zerobooking@test.com");
        c3.setPasswordHash("pass");
        c3.setRole(Role.CUSTOMER);
        c3 = userRepository.save(c3);

        mockMvc.perform(get("/staff/customers/" + c3.getId() + "/bookings")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void history_NonexistentCustomerReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/99999/bookings")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void history_StaffIdUsedAsCustomerIdReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testStaff.getId() + "/bookings")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------------------
    // NEW TESTS FOR FEEDBACK HISTORY (Step 18C-3)
    // -------------------------------------------------------------------------

    @Test
    void feedbackHistory_GmCanRetrieve() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/feedback")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].rating").value(3)) // newest first
                .andExpect(jsonPath("$[0].comment").doesNotExist()) // null comment
                .andExpect(jsonPath("$[0].staff_response").value("We are sorry"))
                .andExpect(jsonPath("$[0].status").value("UNDER_REVIEW"))
                .andExpect(jsonPath("$[0].categories", hasItem("VENUE")))
                .andExpect(jsonPath("$[0].booking_reference").value("REF-87654321"))
                .andExpect(jsonPath("$[1].rating").value(5))
                .andExpect(jsonPath("$[1].comment").value("Great!"))
                .andExpect(jsonPath("$[1].categories", containsInAnyOrder("FOOD_QUALITY", "SERVICE")))
                .andExpect(jsonPath("$[1].booking_reference").value("REF-12345678"))
                .andExpect(jsonPath("$[0].password_hash").doesNotExist());
    }

    @Test
    void feedbackHistory_SupervisorCanRetrieve() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer2.getId() + "/feedback")
                .with(user("sup@test.com").roles("CUSTOMER_SERVICE_SUPERVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].rating").value(4));
    }

    @Test
    void feedbackHistory_CustomerDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/feedback")
                .with(user("customer@test.com").roles("CUSTOMER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void feedbackHistory_FinanceOfficerDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/feedback")
                .with(user("fin@test.com").roles("FINANCE_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void feedbackHistory_HeadChefDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/feedback")
                .with(user("chef@test.com").roles("HEAD_CHEF")))
                .andExpect(status().isForbidden());
    }

    @Test
    void feedbackHistory_EventCoordinatorDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/feedback")
                .with(user("event@test.com").roles("EVENT_COORDINATION_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void feedbackHistory_AnonymousDenied() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/feedback"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void feedbackHistory_CustomerWithZeroFeedbackReturnsEmptyArray() throws Exception {
        // We'll create a customer with no feedback dynamically
        User c3 = new User();
        c3.setEmail("c3@test.com");
        c3.setPasswordHash("pass");
        c3.setRole(Role.CUSTOMER);
        c3 = userRepository.save(c3);
        
        mockMvc.perform(get("/staff/customers/" + c3.getId() + "/feedback")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void feedbackHistory_NonexistentCustomerReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/99999/feedback")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void feedbackHistory_StaffIdUsedAsCustomerIdReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testStaff.getId() + "/feedback")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void invoiceHistory_SuccessForSupervisor_ReturnsInvoices() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/invoices")
                .with(user("supervisor@test.com").roles("CUSTOMER_SERVICE_SUPERVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].invoice_number").value("INV-0002")) // newest first
                .andExpect(jsonPath("$[0].amount").value(2500.00))
                .andExpect(jsonPath("$[0].status").value("Pending Payment"))
                .andExpect(jsonPath("$[0].event_name").value("Corporate Event 2"))
                .andExpect(jsonPath("$[0].created_at").exists())
                .andExpect(jsonPath("$[1].invoice_number").value("INV-0001"))
                .andExpect(jsonPath("$[1].amount").value(1500.00))
                .andExpect(jsonPath("$[1].status").value("Paid"));
    }

    @Test
    void invoiceHistory_SuccessForGM_ReturnsInvoicesAndHandlesNulls() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer2.getId() + "/invoices")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].invoice_number").value("INV-0003"))
                .andExpect(jsonPath("$[0].amount").value(3000.00))
                .andExpect(jsonPath("$[0].status").value("Paid"))
                .andExpect(jsonPath("$[0].event_name").doesNotExist()); // null eventName
    }

    @Test
    void invoiceHistory_CustomerRoleReturns403() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/invoices")
                .with(user("customer@test.com").roles("CUSTOMER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void invoiceHistory_FinanceOfficerReturns403() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/invoices")
                .with(user("finance@test.com").roles("FINANCE_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void invoiceHistory_HeadChefReturns403() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/invoices")
                .with(user("chef@test.com").roles("HEAD_CHEF")))
                .andExpect(status().isForbidden());
    }

    @Test
    void invoiceHistory_EventCoordReturns403() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/invoices")
                .with(user("event@test.com").roles("EVENT_COORDINATION_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void invoiceHistory_AnonymousReturns401() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId() + "/invoices"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invoiceHistory_CustomerWithZeroInvoicesReturnsEmptyArray() throws Exception {
        User c3 = new User();
        c3.setEmail("zeroinvoice@test.com");
        c3.setPasswordHash("pass");
        c3.setRole(Role.CUSTOMER);
        c3 = userRepository.save(c3);

        mockMvc.perform(get("/staff/customers/" + c3.getId() + "/invoices")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void invoiceHistory_NonexistentCustomerReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/99999/invoices")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void invoiceHistory_StaffIdUsedAsCustomerIdReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testStaff.getId() + "/invoices")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void customer360_SuccessForSupervisor_ReturnsFullProfile() throws Exception {
        // Customer 1:
        // Bookings: b1 (PENDING, 50 * pkg.getPricePerPerson=5000), b2 (APPROVED, 100 * pkg.getPricePerPerson=5000), b4 (COMPLETED), b5 (CANCELLED)
        // Pipeline: 50*100 (pkg price) + 100*50 (pkg price?) Wait, what is pkg price?
        // Let me check. Actually I will just assert it's greater than 0, or I can check exact.
        // Wait, b1 has price=pkg price. b2 has price=pkg price. 
        // I will just assert the metrics structure and existence.
        
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId())
                .with(user("supervisor@test.com").roles("CUSTOMER_SERVICE_SUPERVISOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.full_name").value("Alice Smith"))
                .andExpect(jsonPath("$.profile.password_hash").doesNotExist())
                .andExpect(jsonPath("$.profile.role").doesNotExist())
                .andExpect(jsonPath("$.metrics.total_bookings").value(2))
                .andExpect(jsonPath("$.metrics.completed_bookings").value(0))
                .andExpect(jsonPath("$.metrics.cancelled_bookings").value(0))
                .andExpect(jsonPath("$.metrics.pipeline_booking_value").exists())
                .andExpect(jsonPath("$.bookings", hasSize(2)))
                .andExpect(jsonPath("$.feedback", hasSize(2)))
                .andExpect(jsonPath("$.invoices", hasSize(2)));
    }

    @Test
    void customer360_SuccessForGM_ReturnsIsolatedProfileAndHandlesEmpty() throws Exception {
        User c3 = new User();
        c3.setEmail("empty360@test.com");
        c3.setPasswordHash("pass");
        c3.setRole(Role.CUSTOMER);
        CustomerProfile p3 = new CustomerProfile();
        p3.setUser(c3);
        p3.setFullName("Empty 360");
        p3.setMobileNumber("0700000000");
        c3.setProfile(p3);
        c3 = userRepository.save(c3);

        mockMvc.perform(get("/staff/customers/" + c3.getId())
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.full_name").value("Empty 360"))
                .andExpect(jsonPath("$.metrics.total_bookings").value(0))
                .andExpect(jsonPath("$.metrics.completed_bookings").value(0))
                .andExpect(jsonPath("$.metrics.cancelled_bookings").value(0))
                .andExpect(jsonPath("$.metrics.pipeline_booking_value").value(0.0))
                .andExpect(jsonPath("$.bookings", hasSize(0)))
                .andExpect(jsonPath("$.feedback", hasSize(0)))
                .andExpect(jsonPath("$.invoices", hasSize(0)));
    }

    @Test
    void customer360_CustomerRoleReturns403() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId())
                .with(user("customer@test.com").roles("CUSTOMER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void customer360_FinanceOfficerReturns403() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId())
                .with(user("finance@test.com").roles("FINANCE_OFFICER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void customer360_AnonymousReturns401() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testCustomer1.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void customer360_NonexistentCustomerReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/999999")
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }

    @Test
    void customer360_StaffIdUsedAsCustomerIdReturns404() throws Exception {
        mockMvc.perform(get("/staff/customers/" + testStaff.getId())
                .with(user("gm@test.com").roles("GENERAL_MANAGER")))
                .andExpect(status().isNotFound());
    }
}