package com.smartserve.staff;

import com.smartserve.staff.entity.*;
import com.smartserve.staff.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
public class StaffSchedulingFrontendTests {

    @Autowired private MockMvc mvc;
    @Autowired private UserRepository userRepository;
    @Autowired private StaffRepository staffRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private ScheduleRepository scheduleRepository;
    @Autowired private PasswordEncoder encoder;

    private AppUser managerUser;
    private AppUser staffUser;
    private StaffMember staffMember;
    private SchedulingEvent event;

    @BeforeEach
    void setUp() {
        scheduleRepository.deleteAll();
        eventRepository.deleteAll();
        staffRepository.deleteAll();
        userRepository.deleteAll();

        // Manager User
        managerUser = new AppUser();
        managerUser.email = "manager@smartserve.com";
        managerUser.passwordHash = encoder.encode("Manager123!");
        managerUser.role = Role.OPERATIONS_MANAGER;
        managerUser.active = true;
        userRepository.save(managerUser);

        // Staff User
        staffUser = new AppUser();
        staffUser.email = "server@smartserve.com";
        staffUser.passwordHash = encoder.encode("Server123!");
        staffUser.role = Role.STAFF;
        staffUser.active = true;
        userRepository.save(staffUser);

        staffMember = new StaffMember();
        staffMember.user = staffUser;
        staffMember.name = "Sam Server";
        staffMember.category = Category.SERVER;
        staffMember.contact = "+94771234567";
        staffMember.active = true;
        staffRepository.save(staffMember);

        // Event
        event = new SchedulingEvent();
        event.reference = "EVT-FRONTEND-01";
        event.name = "Faculty Gala Dinner";
        event.location = "Main Ballroom";
        event.eventDate = LocalDate.now().plusDays(10);
        eventRepository.save(event);

        var sched = new StaffSchedule();
        sched.event = event;
        sched.status = "DRAFT";
        scheduleRepository.save(sched);
    }

    @Test
    void testLoginPageAccessiblePublicly() throws Exception {
        mvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Sign In")))
                .andExpect(content().string(containsString("operations@demo.example.com")));
    }

    @Test
    void testStaticAssetsAccessiblePublicly() throws Exception {
        mvc.perform(get("/css/app.css"))
                .andExpect(status().isOk());

        mvc.perform(get("/css/scheduling-ui.css"))
                .andExpect(status().isOk());

        mvc.perform(get("/js/api.js"))
                .andExpect(status().isOk());

        mvc.perform(get("/js/scheduling.js"))
                .andExpect(status().isOk());

        mvc.perform(get("/js/availability.js"))
                .andExpect(status().isOk());

        mvc.perform(get("/js/resources.js"))
                .andExpect(status().isOk());

        mvc.perform(get("/js/my-schedule.js"))
                .andExpect(status().isOk());
    }

    @Test
    void testUnauthenticatedUserDenied() throws Exception {
        mvc.perform(get("/manager"))
                .andExpect(status().isUnauthorized());

        mvc.perform(get("/staff/schedules"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testManagerCanAccessAllManagerViews() throws Exception {
        // 1. Dashboard
        mvc.perform(get("/manager")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Staff Scheduling Dashboard")))
                .andExpect(content().string(containsString("Create New Schedule")));

        // 2. Schedules URL alias
        mvc.perform(get("/manager/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Staff Scheduling Dashboard")));

        // 3. Availability Management
        mvc.perform(get("/manager/availability")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Staff Availability")))
                .andExpect(content().string(containsString("Select Staff Member")));

        // 4. Resource Management
        mvc.perform(get("/manager/resources")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Resource Management")))
                .andExpect(content().string(containsString("Event Resource Allocation")));

        // 5. Staff Directory
        mvc.perform(get("/manager/staff")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Staff Directory")));

        // 6. Calendar
        mvc.perform(get("/manager/calendar")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Shift Calendar")));

        // 7. History
        mvc.perform(get("/manager/history")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Audit History")));
    }

    @Test
    void testStaffCanAccessStaffViews() throws Exception {
        // My Schedule
        mvc.perform(get("/staff/schedules")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("My Work Schedule")));

        // My Availability
        mvc.perform(get("/staff/availability")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("My Working Availability")));
    }

    @Test
    void testStaffCannotAccessManagerViews() throws Exception {
        mvc.perform(get("/manager")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isForbidden());

        mvc.perform(get("/manager/resources")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isForbidden());

        mvc.perform(get("/manager/availability")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isForbidden());
    }

    @Test
    void testManagerCannotAccessStaffViews() throws Exception {
        mvc.perform(get("/staff/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void testEventsApiEndpointForManager() throws Exception {
        mvc.perform(get("/api/events")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].reference", is("EVT-FRONTEND-01")))
                .andExpect(jsonPath("$[0].name", is("Faculty Gala Dinner")));
    }

    @Test
    void testEventsApiEndpointForbiddenForStaff() throws Exception {
        mvc.perform(get("/api/events")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isForbidden());
    }

    @Test
    void testMeApiEndpointForManagerAndStaff() throws Exception {
        // Manager
        mvc.perform(get("/api/me")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("manager@smartserve.com")))
                .andExpect(jsonPath("$.role", is("OPERATIONS_MANAGER")))
                .andExpect(jsonPath("$.staffId", nullValue()));

        // Staff
        mvc.perform(get("/api/me")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("server@smartserve.com")))
                .andExpect(jsonPath("$.role", is("STAFF")))
                .andExpect(jsonPath("$.staffId", is(staffMember.id.intValue())))
                .andExpect(jsonPath("$.staffName", is("Sam Server")))
                .andExpect(jsonPath("$.category", is("SERVER")));
    }

    @Test
    void testStaffMeApiEndpointForStaff() throws Exception {
        mvc.perform(get("/api/staff/me")
                .with(user(staffUser.email).roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(staffMember.id.intValue())))
                .andExpect(jsonPath("$.name", is("Sam Server")))
                .andExpect(jsonPath("$.category", is("SERVER")));
    }
}
