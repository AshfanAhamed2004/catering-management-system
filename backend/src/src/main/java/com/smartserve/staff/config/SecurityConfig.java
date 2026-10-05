package com.smartserve.staff.config;

import com.smartserve.staff.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.time.Clock;
import java.time.ZoneId;
import java.util.Locale;

@Configuration
public class SecurityConfig {
    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("Asia/Colombo"));
    }

    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    UserDetailsService details(UserRepository users) {
        return email -> {
            var u = users.findByEmail(email.strip().toLowerCase(Locale.ROOT))
                    .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
            return User.withUsername(u.email)
                    .password(u.passwordHash)
                    .roles(u.role.name())
                    .disabled(!u.active)
                    .build();
        };
    }

    @Bean
    SecurityFilterChain security(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
            .httpBasic(Customizer.withDefaults())
            .authorizeHttpRequests(r -> r
                .requestMatchers("/login", "/css/**", "/js/**", "/error").permitAll()
                .requestMatchers("/manager/**").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers("/staff/**").hasRole("STAFF")
                // API Security Rules
                .requestMatchers("/api/resources/**").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers("/api/events/{eventId}/resources/**").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/events").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/schedules/**").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/schedules/**").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/schedules/**").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/events/{eventId}/schedules").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/staff").hasAnyRole("OPERATIONS_MANAGER", "ADMIN")
                .requestMatchers("/api/staff/{id}/availability/**").authenticated()
                .requestMatchers("/api/staff/{id}/schedules").authenticated()
                .requestMatchers("/api/staff/{id}").authenticated()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated())
            .formLogin(f -> f.loginPage("/login").usernameParameter("email").defaultSuccessUrl("/", true))
            .logout(l -> l.logoutSuccessUrl("/login?logout").invalidateHttpSession(true).deleteCookies("STAFF_SCHEDULING_SESSION"))
            .headers(h -> h.contentSecurityPolicy(c -> c.policyDirectives("default-src 'self'; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'")));
        return http.build();
    }
}
