package com.joy.catering.security;
import com.joy.catering.model.User; import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service; import javax.crypto.SecretKey; import java.nio.charset.StandardCharsets; import java.time.*; import java.util.*;
@Service public class JwtService {
 private final SecretKey key; private final long minutes;
 public JwtService(@Value("${app.jwt-secret}") String secret,@Value("${app.access-token-minutes}") long minutes){
  if(secret.startsWith("REPLACE_")||secret.length()<32) throw new IllegalArgumentException("Generate a unique JWT_SECRET before starting");
  key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.minutes=minutes;
 }
 public String token(User u){var now=Instant.now();return Jwts.builder().subject(u.getId().toString()).claim("ver",u.getTokenVersion()).issuedAt(Date.from(now)).expiration(Date.from(now.plusSeconds(minutes*60))).issuer("catering").audience().add("catering-web").and().signWith(key).compact();}
 public Jws<Claims> parse(String token){return Jwts.parser().verifyWith(key).requireIssuer("catering").requireAudience("catering-web").build().parseSignedClaims(token);}
}
