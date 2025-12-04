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
    // First try to get from JWT token directly
    String auth = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (auth == null || !auth.startsWith("Bearer ")) {
      System.out.println("AuthUtil: No Bearer token found");
      return null;
    }

    try {
      String token = auth.substring(7);
      Claims claims = jwtService.parse(token);
      Object uid = claims.get("uid");
      System.out.println("AuthUtil: Got userId from token: " + uid);
      return uid != null ? uid.toString() : null;
    } catch (Exception e) {
      System.out.println("AuthUtil: Error parsing token: " + e.getMessage());
      e.printStackTrace();
      return null;
    }
  }
}
