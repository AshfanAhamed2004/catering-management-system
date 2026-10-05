package com.smartserve.staff.service;

import com.smartserve.staff.dto.*;
import com.smartserve.staff.entity.*;
import com.smartserve.staff.exception.BusinessException;
import com.smartserve.staff.repository.*;
import com.smartserve.staff.security.Actor;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.*;
import java.util.*;

@Service @Validated @Transactional
public class SchedulingService {
    public record RequirementView(StaffRequirement requirement, List<StaffAssignment> assignments,
            int assigned, int remaining, String status) {}

    private final UserRepository users;
    private final StaffRepository staff;
    private final AvailabilityRepository availability;
    private final EventRepository events;
    private final ScheduleRepository schedules;
    private final RequirementRepository requirements;
    private final AssignmentRepository assignments;
    private final StaffingRequestRepository requests;
    private final NoticeRepository notices;
    private final AuditRepository audits;
    private final ResourceRepository resourceRepository;
    private final ResourceAllocationRepository allocationRepository;
    private final Actor actor;
    private final EntityManager em;
    private final PasswordEncoder encoder;
    private final Clock clock;
    private final int intervalSeconds, maxResends;

    public SchedulingService(UserRepository users, StaffRepository staff, AvailabilityRepository availability,
            EventRepository events, ScheduleRepository schedules, RequirementRepository requirements,
            AssignmentRepository assignments, StaffingRequestRepository requests, NoticeRepository notices,
            AuditRepository audits, ResourceRepository resourceRepository, ResourceAllocationRepository allocationRepository,
            Actor actor, EntityManager em, PasswordEncoder encoder, Clock clock,
            @Value("${app.resend.interval-seconds}") int intervalSeconds, @Value("${app.resend.max-count}") int maxResends) {
        this.users = users;
        this.staff = staff;
        this.availability = availability;
        this.events = events;
        this.schedules = schedules;
        this.requirements = requirements;
        this.assignments = assignments;
        this.requests = requests;
        this.notices = notices;
        this.audits = audits;
        this.resourceRepository = resourceRepository;
        this.allocationRepository = allocationRepository;
        this.actor = actor;
        this.em = em;
        this.encoder = encoder;
        this.clock = clock;
        this.intervalSeconds = intervalSeconds;
        this.maxResends = maxResends;
        if (intervalSeconds < 0 || maxResends < 0 || maxResends > 100)
            throw new IllegalArgumentException("Invalid resend policy");
    }

    // All mutations share a PostgreSQL row lock, acquired before reading scheduling state.
    private void lock() {
        em.createNativeQuery("SELECT id FROM schedule_lock WHERE id=1 FOR UPDATE").getSingleResult();
    }

    private StaffSchedule getSchedule(Long id) {
        return schedules.findById(id).orElseThrow(BusinessException::missing);
    }

    private StaffRequirement getRequirement(Long id) {
        return requirements.findById(id).orElseThrow(BusinessException::missing);
    }

    private void draft(StaffSchedule s) {
        if (!s.status.equals("DRAFT"))
            throw BusinessException.conflict("Requirement and assignment editing is locked unless the schedule is DRAFT.");
    }

    private void audit(StaffSchedule s, String action, String detail) {
        var a = new ScheduleAudit();
        a.schedule = s;
        a.actor = actor.current();
        a.action = action;
        a.detail = detail;
        a.occurredAt = clock.instant();
        audits.save(a);
    }

    private boolean overlap(LocalDateTime a, LocalDateTime b, LocalDateTime c, LocalDateTime d) {
        return a.isBefore(d) && c.isBefore(b);
    }

    private void shift(LocalDateTime start, LocalDateTime end) {
        if (!start.isAfter(LocalDateTime.now(clock)) || !end.isAfter(start) || end.isAfter(start.plusHours(48)))
            throw BusinessException.invalid("Choose a future shift with end after start and duration at most 48 hours.");
    }

    private void category(Area area, Category role) {
        boolean kitchen = role == Category.CHEF || role == Category.KITCHEN_ASSISTANT;
        if ((area == Area.KITCHEN) != kitchen)
            throw BusinessException.invalid("Choose a role appropriate to KITCHEN or EVENT.");
    }

    private void checkShiftAvailable(StaffMember member, LocalDateTime startsAt, LocalDateTime endsAt) {
        var periods = availability.findByStaffIdOrderByStartsAtAsc(member.id);
        if (periods.stream().anyMatch(p -> !p.available && overlap(startsAt, endsAt, p.startsAt, p.endsAt)))
            throw BusinessException.conflict(member.name + " is unavailable during this shift.");
        var positive = periods.stream().filter(p -> p.available).toList();
        if (!positive.isEmpty() && positive.stream().noneMatch(p -> !startsAt.isBefore(p.startsAt) && !endsAt.isAfter(p.endsAt)))
            throw BusinessException.conflict(member.name + " has no declared availability covering the entire shift.");
    }

    private void checkOverlappingShifts(StaffMember member, LocalDateTime startsAt, LocalDateTime endsAt, Long ignoreAssignmentId) {
        for (var other : assignments.findByStaffId(member.id)) {
            if (Objects.equals(ignoreAssignmentId, other.id) || other.requirement.schedule.status.equals("CANCELLED"))
                continue;
            if (overlap(startsAt, endsAt, other.requirement.startsAt, other.requirement.endsAt))
                throw BusinessException.conflict("Staff conflict: " + member.name + " is assigned to an overlapping shift.");
        }
    }

