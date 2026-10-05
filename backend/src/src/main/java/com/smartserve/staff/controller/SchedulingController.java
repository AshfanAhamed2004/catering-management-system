package com.smartserve.staff.controller;
import com.smartserve.staff.service.SchedulingService;
import com.smartserve.staff.dto.Forms;
import com.smartserve.staff.entity.*;
import com.smartserve.staff.security.Actor;
import com.smartserve.staff.exception.BusinessException;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.http.*;
import java.time.*;
import java.nio.charset.StandardCharsets;
@Controller public class SchedulingController {
    private final SchedulingService service;private final Actor actor;private final Clock clock;
    public SchedulingController(SchedulingService service,Actor actor,Clock clock){this.service=service;this.actor=actor;this.clock=clock;}
    @ModelAttribute
    public void addCommonAttributes(Model m) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            try {
                var u = actor.current();
                m.addAttribute("currentUser", u);
                m.addAttribute("currentUserRole", u.role.name());
                m.addAttribute("currentUserEmail", u.email);
                var memberOpt = service.findStaffByUserId(u.id);
                if (memberOpt.isPresent()) {
                    m.addAttribute("currentStaffId", memberOpt.get().id);
                    m.addAttribute("currentStaffName", memberOpt.get().name);
                    m.addAttribute("currentStaffCategory", memberOpt.get().category.name());
                } else {
                    m.addAttribute("currentStaffId", null);
                    m.addAttribute("currentStaffName", u.email);
                    m.addAttribute("currentStaffCategory", null);
                }
            } catch (Exception ignored) {}
        }
    }

    @GetMapping("/login") public String login(){return "login";}
    @GetMapping("/") public String home(){return actor.current().role==Role.STAFF?"redirect:/staff/schedules":"redirect:/manager";}
    @GetMapping({"/manager","/manager/schedules","/manager/events"}) public String events(Model m){m.addAttribute("schedules",service.schedules());return "events";}
    @PostMapping("/manager/events") public String event(@Valid @ModelAttribute Forms.Event f){return "redirect:/manager/schedules/"+service.createEvent(f).id;}
    @GetMapping("/manager/schedules/{id}") public String schedule(@PathVariable Long id,Model m){
        m.addAttribute("schedule",service.schedule(id));m.addAttribute("requirements",service.requirements(id));m.addAttribute("staff",service.staff());
        m.addAttribute("notices",service.scheduleNotices(id));m.addAttribute("history",service.history(id));m.addAttribute("roles",Category.values());m.addAttribute("areas",Area.values());
        m.addAttribute("interval",service.intervalSeconds());m.addAttribute("maxResends",service.maxResends());return "schedule";
    }
    @PostMapping({"/manager/schedules/{id}/requirements","/manager/schedules/{id}/requirements/{requirementId}"})
    public String requirement(@PathVariable Long id,@PathVariable(required=false)Long requirementId,@Valid @ModelAttribute Forms.Requirement f){service.requirement(id,requirementId,f);return "redirect:/manager/schedules/"+id;}
    @PostMapping("/manager/requirements/{id}/assign") public String assign(@PathVariable Long id,@Valid @ModelAttribute Forms.Assign f){service.assign(id,f);return "redirect:/manager/requests";}
    @PostMapping("/manager/assignments/{id}/remove") public String unassign(@PathVariable Long id){service.unassign(id);return "redirect:/manager";}
    @PostMapping("/manager/requirements/{id}/request") public String request(@PathVariable Long id,@Valid @ModelAttribute Forms.Reason f){service.requestMore(id,f);return "redirect:/manager/requests";}
    @PostMapping("/manager/requests/{id}/cancel") public String cancelRequest(@PathVariable Long id){service.cancelRequest(id);return "redirect:/manager/requests";}
    @GetMapping("/manager/requests") public String requests(Model m){m.addAttribute("requests",service.requests());m.addAttribute("schedules",service.schedules());return "requests";}
    @PostMapping("/manager/schedules/{id}/confirm") public String confirm(@PathVariable Long id){service.confirm(id);return "redirect:/manager/schedules/"+id;}
    @PostMapping("/manager/schedules/{id}/publish") public String publish(@PathVariable Long id){service.publish(id);return "redirect:/manager/schedules/"+id;}
    @PostMapping("/manager/schedules/{id}/cancel") public String cancel(@PathVariable Long id,@Valid @ModelAttribute Forms.Reason f){service.cancelSchedule(id,f);return "redirect:/manager/schedules/"+id;}
    @PostMapping("/manager/schedules/{id}/deliver") public String deliver(@PathVariable Long id,@RequestParam(defaultValue="false")boolean fail,RedirectAttributes flash){
        int count=service.deliver(id,fail);flash.addFlashAttribute("message",count+(fail?" demo notices marked FAILED.":" demo notices DELIVERED in-app. No external email/SMS sent."));return "redirect:/manager/schedules/"+id;
    }
    @PostMapping("/manager/schedules/{id}/resend") public String resend(@PathVariable Long id,RedirectAttributes flash){
        flash.addFlashAttribute("message",service.resend(id)+" notices resent. Acknowledged notices are skipped.");return "redirect:/manager/schedules/"+id;
    }
    @GetMapping("/manager/staff") public String staff(Model m){m.addAttribute("staff",service.staff());m.addAttribute("roles",Category.values());return "staff-directory";}
    @PostMapping({"/manager/staff","/manager/staff/{id}"}) public String staff(@PathVariable(required=false)Long id,@Valid @ModelAttribute Forms.Staff f){service.saveStaff(id,f);return "redirect:/manager/staff";}
    @GetMapping("/manager/availability") public String availability(Model m){m.addAttribute("staff",service.staff());m.addAttribute("periods",service.availability());return "availability";}
    @PostMapping("/manager/availability") public String availability(@Valid @ModelAttribute Forms.Available f){service.availability(f);return "redirect:/manager/availability";}
    @PostMapping("/manager/availability/{id}/delete") public String deleteAvailability(@PathVariable Long id){service.deleteAvailability(id);return "redirect:/manager/availability";}
    @GetMapping("/manager/history") public String history(Model m){m.addAttribute("records",service.records());m.addAttribute("schedules",service.schedules());return "history";}
    @GetMapping("/manager/history.csv") @ResponseBody public ResponseEntity<String> csv(){return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"staff-schedule-records.csv\"").contentType(new MediaType("text","csv",StandardCharsets.UTF_8)).body(service.csv());}
    @GetMapping("/manager/calendar") public String calendar(@RequestParam(required=false)String month,Model m){
        YearMonth selected;try{selected=month==null?YearMonth.now(clock):YearMonth.parse(month);}catch(java.time.format.DateTimeParseException e){throw BusinessException.invalid("Choose a valid calendar month.");}
        m.addAttribute("month",selected);m.addAttribute("previous",selected.minusMonths(1));m.addAttribute("next",selected.plusMonths(1));
        m.addAttribute("days",java.util.stream.IntStream.rangeClosed(1,selected.lengthOfMonth()).mapToObj(selected::atDay).toList());
        m.addAttribute("schedules",service.schedules());return "calendar";
    }
    @GetMapping("/manager/resources") public String resources(Model m){m.addAttribute("resources",service.listResources());m.addAttribute("events",service.getEvents());return "resources";}
    @GetMapping("/staff/schedules") public String own(Model m){m.addAttribute("notices",service.myNotices());return "my-schedule";}
    @GetMapping("/staff/availability") public String staffAvailability(Model m){return "my-availability";}
    @GetMapping("/staff/notices/{id}") public String notice(@PathVariable Long id,Model m){m.addAttribute("notice",service.ownNotice(id));return "notice";}
    @PostMapping("/staff/notices/{id}/acknowledge") public String acknowledge(@PathVariable Long id){service.acknowledge(id);return "redirect:/staff/notices/"+id;}
}

