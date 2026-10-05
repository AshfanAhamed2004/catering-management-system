package com.smartserve.staff;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartserve.staff.dto.*;
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
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application-test.properties")
public class StaffSchedulingApiTests {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper mapper;
    @Autowired private UserRepository userRepository;
    @Autowired private StaffRepository staffRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private ScheduleRepository scheduleRepository;
    @Autowired private RequirementRepository requirementRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AvailabilityRepository availabilityRepository;
    @Autowired private NoticeRepository noticeRepository;
    @Autowired private StaffingRequestRepository staffingRequestRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private ResourceAllocationRepository allocationRepository;
    @Autowired private AuditRepository auditRepository;
    @Autowired private PasswordEncoder encoder;

    private AppUser managerUser;
    private AppUser staffUserAlice;
    private AppUser staffUserBob;
    private StaffMember staffAlice;
    private StaffMember staffBob;
    private StaffMember staffGordon;
    private SchedulingEvent event1;
    private SchedulingEvent event2;
    private Resource chafingDishes;

    @BeforeEach
    void setUp() {
        allocationRepository.deleteAll();
        resourceRepository.deleteAll();
        auditRepository.deleteAll();
        noticeRepository.deleteAll();
        staffingRequestRepository.deleteAll();
        assignmentRepository.deleteAll();
        requirementRepository.deleteAll();
        scheduleRepository.deleteAll();
        availabilityRepository.deleteAll();
        staffRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Manager User
        managerUser = new AppUser();
        managerUser.email = "manager@smartserve.com";
        managerUser.passwordHash = encoder.encode("Manager123!");
        managerUser.role = Role.OPERATIONS_MANAGER;
        managerUser.active = true;
        userRepository.save(managerUser);

        // 2. Staff User Alice (SERVER)
        staffUserAlice = new AppUser();
        staffUserAlice.email = "alice@smartserve.com";
        staffUserAlice.passwordHash = encoder.encode("Alice123!");
        staffUserAlice.role = Role.STAFF;
        staffUserAlice.active = true;
        userRepository.save(staffUserAlice);

        staffAlice = new StaffMember();
        staffAlice.user = staffUserAlice;
        staffAlice.name = "Alice Server";
        staffAlice.category = Category.SERVER;
        staffAlice.contact = "+94770000001";
        staffAlice.active = true;
        staffRepository.save(staffAlice);

        // 3. Staff User Bob (SERVER)
        staffUserBob = new AppUser();
        staffUserBob.email = "bob@smartserve.com";
        staffUserBob.passwordHash = encoder.encode("Bob123!");
        staffUserBob.role = Role.STAFF;
        staffUserBob.active = true;
        userRepository.save(staffUserBob);

        staffBob = new StaffMember();
        staffBob.user = staffUserBob;
        staffBob.name = "Bob Server";
        staffBob.category = Category.SERVER;
        staffBob.contact = "+94770000002";
        staffBob.active = true;
        staffRepository.save(staffBob);

        // 4. Staff Gordon (CHEF)
        var chefUser = new AppUser();
        chefUser.email = "gordon@smartserve.com";
        chefUser.passwordHash = encoder.encode("Gordon123!");
        chefUser.role = Role.STAFF;
        chefUser.active = true;
        userRepository.save(chefUser);

        staffGordon = new StaffMember();
        staffGordon.user = chefUser;
        staffGordon.name = "Gordon Chef";
        staffGordon.category = Category.CHEF;
        staffGordon.contact = "+94770000003";
        staffGordon.active = true;
        staffRepository.save(staffGordon);

        // 5. Events
        event1 = new SchedulingEvent();
        event1.reference = "EVT-TEST-001";
        event1.name = "Gala Dinner";
        event1.eventDate = LocalDate.now().plusDays(10);
        event1.location = "Grand Ballroom";
        eventRepository.save(event1);

        event2 = new SchedulingEvent();
        event2.reference = "EVT-TEST-002";
        event2.name = "Corporate Lunch";
        event2.eventDate = LocalDate.now().plusDays(10);
        event2.location = "Conference Hall B";
        eventRepository.save(event2);

        // 6. Resources
        chafingDishes = new Resource();
        chafingDishes.name = "Chafing Dishes";
        chafingDishes.category = "KITCHEN_EQUIPMENT";
        chafingDishes.quantityAvailable = 5;
        chafingDishes.notes = "Standard stainless steel buffet chafers";
        resourceRepository.save(chafingDishes);
    }