    private void checkAvailable(StaffMember member, StaffRequirement requirement, Long ignoreAssignment) {
        if (!member.active || member.user == null || !member.user.active)
            throw BusinessException.conflict("Choose active staff with an active staff login.");
        if (member.category != requirement.category)
            throw BusinessException.conflict("Staff category does not match the requirement.");
        checkShiftAvailable(member, requirement.startsAt, requirement.endsAt);
        checkOverlappingShifts(member, requirement.startsAt, requirement.endsAt, ignoreAssignment);
    }

    private int remaining(StaffRequirement r) {
        return Math.max(0, r.requiredCount - assignments.findByRequirementIdOrderByStaffNameAsc(r.id).size());
    }

    private void refreshRequests(StaffRequirement r) {
        int missing = remaining(r);
        for (var request : requests.findByRequirementIdOrderByRequestedAtDesc(r.id)) {
            if (request.status.equals("CANCELLED")) continue;
            request.status = missing == 0 ? "FULFILLED" : missing < request.numberNeeded ? "PARTIALLY_FULFILLED" : "OPEN";
        }
    }

    public StaffSchedule createEvent(@Valid Forms.Event f) {
        actor.manager();
        lock();
        if (f.eventDate().isBefore(LocalDate.now(clock)))
            throw BusinessException.invalid("Choose today or a future event date.");
        if (events.existsByReference(f.reference()))
            throw BusinessException.conflict("Event reference already exists.");
        var e = new SchedulingEvent();
        e.reference = f.reference();
        e.name = f.name().strip();
        e.eventDate = f.eventDate();
        e.location = f.location().strip();
        events.save(e);
        var s = new StaffSchedule();
        s.event = e;
        schedules.saveAndFlush(s);
        audit(s, "EVENT_CREATED", e.reference);
        return s;
    }

    public StaffRequirement requirement(Long scheduleId, Long id, @Valid Forms.Requirement f) {
        actor.manager();
        lock();
        var s = getSchedule(scheduleId);
        draft(s);
        shift(f.startsAt(), f.endsAt());
        category(f.area(), f.category());
        var r = id == null ? new StaffRequirement() : getRequirement(id);
        if (id != null && !r.schedule.id.equals(scheduleId))
            throw BusinessException.missing();
        r.schedule = s;
        r.area = f.area();
        r.category = f.category();
        r.requiredCount = f.requiredCount();
        r.startsAt = f.startsAt();
        r.endsAt = f.endsAt();
        r.notes = f.notes();
        if (id != null)
            for (var a : assignments.findByRequirementIdOrderByStaffNameAsc(id))
                checkAvailable(a.staff, r, a.id);
        requirements.saveAndFlush(r);
        refreshRequests(r);
        audit(s, "REQUIREMENT_SAVED", f.area() + " " + f.category() + " required " + f.requiredCount());
        return r;
    }

    public void assign(Long requirementId, @Valid Forms.Assign f) {
        actor.manager();
        lock();
        var r = getRequirement(requirementId);
        draft(r.schedule);
        shift(r.startsAt, r.endsAt);
        for (Long staffId : new TreeSet<>(f.staffIds())) {
            var member = staff.findById(staffId).orElseThrow(BusinessException::missing);
            if (assignments.existsByRequirementIdAndStaffId(r.id, member.id)) continue;
            checkAvailable(member, r, null);
            var a = new StaffAssignment();
            a.requirement = r;
            a.staff = member;
            assignments.saveAndFlush(a);
        }
        refreshRequests(r);
        audit(r.schedule, "STAFF_ASSIGNED", r.area + " " + r.category + "; remaining " + remaining(r));
    }

    public void unassign(Long assignmentId) {
        actor.manager();
        lock();
        var a = assignments.findById(assignmentId).orElseThrow(BusinessException::missing);
        draft(a.requirement.schedule);
        var r = a.requirement;
        assignments.delete(a);
        assignments.flush();
        refreshRequests(r);
        audit(r.schedule, "STAFF_REMOVED", a.staff.name);
    }

    public StaffingRequest requestMore(Long requirementId, @Valid Forms.Reason f) {
        actor.manager();
        lock();
        var r = getRequirement(requirementId);
        draft(r.schedule);
        int missing = remaining(r);
        if (missing == 0) throw BusinessException.conflict("This requirement is already SUFFICIENT.");
        var open = requests.findByRequirementIdOrderByRequestedAtDesc(r.id).stream()
            .filter(q -> q.status.equals("OPEN") || q.status.equals("PARTIALLY_FULFILLED")).findFirst();
        if (open.isPresent()) return open.get();
        var q = new StaffingRequest();
        q.requirement = r;
        q.numberNeeded = missing;
        q.requestedAt = clock.instant();
        q.notes = f.notes();
        requests.save(q);
        audit(r.schedule, "MORE_STAFF_REQUESTED", missing + " more " + r.area + " " + r.category + " required");
        return q;
    }

