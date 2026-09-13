package com.joy.catering.controller;
import com.joy.catering.*;import com.joy.catering.dto.Dtos.*;import com.joy.catering.model.User;import com.joy.catering.Mapping;import com.joy.catering.service.AuthService;import jakarta.validation.Valid;import org.springframework.beans.factory.annotation.Value;import org.springframework.http.*;import org.springframework.security.core.Authentication;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/auth") public class AuthController {
 final AuthService service; final com.joy.catering.repo.UserRepository users; @Value("${app.dev-reset-tokens:false}") boolean devReset;
 public AuthController(AuthService s,com.joy.catering.repo.UserRepository u){service=s;users=u;}
 @PostMapping("/register") ResponseEntity<?> register(@Valid @RequestBody Register d){return ResponseEntity.status(201).body(Mapping.user(service.register(d)));}
 @PostMapping("/login") Object login(@Valid @RequestBody Login d){return java.util.Map.of("access_token",service.login(d),"token_type","bearer");}
 @GetMapping("/me") UserOut me(Authentication a){return Mapping.user((User)a.getPrincipal());}
 @PostMapping("/logout") ResponseEntity<Void> logout(Authentication a){User u=(User)a.getPrincipal();u.setTokenVersion(u.getTokenVersion()+1);users.save(u);return ResponseEntity.noContent().build();}
 @PostMapping("/forgot-password") Object forgot(@Valid @RequestBody EmailInput d){String token=service.forgot(d,devReset);return devReset ? java.util.Map.of("message","Local development only: use this token in the reset form.","development_token",token) : java.util.Map.of("message","Reset request accepted.");}
 @PostMapping("/reset-password") ResponseEntity<Void> reset(@Valid @RequestBody ResetPassword d){service.reset(d);return ResponseEntity.noContent().build();}
}
