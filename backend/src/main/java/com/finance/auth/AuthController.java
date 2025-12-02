package com.finance.auth;

import com.finance.security.JwtService;
import com.finance.user.User;
import com.finance.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import static com.finance.auth.AuthDtos.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;

  public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.authenticationManager = authenticationManager;
  }

  @PostMapping("/signup")
  public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
    if (userRepository.existsByEmail(req.email())) {
      return ResponseEntity.badRequest().body("Email already registered");
    }
    User user = User.builder()
      .email(req.email())
      .username(req.username())
      .passwordHash(passwordEncoder.encode(req.password()))
      .build();
    userRepository.save(user);

    String token = jwtService.generateToken(user.getEmail(), java.util.Map.of("uid", user.getId(), "username", user.getUsername()));
    return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getUsername()));
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
    User user = userRepository.findByEmail(req.email()).orElseThrow();
    String token = jwtService.generateToken(user.getEmail(), java.util.Map.of("uid", user.getId(), "username", user.getUsername()));
    return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getUsername()));
  }

  @PostMapping("/demo-login")
  public ResponseEntity<?> demoLogin() {
    String demoEmail = "demo@example.com";
    String demoPassword = "DemoPass123!";
    String demoUsername = "demo";

    User user = userRepository.findByEmail(demoEmail).orElse(null);

    if (user == null) {
      user = User.builder()
          .email(demoEmail)
          .username(demoUsername)
          .passwordHash(passwordEncoder.encode(demoPassword))
          .build();
      userRepository.save(user);
    } else {
      // Ensure password is correct in case it was changed or created differently
      user.setPasswordHash(passwordEncoder.encode(demoPassword));
      userRepository.save(user);
    }

    String token = jwtService.generateToken(user.getEmail(), java.util.Map.of("uid", user.getId(), "username", user.getUsername()));
    return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getUsername()));
  }
}