    public void cancelRequest(Long id) {
        actor.manager();
        lock();
        var q = requests.findById(id).orElseThrow(BusinessException::missing);
        draft(q.requirement.schedule);
        if (!q.status.equals("OPEN") && !q.status.equals("PARTIALLY_FULFILLED"))
            throw BusinessException.conflict("Only open requests can be cancelled.");
        q.status = "CANCELLED";
        audit(q.requirement.schedule, "STAFFING_REQUEST_CANCELLED", "Request " + id);
    }

    private void sufficient(StaffSchedule s) {
        var list = requirements.findByScheduleIdOrderByAreaAscCategoryAscStartsAtAsc(s.id);
        if (list.isEmpty()) throw BusinessException.conflict("Add at least one mandatory requirement before confirming.");
        for (var r : list) {
            if (remaining(r) > 0)
                throw BusinessException.conflict("INSUFFICIENT: " + remaining(r) + " MORE " + r.area + " " + r.category + " REQUIRED.");
            for (var a : assignments.findByRequirementIdOrderByStaffNameAsc(r.id))
                checkAvailable(a.staff, r, a.id);
        }
    }

    public void confirm(Long id) {
        actor.manager();
        lock();
        var s = getSchedule(id);
        draft(s);
        sufficient(s);
        s.status = "READY";
        audit(s, "SCHEDULE_CONFIRMED", "All mandatory requirements sufficient.");
    }

    public void publish(Long id) {
        actor.manager();
        lock();
        var s = getSchedule(id);
        if (!s.status.equals("READY")) throw BusinessException.conflict("Only a READY schedule can be published.");
        sufficient(s);
        s.status = "PUBLISHED";
        s.publishedAt = clock.instant();
        for (var a : assignments.findByRequirementScheduleId(id)) {
            var n = new ScheduleNotice();
            n.assignment = a;
            n.eventReference = s.event.reference;
            n.eventName = s.event.name;
            n.staffName = a.staff.name;
            n.area = a.requirement.area;
            n.category = a.requirement.category;
            n.startsAt = a.requirement.startsAt;
            n.endsAt = a.requirement.endsAt;
            n.publishedAt = s.publishedAt;
            notices.save(n);
        }
        audit(s, "SCHEDULE_PUBLISHED", "Notices created for " + assignments.findByRequirementScheduleId(id).size() + " assignments; demo delivery pending.");
    }

    public void cancelSchedule(Long id, @Valid Forms.Reason f) {
        actor.manager();
        lock();
        var s = getSchedule(id);
        if (s.status.equals("CANCELLED")) throw BusinessException.conflict("Schedule already cancelled.");
        s.status = "CANCELLED";
        for (var q : requests.findAllByOrderByRequestedAtDesc())
            if (q.requirement.schedule.id.equals(id) && (q.status.equals("OPEN") || q.status.equals("PARTIALLY_FULFILLED")))
                q.status = "CANCELLED";
        audit(s, "SCHEDULE_CANCELLED", f.notes());
    }

    public int deliver(Long scheduleId, boolean fail) {
        actor.manager();
        lock();
        var s = getSchedule(scheduleId);
        if (!s.status.equals("PUBLISHED")) throw BusinessException.conflict("Only published schedules can send notices.");
        int count = 0;
        for (var n : notices.findByAssignmentRequirementScheduleIdOrderByStaffNameAsc(scheduleId)) {
            if (!n.deliveryStatus.equals("PENDING") && !n.deliveryStatus.equals("FAILED")) continue;
            n.sentAt = n.sentAt == null ? clock.instant() : n.sentAt;
            n.lastSentAt = clock.instant();
            n.deliveryStatus = fail ? "FAILED" : "DELIVERED";
            if (!fail) n.deliveredAt = clock.instant();
            count++;
        }
        audit(s, fail ? "DEMO_DELIVERY_FAILED" : "DEMO_DELIVERED", count + " in-app notices; no external SMS/email.");
        return count;
    }

    public int resend(Long scheduleId) {
        actor.manager();
        lock();
        var s = getSchedule(scheduleId);
        if (!s.status.equals("PUBLISHED")) return 0;
        int count = 0;
        for (var n : notices.findByAssignmentRequirementScheduleIdOrderByStaffNameAsc(scheduleId)) {
            if (n.deliveryStatus.equals("DELIVERED") && n.acknowledgmentStatus.equals("PENDING")
                    && n.resendCount < maxResends && n.lastSentAt != null
                    && !n.lastSentAt.plusSeconds(intervalSeconds).isAfter(clock.instant())) {
                n.resendCount++;
                n.lastSentAt = clock.instant();
                count++;
            }
        }
        audit(s, "DEMO_RESEND", count + " eligible notices re-delivered; max " + maxResends + ", interval " + intervalSeconds + " seconds.");
        return count;
    }

    public ScheduleNotice ownNotice(Long id) {
        var u = actor.staff();
        var n = notices.findById(id).orElseThrow(BusinessException::missing);
        if (!n.assignment.staff.user.id.equals(u.id)) throw BusinessException.missing();
        return n;
    }

