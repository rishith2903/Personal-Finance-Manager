package com.finance.auth;

public class AuthDtos {
  public record SignupRequest(String email, String password, String username) {}
  public record LoginRequest(String email, String password) {}
  public record AuthResponse(String token, String email, String username) {}
}
