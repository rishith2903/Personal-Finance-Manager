package com.finance.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;

public class JwtAuthFilter implements Filter {
  private final JwtService jwtService;
  private final UserDetailsService userDetailsService;

  public JwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
    this.jwtService = jwtService;
    this.userDetailsService = userDetailsService;
  }

  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
      throws IOException, ServletException {

    HttpServletRequest request = (HttpServletRequest) servletRequest;
    HttpServletResponse response = (HttpServletResponse) servletResponse;

    String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
    System.out.println("JwtAuthFilter: Processing request to " + request.getRequestURI());

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      System.out.println("JwtAuthFilter: No valid Auth header found");
      filterChain.doFilter(request, response);
      return;
    }

    String token = authHeader.substring(7);
    try {
      Claims claims = jwtService.parse(token);
      String email = claims.getSubject();
      System.out.println("JwtAuthFilter: Processing token for email: " + email);

      if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        System.out.println("JwtAuthFilter: User loaded: " + userDetails.getUsername());

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        System.out.println("JwtAuthFilter: Authentication set in SecurityContext");
        response.setHeader("X-Auth-User", email);
        response.setHeader("X-Auth-Success", "true");
        response.setHeader("X-Auth-Debug", "Auth-Set");
      } else {
        System.out.println("JwtAuthFilter: Skipped auth set - email null or already authenticated");
        response.setHeader("X-Auth-Debug", "Skipped: " + email);
      }
    } catch (Exception e) {
      System.out.println("JwtAuthFilter: Token validation failed: " + e.getMessage());
      e.printStackTrace();
      response.setHeader("X-Auth-Error", e.getMessage());
      response.setHeader("X-Auth-Debug", "Exception: " + e.getMessage());
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    filterChain.doFilter(request, response);
  }
}