    public void acknowledge(Long id) {
        actor.staff();
        lock();
        var n = ownNotice(id);
        if (!n.assignment.requirement.schedule.status.equals("PUBLISHED"))
            throw BusinessException.conflict("This schedule is no longer published.");
        if (!n.deliveryStatus.equals("DELIVERED"))
            throw BusinessException.conflict("The notice has not been delivered.");
        if (n.acknowledgmentStatus.equals("ACKNOWLEDGED")) return;
        n.acknowledgmentStatus = "ACKNOWLEDGED";
        n.acknowledgedAt = clock.instant();
        audit(n.assignment.requirement.schedule, "STAFF_ACKNOWLEDGED", "Notice " + n.id + " acknowledged by " + n.staffName);
    }

    public Availability availability(@Valid Forms.Available f) {
        actor.manager();
        lock();
        shift(f.startsAt(), f.endsAt());
        var member = staff.findById(f.staffId()).orElseThrow(BusinessException::missing);
        var period = new Availability();
        period.staff = member;
        period.startsAt = f.startsAt();
        period.endsAt = f.endsAt();
        period.available = f.available();
        period.notes = f.notes();
        availability.saveAndFlush(period);
        for (var a : assignments.findByStaffId(member.id))
            if (!a.requirement.schedule.status.equals("CANCELLED"))
                checkAvailable(member, a.requirement, a.id);
        return period;
    }

    public void deleteAvailability(Long id) {
        actor.manager();
        lock();
        var p = availability.findById(id).orElseThrow(BusinessException::missing);
        Long staffId = p.staff.id;
        availability.delete(p);
        availability.flush();
        for (var a : assignments.findByStaffId(staffId))
            if (!a.requirement.schedule.status.equals("CANCELLED"))
                checkAvailable(a.staff, a.requirement, a.id);
    }

    public static void validatePassword(String password) {
        if (password == null || password.length() < 10 || password.length() > 64
                || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72
                || !password.matches("(?s).*[A-Za-z].*") || !password.matches("(?s).*[0-9].*"))
            throw BusinessException.invalid("Use a password with 10–64 characters, a letter and number, and at most 72 UTF-8 bytes.");
    }

    public StaffMember saveStaff(Long id, @Valid Forms.Staff f) {
        actor.manager();
        lock();
        var member = id == null ? new StaffMember() : staff.findById(id).orElseThrow(BusinessException::missing);
        if (id != null && (!f.active() || f.category() != member.category) && assignments.findByStaffId(id).stream()
                .anyMatch(a -> !a.requirement.schedule.status.equals("CANCELLED") && a.requirement.endsAt.isAfter(LocalDateTime.now(clock))))
            throw BusinessException.conflict("Remove future assignments before deactivating staff or changing category.");
        if (id == null) {
            if (f.email() == null || f.email().isBlank()) throw BusinessException.invalid("A staff login email is required.");
            validatePassword(f.password());
            String email = f.email().strip().toLowerCase(Locale.ROOT);
            if (users.findByEmail(email).isPresent()) throw BusinessException.conflict("Email already exists.");
            var u = new AppUser();
            u.email = email;
            u.passwordHash = encoder.encode(f.password());
            u.role = Role.STAFF;
            u.active = f.active();
            users.save(u);
            member.user = u;
        } else {
            member.user.active = f.active();
        }
        member.name = f.name().strip();
        member.category = f.category();
        member.contact = f.contact();
        member.active = f.active();
        return staff.save(member);
    }

    @Transactional(readOnly = true) public List<StaffSchedule> schedules() { actor.manager(); return schedules.findAllByOrderByCreatedAtDesc(); }
    @Transactional(readOnly = true) public StaffSchedule schedule(Long id) { actor.manager(); return getSchedule(id); }
    @Transactional(readOnly = true) public List<RequirementView> requirements(Long id) {
        actor.manager();
        getSchedule(id);
        return requirements.findByScheduleIdOrderByAreaAscCategoryAscStartsAtAsc(id).stream().map(r -> {
            var list = assignments.findByRequirementIdOrderByStaffNameAsc(r.id);
            int remaining = Math.max(0, r.requiredCount - list.size());
            return new RequirementView(r, list, list.size(), remaining, remaining == 0 ? "SUFFICIENT" : "INSUFFICIENT");
        }).toList();
    }
    @Transactional(readOnly = true) public List<StaffMember> staff() { actor.manager(); return staff.findAllByOrderByNameAsc(); }
    @Transactional(readOnly = true) public List<Availability> availability() { actor.manager(); return availability.findAll(); }
    @Transactional(readOnly = true) public List<StaffingRequest> requests() { actor.manager(); return requests.findAllByOrderByRequestedAtDesc(); }
    @Transactional(readOnly = true) public List<ScheduleNotice> records() { actor.manager(); return notices.findAllByOrderByPublishedAtDescIdAsc(); }
    @Transactional(readOnly = true) public List<ScheduleNotice> scheduleNotices(Long id) { actor.manager(); return notices.findByAssignmentRequirementScheduleIdOrderByStaffNameAsc(id); }
    @Transactional(readOnly = true) public List<ScheduleAudit> history(Long id) { actor.manager(); return audits.findByScheduleIdOrderByOccurredAtAscIdAsc(id); }
    @Transactional(readOnly = true) public List<ScheduleNotice> myNotices() { return notices.findByAssignmentStaffUserIdOrderByStartsAtAsc(actor.staff().id); }
    public int intervalSeconds() { return intervalSeconds; }
    public int maxResends() { return maxResends; }

