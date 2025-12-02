package com.finance.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {
  private final JwtService jwtService;

  public AuthUtil(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  public String getUserId(HttpServletRequest request) {
    String auth = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (auth == null || !auth.startsWith("Bearer ")) return null;
    String token = auth.substring(7);
    Claims claims = jwtService.parse(token);
    Object uid = claims.get("uid");
    return uid != null ? uid.toString() : null;
  }
}
