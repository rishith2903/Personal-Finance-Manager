package com.finance.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/debug/cors")
    public ResponseEntity<?> debugCors() {
        return ResponseEntity.ok(Map.of(
                "allowedOrigins", allowedOrigins,
                "timestamp", System.currentTimeMillis(),
                "message", "Check if CORS origins are correct"));
    }
}