    public String csv() {
        var rows = new ArrayList<String>();
        rows.add("Event Reference,Event,Staff,Area,Role,Shift Start,Shift End,Published At,Delivery Status,Acknowledged,Acknowledged At");
        for (var n : records())
            rows.add(java.util.stream.Stream.of(n.eventReference, n.eventName, n.staffName, n.area.name(), n.category.name(),
                n.startsAt.toString(), n.endsAt.toString(), n.publishedAt.toString(), n.deliveryStatus, n.acknowledgmentStatus,
                n.acknowledgedAt == null ? "" : n.acknowledgedAt.toString()).map(SchedulingService::csvCell).collect(java.util.stream.Collectors.joining(",")));
        return "\ufeff" + String.join("\r\n", rows) + "\r\n";
    }

    public static String csvCell(String value) {
        if (!value.isEmpty() && "=+-@\t\r\n".indexOf(value.stripLeading().isEmpty() ? value.charAt(0) : value.stripLeading().charAt(0)) >= 0)
            value = "'" + value;
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    // =========================================================================
    // REST API / Staff Scheduling Module Extended Methods
    // =========================================================================

    private void checkStaffAccessOrManager(Long staffId) {
        var user = actor.current();
        if (user.role == Role.STAFF) {
            var me = staff.findByUserId(user.id)
                .orElseThrow(() -> new AccessDeniedException("Staff profile not found for authenticated account."));
            if (!me.id.equals(staffId)) {
                throw new AccessDeniedException("Staff users are not authorized to access another staff member's records.");
            }
        } else {
            actor.manager();
        }
    }

    private ScheduleDto.ScheduleResponse toScheduleResponse(StaffAssignment a) {
        return new ScheduleDto.ScheduleResponse(
            a.id,
            a.requirement.schedule.event.id,
            a.requirement.schedule.event.reference,
            a.requirement.schedule.event.name,
            a.staff.id,
            a.staff.name,
            a.requirement.category,
            a.requirement.area,
            a.requirement.startsAt.toLocalDate(),
            a.requirement.startsAt.toLocalTime(),
            a.requirement.endsAt.toLocalTime(),
            a.requirement.schedule.status,
            a.requirement.notes,
            a.createdAt,
            a.updatedAt
        );
    }

    private AvailabilityDto.AvailabilityResponse toAvailabilityResponse(Availability p) {
        return new AvailabilityDto.AvailabilityResponse(
            p.id,
            p.staff.id,
            p.staff.name,
            p.startsAt,
            p.endsAt,
            p.available,
            p.notes,
            p.createdAt,
            p.updatedAt
        );
    }

    private StaffDto.StaffResponse toStaffResponse(StaffMember m) {
        return new StaffDto.StaffResponse(
            m.id,
            m.name,
            m.category,
            m.contact,
            m.active,
            m.user != null ? m.user.email : null,
            m.user != null ? m.user.id : null
        );
    }

    private ResourceDto.ResourceResponse toResourceResponse(Resource r) {
        return new ResourceDto.ResourceResponse(
            r.id,
            r.name,
            r.category,
            r.quantityAvailable,
            r.notes,
            r.createdAt,
            r.updatedAt
        );
    }

    private ResourceDto.ResourceAllocationResponse toAllocationResponse(EventResourceAllocation al) {
        return new ResourceDto.ResourceAllocationResponse(
            al.id,
            al.event.id,
            al.event.reference,
            al.event.name,
            al.resource.id,
            al.resource.name,
            al.quantityAllocated,
            al.notes,
            al.createdAt,
            al.updatedAt
        );
    }

    // --- Staff Endpoints ---

    @Transactional(readOnly = true)
    public List<StaffDto.StaffResponse> getStaffMembers() {
        actor.manager();
        return staff.findAllByOrderByNameAsc().stream().map(this::toStaffResponse).toList();
    }

    @Transactional(readOnly = true)
    public StaffDto.StaffResponse getStaffMember(Long id) {
        checkStaffAccessOrManager(id);
        var member = staff.findById(id).orElseThrow(BusinessException::missing);
        return toStaffResponse(member);
    }

    // --- Availability Endpoints ---

    @Transactional(readOnly = true)
    public List<AvailabilityDto.AvailabilityResponse> getStaffAvailabilityList(Long staffId) {
        checkStaffAccessOrManager(staffId);
        staff.findById(staffId).orElseThrow(BusinessException::missing);
        return availability.findByStaffIdOrderByStartsAtAsc(staffId).stream()
            .map(this::toAvailabilityResponse)
            .toList();
    }

    public AvailabilityDto.AvailabilityResponse addAvailability(Long staffId, @Valid AvailabilityDto.AvailabilityCreateRequest req) {
        checkStaffAccessOrManager(staffId);
        lock();
        if (!req.endsAt().isAfter(req.startsAt()))
            throw BusinessException.invalid("Start time must be before end time.");
        long minutes = Duration.between(req.startsAt(), req.endsAt()).toMinutes();
        if (minutes < 1 || minutes > 48 * 60)
            throw BusinessException.invalid("Availability interval must be between 1 minute and 48 hours.");

        var member = staff.findById(staffId).orElseThrow(BusinessException::missing);
        var period = new Availability();
        period.staff = member;
        period.startsAt = req.startsAt();
        period.endsAt = req.endsAt();
        period.available = req.available();
        period.notes = req.notes();
        availability.saveAndFlush(period);

        // Check if any existing active assignments conflict with this new availability declaration
        for (var a : assignments.findByStaffId(member.id)) {
            if (!a.requirement.schedule.status.equals("CANCELLED")) {
                checkAvailable(member, a.requirement, a.id);
            }
        }
        return toAvailabilityResponse(period);
    }

    public AvailabilityDto.AvailabilityResponse updateAvailabilityRecord(Long staffId, Long availabilityId, @Valid AvailabilityDto.AvailabilityUpdateRequest req) {
        checkStaffAccessOrManager(staffId);
        lock();
        var period = availability.findById(availabilityId).orElseThrow(BusinessException::missing);
        if (!period.staff.id.equals(staffId)) throw BusinessException.missing();

        if (req.startsAt() != null) period.startsAt = req.startsAt();
        if (req.endsAt() != null) period.endsAt = req.endsAt();
        if (req.available() != null) period.available = req.available();
        if (req.notes() != null) period.notes = req.notes();

        if (!period.endsAt.isAfter(period.startsAt))
            throw BusinessException.invalid("Start time must be before end time.");
        long minutes = Duration.between(period.startsAt, period.endsAt).toMinutes();
        if (minutes < 1 || minutes > 48 * 60)
            throw BusinessException.invalid("Availability interval must be between 1 minute and 48 hours.");

        availability.saveAndFlush(period);
        for (var a : assignments.findByStaffId(period.staff.id)) {
            if (!a.requirement.schedule.status.equals("CANCELLED")) {
                checkAvailable(period.staff, a.requirement, a.id);
            }
        }
        return toAvailabilityResponse(period);
    }

    public void deleteAvailabilityRecord(Long staffId, Long availabilityId) {
        checkStaffAccessOrManager(staffId);
        lock();
        var period = availability.findById(availabilityId).orElseThrow(BusinessException::missing);
        if (!period.staff.id.equals(staffId)) throw BusinessException.missing();
        availability.delete(period);
        availability.flush();
        for (var a : assignments.findByStaffId(staffId)) {
            if (!a.requirement.schedule.status.equals("CANCELLED")) {
                checkAvailable(a.staff, a.requirement, a.id);
            }
        }
    }

    // --- Schedule Item Endpoints ---

    @Transactional(readOnly = true)
    public List<ScheduleDto.ScheduleResponse> querySchedules(Long eventId, Long staffId, LocalDate workDate, YearMonth month) {
        var user = actor.current();
        if (user.role == Role.STAFF) {
            var me = staff.findByUserId(user.id).orElseThrow(BusinessException::missing);
            if (staffId != null && !staffId.equals(me.id)) {
                throw new AccessDeniedException("Staff users can only view their own schedules.");
            }
            staffId = me.id;
        } else {
            actor.manager();
        }

        List<StaffAssignment> list;
        if (staffId != null) {
            list = assignments.findByStaffId(staffId);
        } else if (eventId != null) {
            var schedOpt = schedules.findAll().stream().filter(s -> s.event.id.equals(eventId)).findFirst();
            if (schedOpt.isEmpty()) return List.of();
            list = assignments.findByRequirementScheduleId(schedOpt.get().id);
        } else {
            list = assignments.findAll();
        }

        if (eventId != null) {
            final Long targetEventId = eventId;
            list = list.stream().filter(a -> a.requirement.schedule.event.id.equals(targetEventId)).toList();
        }
        if (workDate != null) {
            list = list.stream().filter(a -> a.requirement.startsAt.toLocalDate().equals(workDate)).toList();
        }
        if (month != null) {
            list = list.stream().filter(a -> YearMonth.from(a.requirement.startsAt).equals(month)).toList();
        }

        return list.stream()
            .sorted(Comparator.comparing((StaffAssignment a) -> a.requirement.startsAt)
                .thenComparing(a -> a.staff.name))
            .map(this::toScheduleResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ScheduleDto.ScheduleResponse getScheduleItem(Long id) {
        var a = assignments.findById(id).orElseThrow(BusinessException::missing);
        var user = actor.current();
        if (user.role == Role.STAFF) {
            if (a.staff.user == null || !a.staff.user.id.equals(user.id)) {
                throw new AccessDeniedException("Staff users can only view their own schedule details.");
            }
        } else {
            actor.manager();
        }
        return toScheduleResponse(a);
    }

    public ScheduleDto.ScheduleResponse createScheduleItem(@Valid ScheduleDto.ScheduleCreateRequest req) {
        actor.manager();
        lock();

        // 1. Shift times validation
        if (req.workDate() == null || req.startTime() == null || req.endTime() == null)
            throw BusinessException.invalid("Work date, start time, and end time are required.");
        if (!req.endTime().isAfter(req.startTime()))
            throw BusinessException.invalid("Start time must be before end time.");

        LocalDateTime startsAt = LocalDateTime.of(req.workDate(), req.startTime());
        LocalDateTime endsAt = LocalDateTime.of(req.workDate(), req.endTime());
        long minutes = Duration.between(startsAt, endsAt).toMinutes();
        if (minutes < 1 || minutes > 48 * 60)
            throw BusinessException.invalid("Shift duration must be between 1 minute and 48 hours.");

        // 2. Event validation
        var event = events.findById(req.eventId()).orElseThrow(BusinessException::missing);
        var schedule = schedules.findAll().stream()
            .filter(s -> s.event.id.equals(event.id))
            .findFirst()
            .orElseGet(() -> {
                var s = new StaffSchedule();
                s.event = event;
                return schedules.saveAndFlush(s);
            });

        // 3. Schedule state validation
        if (!"DRAFT".equals(schedule.status))
            throw BusinessException.conflict("Schedule is not in editable DRAFT status.");

        // 4. Staff existence and active status
        var member = staff.findById(req.staffId()).orElseThrow(BusinessException::missing);
        if (!member.active || member.user == null || !member.user.active)
            throw BusinessException.conflict("Staff member is not active.");

        // 5. Role compatibility
        if (member.category != req.role())
            throw BusinessException.conflict("Staff category " + member.category + " does not match requested role " + req.role());

        Area area = req.area();
        if (area == null) {
            area = (req.role() == Category.CHEF || req.role() == Category.KITCHEN_ASSISTANT) ? Area.KITCHEN : Area.EVENT;
        }
        category(area, req.role());

        // 6. Duplicate assignment check for same event
        boolean alreadyAssigned = assignments.findByRequirementScheduleId(schedule.id).stream()
            .anyMatch(a -> a.staff.id.equals(member.id));
        if (alreadyAssigned)
            throw BusinessException.conflict("Staff member " + member.name + " is already assigned to this event.");

        // 7. Staff availability check
        checkShiftAvailable(member, startsAt, endsAt);

        // 8. Overlapping shifts check across all events
        checkOverlappingShifts(member, startsAt, endsAt, null);

        // 9. Save requirement and assignment
        var r = new StaffRequirement();
        r.schedule = schedule;
        r.area = area;
        r.category = req.role();
        r.requiredCount = 1;
        r.startsAt = startsAt;
        r.endsAt = endsAt;
        r.notes = req.notes();
        requirements.saveAndFlush(r);

        var a = new StaffAssignment();
        a.requirement = r;
        a.staff = member;
        assignments.saveAndFlush(a);

        refreshRequests(r);
        audit(schedule, "STAFF_SCHEDULED", "Assigned " + member.name + " as " + req.role() + " for " + event.reference);
        return toScheduleResponse(a);
    }

    public ScheduleDto.ScheduleResponse updateScheduleItem(Long assignmentId, @Valid ScheduleDto.ScheduleUpdateRequest req) {
        actor.manager();
        lock();
        var a = assignments.findById(assignmentId).orElseThrow(BusinessException::missing);
        draft(a.requirement.schedule);

        Category role = req.role() != null ? req.role() : a.requirement.category;
        LocalDate workDate = req.workDate() != null ? req.workDate() : a.requirement.startsAt.toLocalDate();
        LocalTime startTime = req.startTime() != null ? req.startTime() : a.requirement.startsAt.toLocalTime();
        LocalTime endTime = req.endTime() != null ? req.endTime() : a.requirement.endsAt.toLocalTime();

        if (!endTime.isAfter(startTime))
            throw BusinessException.invalid("Start time must be before end time.");

        LocalDateTime startsAt = LocalDateTime.of(workDate, startTime);
        LocalDateTime endsAt = LocalDateTime.of(workDate, endTime);
        long minutes = Duration.between(startsAt, endsAt).toMinutes();
        if (minutes < 1 || minutes > 48 * 60)
            throw BusinessException.invalid("Shift duration must be between 1 minute and 48 hours.");

        if (a.staff.category != role)
            throw BusinessException.conflict("Staff category " + a.staff.category + " does not match requested role " + role);

        Area area = req.area() != null ? req.area() : a.requirement.area;
        if (req.role() != null && req.area() == null) {
            area = (role == Category.CHEF || role == Category.KITCHEN_ASSISTANT) ? Area.KITCHEN : Area.EVENT;
        }
        category(area, role);

        checkShiftAvailable(a.staff, startsAt, endsAt);
        checkOverlappingShifts(a.staff, startsAt, endsAt, a.id);

        a.requirement.category = role;
        a.requirement.area = area;
        a.requirement.startsAt = startsAt;
        a.requirement.endsAt = endsAt;
        if (req.notes() != null) a.requirement.notes = req.notes();
        requirements.saveAndFlush(a.requirement);

        audit(a.requirement.schedule, "SCHEDULE_UPDATED", "Updated shift for " + a.staff.name + " (" + startsAt + " - " + endsAt + ")");
        return toScheduleResponse(a);
    }

    public void deleteScheduleItem(Long assignmentId) {
        actor.manager();
        lock();
        var a = assignments.findById(assignmentId).orElseThrow(BusinessException::missing);
        draft(a.requirement.schedule);

        var r = a.requirement;
        assignments.delete(a);
        assignments.flush();

        if (assignments.findByRequirementIdOrderByStaffNameAsc(r.id).isEmpty()) {
            requirements.delete(r);
            requirements.flush();
        } else {
            refreshRequests(r);
        }
        audit(r.schedule, "STAFF_UNSCHEDULED", "Removed " + a.staff.name);
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto.ScheduleResponse> getEventSchedules(Long eventId) {
        events.findById(eventId).orElseThrow(BusinessException::missing);
        return querySchedules(eventId, null, null, null);
    }

    @Transactional(readOnly = true)
    public List<ScheduleDto.ScheduleResponse> getStaffSchedules(Long staffId) {
        staff.findById(staffId).orElseThrow(BusinessException::missing);
        return querySchedules(null, staffId, null, null);
    }

    // --- Resource Endpoints ---

    @Transactional(readOnly = true)
    public List<ResourceDto.ResourceResponse> listResources() {
        actor.manager();
        return resourceRepository.findAllByOrderByNameAsc().stream()
            .map(this::toResourceResponse)
            .toList();
    }

    public ResourceDto.ResourceResponse createResource(@Valid ResourceDto.ResourceCreateRequest req) {
        actor.manager();
        lock();
        String name = req.name().strip();
        if (resourceRepository.existsByNameIgnoreCase(name))
            throw BusinessException.conflict("Resource with name '" + name + "' already exists.");

        var r = new Resource();
        r.name = name;
        r.category = req.category().strip();
        r.quantityAvailable = req.quantityAvailable();
        r.notes = req.notes();
        resourceRepository.saveAndFlush(r);
        return toResourceResponse(r);
    }

    @Transactional(readOnly = true)
    public List<ResourceDto.ResourceAllocationResponse> listEventResources(Long eventId) {
        actor.manager();
        events.findById(eventId).orElseThrow(BusinessException::missing);
        return allocationRepository.findByEventId(eventId).stream()
            .map(this::toAllocationResponse)
            .toList();
    }

    public ResourceDto.ResourceAllocationResponse allocateResource(Long eventId, @Valid ResourceDto.ResourceAllocationRequest req) {
        actor.manager();
        lock();
        var event = events.findById(eventId).orElseThrow(BusinessException::missing);
        var resource = resourceRepository.findById(req.resourceId()).orElseThrow(BusinessException::missing);

        // Over-allocation conflict detection for overlapping date
        int alreadyAllocatedOnDate = allocationRepository.findByResourceId(resource.id).stream()
            .filter(al -> !al.event.id.equals(eventId) && al.event.eventDate.equals(event.eventDate))
            .mapToInt(al -> al.quantityAllocated)
            .sum();

        int availableRemaining = resource.quantityAvailable - alreadyAllocatedOnDate;
        if (req.quantityAllocated() > availableRemaining) {
            throw BusinessException.conflict("Requested quantity (" + req.quantityAllocated() +
                ") exceeds available quantity (" + Math.max(0, availableRemaining) +
                ") for '" + resource.name + "' on " + event.eventDate + ".");
        }

        var allocation = allocationRepository.findByEventIdAndResourceId(eventId, resource.id)
            .orElseGet(() -> {
                var al = new EventResourceAllocation();
                al.event = event;
                al.resource = resource;
                return al;
            });
        allocation.quantityAllocated = req.quantityAllocated();
        allocation.notes = req.notes();
        allocationRepository.saveAndFlush(allocation);
        return toAllocationResponse(allocation);
    }

    public void removeResourceAllocation(Long eventId, Long allocationId) {
        actor.manager();
        lock();
        events.findById(eventId).orElseThrow(BusinessException::missing);
        var allocation = allocationRepository.findById(allocationId).orElseThrow(BusinessException::missing);
        if (!allocation.event.id.equals(eventId)) throw BusinessException.missing();
        allocationRepository.delete(allocation);
        allocationRepository.flush();
    }

    // --- Events & Profile Endpoints for Frontend ---

    @Transactional(readOnly = true)
    public List<ScheduleDto.EventResponse> getEvents() {
        actor.manager();
        return events.findAll().stream()
            .sorted(Comparator.comparing(e -> e.eventDate))
            .map(e -> new ScheduleDto.EventResponse(e.id, e.reference, e.name, e.eventDate, e.location))
            .toList();
    }

    @Transactional(readOnly = true)
    public StaffDto.StaffResponse getCurrentStaffProfile() {
        var user = actor.current();
        var member = staff.findByUserId(user.id).orElseThrow(BusinessException::missing);
        return toStaffResponse(member);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCurrentUserSession() {
        var user = actor.current();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("userId", user.id);
        map.put("email", user.email);
        map.put("role", user.role.name());
        var memberOpt = staff.findByUserId(user.id);
        if (memberOpt.isPresent()) {
            var m = memberOpt.get();
            map.put("staffId", m.id);
            map.put("staffName", m.name);
            map.put("category", m.category != null ? m.category.name() : null);
        } else {
            map.put("staffId", null);
            map.put("staffName", user.email);
            map.put("category", null);
        }
        return map;
    }

    @Transactional(readOnly = true)
    public Optional<StaffMember> findStaffByUserId(Long userId) {
        return staff.findByUserId(userId);
    }
}
