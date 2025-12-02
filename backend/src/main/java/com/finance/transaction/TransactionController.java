package com.finance.transaction;

import com.finance.security.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
  private final TransactionRepository repository;
  private final TransactionParserService parserService;
  private final AuthUtil authUtil;

  public TransactionController(TransactionRepository repository, TransactionParserService parserService, AuthUtil authUtil) {
    this.repository = repository;
    this.parserService = parserService;
    this.authUtil = authUtil;
  }

  public record ProcessRequest(String rawMessage) {}

  @PostMapping("/process")
  public ResponseEntity<?> process(@RequestBody ProcessRequest req, HttpServletRequest request) {
    String userId = authUtil.getUserId(request);
    if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
    Transaction t = parserService.parse(req.rawMessage());
    t.setUserId(userId);
    repository.save(t);
    return ResponseEntity.ok(t);
  }

  @GetMapping
  public ResponseEntity<List<Transaction>> list(
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
    HttpServletRequest request
  ) {
    String userId = authUtil.getUserId(request);
    if (userId == null) return ResponseEntity.status(401).build();

    if (from != null && to != null) {
      return ResponseEntity.ok(repository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, from, to));
    }
    return ResponseEntity.ok(repository.findByUserIdOrderByTransactionDateDesc(userId));
  }
}
