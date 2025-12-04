package com.finance.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;

public class JwtAuthFilter extends GenericFilterBean {
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
    System.out.println("JwtAuthFilter: Processing " + request.getMethod() + " " + request.getRequestURI());

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      System.out.println("JwtAuthFilter: No Bearer token");
      filterChain.doFilter(request, response);
      return;
    }

    String token = authHeader.substring(7);
    try {
      Claims claims = jwtService.parse(token);
      String email = claims.getSubject();
      System.out.println("JwtAuthFilter: Token valid for: " + email);

      UserDetails userDetails = userDetailsService.loadUserByUsername(email);
      System.out.println("JwtAuthFilter: User found: " + userDetails.getUsername());

      UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
          userDetails, null, userDetails.getAuthorities());
      authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

      // Create a new SecurityContext and set auth
      SecurityContext context = SecurityContextHolder.createEmptyContext();
      context.setAuthentication(authToken);
      SecurityContextHolder.setContext(context);

      System.out
          .println("JwtAuthFilter: Auth set. Context auth: " + SecurityContextHolder.getContext().getAuthentication());
      response.setHeader("X-Auth-User", email);
      response.setHeader("X-Auth-Success", "true");
      response.setHeader("X-Auth-Debug", "Auth-Set-V2");

    } catch (Exception e) {
      System.out.println("JwtAuthFilter: Error: " + e.getMessage());
      response.setHeader("X-Auth-Error", e.getMessage());
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    filterChain.doFilter(request, response);

    // Log after chain to see if auth persisted
    System.out.println("JwtAuthFilter: After chain, auth: " + SecurityContextHolder.getContext().getAuthentication());
  }
}
