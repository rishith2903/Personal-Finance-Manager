package com.finance.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.Map;

@Component
public class JwtService {
  private final Key key;
  private final long expirationMs;

  public JwtService(@Value("${app.jwt.secret}") String base64Secret,
                    @Value("${app.jwt.expirationMs}") long expirationMs) {
    byte[] keyBytes = tryDecodeSecret(base64Secret);
    if (keyBytes == null) {
      // treat as raw string bytes
      keyBytes = base64Secret.getBytes(StandardCharsets.UTF_8);
    }
    // Ensure minimum 256-bit key by deriving via SHA-256 if too short
    if (keyBytes.length < 32) {
      keyBytes = sha256(base64Secret);
    }
    this.key = Keys.hmacShaKeyFor(keyBytes);
    this.expirationMs = expirationMs;
  }

  public String generateToken(String subject, Map<String, Object> claims) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
      .setClaims(claims)
      .setSubject(subject)
      .setIssuedAt(new Date(now))
      .setExpiration(new Date(now + expirationMs))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  public Claims parse(String token) {
    return Jwts.parserBuilder().setSigningKey(key).build()
      .parseClaimsJws(token).getBody();
  }

  private static byte[] tryDecodeSecret(String s) {
    try { return Decoders.BASE64.decode(s); } catch (Exception ignored) {}
    try { return Decoders.BASE64URL.decode(s); } catch (Exception ignored) {}
    return null;
  }

  private static byte[] sha256(String s) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      return md.digest(s.getBytes(StandardCharsets.UTF_8));
    } catch (Exception e) {
      // Fallback to 32 zero bytes (should never hit)
      return new byte[32];
    }
  }
}
