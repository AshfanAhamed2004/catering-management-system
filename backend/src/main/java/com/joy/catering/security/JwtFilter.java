package com.joy.catering.security;
import com.joy.catering.repo.UserRepository; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.web.filter.OncePerRequestFilter; import jakarta.servlet.*; import jakarta.servlet.http.*; import java.io.IOException; import java.util.*;
public class JwtFilter extends OncePerRequestFilter {
 private final JwtService jwt; private final UserRepository users;
 public JwtFilter(JwtService j,UserRepository u){jwt=j;users=u;}
 protected void doFilterInternal(HttpServletRequest r,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String h=r.getHeader("Authorization");
  if(h!=null&&h.startsWith("Bearer ")){try{var c=jwt.parse(h.substring(7)).getPayload();var u=users.findById(Long.valueOf(c.getSubject())).orElse(null);if(u!=null&&u.isActive()&&u.getTokenVersion()==((Number)c.get("ver")).intValue())SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u,null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name()))));}catch(Exception ignored){}}
  chain.doFilter(r,res);
 }
}
