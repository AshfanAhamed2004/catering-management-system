package com.smartserve.staff.config;
import com.smartserve.staff.entity.*;
import com.smartserve.staff.repository.*;
import com.smartserve.staff.service.SchedulingService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
@Component @ConditionalOnProperty(name="app.demo.enabled",havingValue="true")
public class DemoSeed implements ApplicationRunner {
    private final UserRepository users;private final StaffRepository staff;private final EventRepository events;
    private final ScheduleRepository schedules;private final PasswordEncoder encoder;private final Clock clock;private final String password;
    public DemoSeed(UserRepository users,StaffRepository staff,EventRepository events,ScheduleRepository schedules,
        PasswordEncoder encoder,Clock clock,@Value("${app.demo.password}")String password){
        this.users=users;this.staff=staff;this.events=events;this.schedules=schedules;this.encoder=encoder;this.clock=clock;this.password=password;
    }
    @Override @Transactional public void run(ApplicationArguments args){
        if(users.count()==0){
            SchedulingService.validatePassword(password);
            var manager=new AppUser();manager.email="operations@demo.example.com";manager.passwordHash=encoder.encode(password);manager.role=Role.OPERATIONS_MANAGER;users.save(manager);
            Category[] roles={Category.CHEF,Category.CHEF,Category.KITCHEN_ASSISTANT,Category.KITCHEN_ASSISTANT,Category.SUPERVISOR,Category.SERVER,Category.SERVER,Category.SERVER,Category.SERVER,Category.SERVER};
            String[] names={"Chef One","Chef Two","Assistant One","Assistant Two","Supervisor One","Server One","Server Two","Server Three","Server Four","Server Five"};
            String[] emails={"chef1","chef2","assistant1","assistant2","supervisor1","server1","server2","server3","server4","server5"};
            for(int i=0;i<roles.length;i++){
                var u=new AppUser();u.email=emails[i]+"@demo.example.com";u.passwordHash=encoder.encode(password);u.role=Role.STAFF;users.save(u);
                var s=new StaffMember();s.user=u;s.name=names[i];s.category=roles[i];s.contact="Fictional demo staff";staff.save(s);
            }
        }
        if(events.count()==0){
            String[] names={"Wedding Reception","Corporate Dinner"};
            for(int i=0;i<2;i++){
                var e=new SchedulingEvent();e.reference="EVT-DEMO-00"+(i+1);e.name=names[i];e.location="Demo Hall "+(i+1)+", Colombo";e.eventDate=LocalDate.now(clock).plusDays(14+i);events.save(e);
                var s=new StaffSchedule();s.event=e;schedules.save(s);
            }
        }
    }
}