    // 1. Successful schedule creation
    @Test
    void testSuccessfulScheduleCreation() throws Exception {
        var req = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(16, 0),
                "Main hall service"
        );

        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scheduleId").isNumber())
                .andExpect(jsonPath("$.eventId").value(event1.id))
                .andExpect(jsonPath("$.staffId").value(staffAlice.id))
                .andExpect(jsonPath("$.staffName").value("Alice Server"))
                .andExpect(jsonPath("$.assignedRole").value("SERVER"))
                .andExpect(jsonPath("$.area").value("EVENT"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    // 2. Successful schedule retrieval
    @Test
    void testSuccessfulScheduleRetrieval() throws Exception {
        var req = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(16, 0),
                "Notes"
        );

        String response = mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ScheduleDto.ScheduleResponse created = mapper.readValue(response, ScheduleDto.ScheduleResponse.class);

        mvc.perform(get("/api/schedules/" + created.scheduleId())
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduleId").value(created.scheduleId()))
                .andExpect(jsonPath("$.eventReference").value("EVT-TEST-001"))
                .andExpect(jsonPath("$.staffName").value("Alice Server"));
    }

    // 3. Successful schedule update
    @Test
    void testSuccessfulScheduleUpdate() throws Exception {
        var createReq = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(16, 0),
                "Initial note"
        );

        String response = mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ScheduleDto.ScheduleResponse created = mapper.readValue(response, ScheduleDto.ScheduleResponse.class);

        var updateReq = new ScheduleDto.ScheduleUpdateRequest(
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(11, 0),
                LocalTime.of(17, 0),
                "Updated shift notes"
        );

        mvc.perform(put("/api/schedules/" + created.scheduleId())
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startTime").value("11:00:00"))
                .andExpect(jsonPath("$.endTime").value("17:00:00"))
                .andExpect(jsonPath("$.notes").value("Updated shift notes"));
    }

    // 4. Schedule cancellation/deletion
    @Test
    void testScheduleCancellationDeletion() throws Exception {
        var createReq = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(16, 0),
                "Cancel me"
        );

        String response = mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        ScheduleDto.ScheduleResponse created = mapper.readValue(response, ScheduleDto.ScheduleResponse.class);

        mvc.perform(delete("/api/schedules/" + created.scheduleId())
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/schedules/" + created.scheduleId())
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isNotFound());
    }

    // 5. Overlapping shift returns 409
    @Test
    void testOverlappingShiftReturns409() throws Exception {
        // Shift 1: Event 1 from 10:00 to 14:00
        var req1 = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "First shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // Shift 2: Event 2 from 12:00 to 16:00 (overlaps with Shift 1 for Alice!)
        var req2 = new ScheduleDto.ScheduleCreateRequest(
                event2.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event2.eventDate,
                LocalTime.of(12, 0),
                LocalTime.of(16, 0),
                "Overlapping shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("assigned to an overlapping shift")));
    }

    // 6. Explicit unavailable staff returns 409
    @Test
    void testExplicitUnavailableStaffReturns409() throws Exception {
        // Mark Alice unavailable for the day
        var availReq = new AvailabilityDto.AvailabilityCreateRequest(
                staffAlice.id,
                LocalDateTime.of(event1.eventDate, LocalTime.of(8, 0)),
                LocalDateTime.of(event1.eventDate, LocalTime.of(18, 0)),
                false,
                "Medical appointment"
        );
        mvc.perform(post("/api/staff/" + staffAlice.id + "/availability")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(availReq)))
                .andExpect(status().isCreated());

        // Try to schedule Alice
        var schedReq = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(15, 0),
                "Shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(schedReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("unavailable")));
    }

    // 7. Positive availability not covering shift returns 409
    @Test
    void testPositiveAvailabilityNotCoveringShiftReturns409() throws Exception {
        // Alice declares she is ONLY available 10:00 to 12:00
        var availReq = new AvailabilityDto.AvailabilityCreateRequest(
                staffAlice.id,
                LocalDateTime.of(event1.eventDate, LocalTime.of(10, 0)),
                LocalDateTime.of(event1.eventDate, LocalTime.of(12, 0)),
                true,
                "Morning only"
        );
        mvc.perform(post("/api/staff/" + staffAlice.id + "/availability")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(availReq)))
                .andExpect(status().isCreated());

        // Try to schedule Alice for 10:00 to 15:00 (exceeds declared positive availability)
        var schedReq = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(15, 0),
                "Long shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(schedReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("no declared availability covering the entire shift")));
    }

