package com.finance.insight;

import com.finance.security.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/insights")
public class InsightController {
  private final InsightService service;
  private final AuthUtil authUtil;

  public InsightController(InsightService service, AuthUtil authUtil) {
    this.service = service;
    this.authUtil = authUtil;
  }

  @GetMapping
  public ResponseEntity<?> get(@RequestParam(required = false) String month, HttpServletRequest request) {
    String userId = authUtil.getUserId(request);
    if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
    // Generate or refresh and return current month insight
    return ResponseEntity.ok(service.generateAndUpsert(userId, month));
  }
}
