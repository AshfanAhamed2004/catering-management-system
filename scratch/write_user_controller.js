
const fs = require("fs");
const java = `package com.joy.catering.controller;
import com.joy.catering.*;
import com.joy.catering.Mapping;
import com.joy.catering.dto.Dtos.*;
import com.joy.catering.model.*;
import com.joy.catering.repo.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

@RestController 
public class UserController {
    final UserRepository users;
    final ProfileRepository profiles;
    final PasswordEncoder passwordEncoder;
    final EntityManager em;
    
    public UserController(UserRepository u, ProfileRepository p, PasswordEncoder e, EntityManager em){
        users=u;
        profiles=p;
        passwordEncoder=e;
        this.em=em;
    }
    
    @GetMapping("/customers/me/profile") 
    @PreAuthorize("hasRole('CUSTOMER')") 
    ProfileOut profile(Authentication a){
        Long uid=((User)a.getPrincipal()).getId(); 
        return Mapping.profile(profiles.findByUserId(uid).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Profile not found")));
    }
    
    @PutMapping("/customers/me/profile") 
    @PreAuthorize("hasRole('CUSTOMER')") 
    ProfileOut update(@Valid @RequestBody ProfileInput d,Authentication a){
        Long uid=((User)a.getPrincipal()).getId(); 
        var p=profiles.findByUserId(uid).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Profile not found")); 
        p.setFullName(d.fullName()); 
        p.setMobileNumber(d.mobileNumber()); 
        p.setAddress(d.address()); 
        return Mapping.profile(profiles.save(p));
    }
    
    @GetMapping("/admin/users") 
    @PreAuthorize("hasRole('GENERAL_MANAGER')") 
    List<UserOut> users(){
        return users.findAllByOrderByIdAsc().stream().map(Mapping::user).toList();
    }
    
    @PutMapping("/admin/users/{id}") 
    @PreAuthorize("hasRole('GENERAL_MANAGER')") 
    UserOut updateUser(@PathVariable Long id,@Valid @RequestBody UserUpdate d,Authentication a){
        User GENERAL_MANAGER=(User)a.getPrincipal();
        if(id.equals(GENERAL_MANAGER.getId()))throw new ApiException(HttpStatus.CONFLICT,"Use another administrator to change your own access");
        User u=users.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"User not found"));
        if((u.getRole()==Role.CUSTOMER)!=(d.role()==Role.CUSTOMER))throw new ApiException(HttpStatus.CONFLICT,"Customer and staff identities cannot be converted; create a separate staff account");
        u.setRole(d.role());
        u.setActive(d.isActive());
        u.setTokenVersion(u.getTokenVersion()+1);
        return Mapping.user(users.save(u));
    }

    @PostMapping("/admin/users") 
    @PreAuthorize("hasRole('GENERAL_MANAGER')") 
    UserOut createStaff(@Valid @RequestBody StaffInput d){
       String email = d.email().trim().toLowerCase();
       if(users.findByEmail(email).isPresent()) throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
       if(d.role() == Role.CUSTOMER) throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot create customer through staff endpoint");
       if(!d.password().matches(".*[A-Za-z].*") || !d.password().matches(".*[0-9].*")) throw new ApiException(HttpStatus.BAD_REQUEST, "Password must contain a letter and a number");
       
       User u = new User();
       u.setEmail(email);
       u.setPasswordHash(passwordEncoder.encode(d.password()));
       u.setRole(d.role());
       
       CustomerProfile p = new CustomerProfile();
       p.setUser(u);
       p.setFullName(d.fullName());
       p.setMobileNumber("0000000000");
       u.setProfile(p);
       
       return Mapping.user(users.save(u));
    }
    
    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('GENERAL_MANAGER')")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication a){
       User gm = (User) a.getPrincipal();
       if(id.equals(gm.getId())) throw new ApiException(HttpStatus.CONFLICT, "Cannot delete your own account");
       User u = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
       
       em.createNativeQuery("DELETE FROM staff_schedules WHERE staff_id = :id").setParameter("id", id).executeUpdate();
       em.createNativeQuery("DELETE FROM waste_records WHERE recorded_by_id = :id").setParameter("id", id).executeUpdate();
       em.createNativeQuery("DELETE FROM password_resets WHERE user_id = :id").setParameter("id", id).executeUpdate();
       em.createNativeQuery("DELETE FROM feedback_categories WHERE feedback_id IN (SELECT id FROM feedbacks WHERE customer_id = :id)").setParameter("id", id).executeUpdate();
       em.createNativeQuery("DELETE FROM feedbacks WHERE customer_id = :id").setParameter("id", id).executeUpdate();
       em.createNativeQuery("DELETE FROM bookings WHERE customer_id = :id").setParameter("id", id).executeUpdate();
       em.createNativeQuery("DELETE FROM customer_profiles WHERE user_id = :id").setParameter("id", id).executeUpdate();
       users.delete(u);
       return ResponseEntity.ok().build();
    }
}
`;
fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", java);