    // 8. Invalid start/end time returns 400
    @Test
    void testInvalidStartEndTimeReturns400() throws Exception {
        // End time before start time
        var req1 = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(16, 0),
                LocalTime.of(10, 0),
                "Invalid backwards shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message", containsString("Start time must be before end time")));

        // Start time equal to end time
        var req2 = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(12, 0),
                LocalTime.of(12, 0),
                "Zero duration shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // 9. Duplicate staff assignment returns 409
    @Test
    void testDuplicateStaffAssignmentReturns409() throws Exception {
        var req = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "Shift"
        );

        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Try to assign Alice again to the SAME event
        var duplicateReq = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(15, 0),
                LocalTime.of(18, 0),
                "Second assignment same event"
        );

        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(duplicateReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("already assigned to this event")));
    }

    // 10. Missing staff returns 404
    @Test
    void testMissingStaffReturns404() throws Exception {
        var req = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                999999L,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "Shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // 11. Missing event returns 404
    @Test
    void testMissingEventReturns404() throws Exception {
        var req = new ScheduleDto.ScheduleCreateRequest(
                999999L,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                LocalDate.now().plusDays(5),
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "Shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // 12. Staff cannot create schedules -> 403
    @Test
    void testStaffCannotCreateSchedulesReturns403() throws Exception {
        var req = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "Shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(staffUserAlice.email).roles("STAFF"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // 13. Staff cannot view another staff member's schedule -> 403
    @Test
    void testStaffCannotViewAnotherStaffScheduleReturns403() throws Exception {
        mvc.perform(get("/api/staff/" + staffBob.id + "/schedules")
                .with(user(staffUserAlice.email).roles("STAFF")))
                .andExpect(status().isForbidden());
    }

    // 14. Staff can view own schedule
    @Test
    void testStaffCanViewOwnSchedule() throws Exception {
        // Manager creates shift for Alice
        var req = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "Alice banquet duty"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Alice views her own schedules
        mvc.perform(get("/api/staff/" + staffAlice.id + "/schedules")
                .with(user(staffUserAlice.email).roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].staffName").value("Alice Server"))
                .andExpect(jsonPath("$[0].eventName").value("Gala Dinner"));
    }

    // 15. Manager can manage schedules & filter
    @Test
    void testManagerCanManageSchedules() throws Exception {
        var reqAlice = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffAlice.id,
                Category.SERVER,
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "Alice shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(reqAlice)))
                .andExpect(status().isCreated());

        var reqBob = new ScheduleDto.ScheduleCreateRequest(
                event2.id,
                staffBob.id,
                Category.SERVER,
                Area.EVENT,
                event2.eventDate,
                LocalTime.of(11, 0),
                LocalTime.of(15, 0),
                "Bob shift"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(reqBob)))
                .andExpect(status().isCreated());

        // Filter by eventId
        mvc.perform(get("/api/schedules?eventId=" + event1.id)
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].staffName").value("Alice Server"));

        // Filter by staffId
        mvc.perform(get("/api/schedules?staffId=" + staffBob.id)
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].staffName").value("Bob Server"));
    }

    // 16. Resource allocation succeeds
    @Test
    void testResourceAllocationSucceeds() throws Exception {
        var req = new ResourceDto.ResourceAllocationRequest(
                chafingDishes.id,
                3,
                "Need 3 buffet chafers for gala dinner"
        );

        mvc.perform(post("/api/events/" + event1.id + "/resources")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.allocationId").isNumber())
                .andExpect(jsonPath("$.resourceId").value(chafingDishes.id))
                .andExpect(jsonPath("$.quantityAllocated").value(3))
                .andExpect(jsonPath("$.eventReference").value("EVT-TEST-001"));
    }

    // 17. Resource over-allocation returns 409
    @Test
    void testResourceOverAllocationReturns409() throws Exception {
        // Event 1 allocates 4 out of 5 available chafing dishes on eventDate
        var req1 = new ResourceDto.ResourceAllocationRequest(
                chafingDishes.id,
                4,
                "Event 1 chafers"
        );
        mvc.perform(post("/api/events/" + event1.id + "/resources")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // Event 2 (on the same eventDate) tries to allocate 2 (only 1 remaining: 4 + 2 > 5)
        var req2 = new ResourceDto.ResourceAllocationRequest(
                chafingDishes.id,
                2,
                "Event 2 chafers"
        );
        mvc.perform(post("/api/events/" + event2.id + "/resources")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("exceeds available quantity")));
    }

    // 18. API errors return JSON
    @Test
    void testApiErrorsReturnJson() throws Exception {
        // Calling non-existent schedule item
        mvc.perform(get("/api/schedules/999999")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    // 19. Staff Availability CRUD test
    @Test
    void testStaffAvailabilityCrud() throws Exception {
        var start = LocalDateTime.of(event1.eventDate, LocalTime.of(8, 0));
        var end = LocalDateTime.of(event1.eventDate, LocalTime.of(16, 0));

        // Create availability
        var createReq = new AvailabilityDto.AvailabilityCreateRequest(
                staffAlice.id,
                start,
                end,
                true,
                "Available morning shift"
        );

        String res = mvc.perform(post("/api/staff/" + staffAlice.id + "/availability")
                .with(user(staffUserAlice.email).roles("STAFF"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.available").value(true))
                .andReturn().getResponse().getContentAsString();

        AvailabilityDto.AvailabilityResponse created = mapper.readValue(res, AvailabilityDto.AvailabilityResponse.class);

        // Update availability
        var updateReq = new AvailabilityDto.AvailabilityUpdateRequest(
                start,
                end.plusHours(2),
                false,
                "No longer available"
        );
        mvc.perform(put("/api/staff/" + staffAlice.id + "/availability/" + created.id())
                .with(user(staffUserAlice.email).roles("STAFF"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));

        // Delete availability
        mvc.perform(delete("/api/staff/" + staffAlice.id + "/availability/" + created.id())
                .with(user(staffUserAlice.email).roles("STAFF")))
                .andExpect(status().isNoContent());

        // Verify list is empty
        mvc.perform(get("/api/staff/" + staffAlice.id + "/availability")
                .with(user(staffUserAlice.email).roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // 20. Role compatibility check (CHEF cannot be assigned as SERVER)
    @Test
    void testRoleCompatibilityCheck() throws Exception {
        var req = new ScheduleDto.ScheduleCreateRequest(
                event1.id,
                staffGordon.id, // Gordon is a CHEF
                Category.SERVER, // Role requested is SERVER
                Area.EVENT,
                event1.eventDate,
                LocalTime.of(10, 0),
                LocalTime.of(14, 0),
                "Chef serving tables"
        );
        mvc.perform(post("/api/schedules")
                .with(user(managerUser.email).roles("OPERATIONS_MANAGER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("does not match requested role")));
    }
}
