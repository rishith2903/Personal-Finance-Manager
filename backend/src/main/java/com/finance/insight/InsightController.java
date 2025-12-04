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
    try {
      System.out.println("InsightController: get called for month " + month);
      String userId = authUtil.getUserId(request);
      System.out.println("InsightController: userId = " + userId);

      if (userId == null) {
        return ResponseEntity.status(401).body("Unauthorized - no user ID");
      }

      Object result = service.generateAndUpsert(userId, month);
      System.out.println("InsightController: Got result");
      return ResponseEntity.ok(result);

    } catch (Exception e) {
      System.out.println("InsightController: ERROR - " + e.getClass().getName() + ": " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).body("Error: " + e.getMessage());
    }
  }
}
