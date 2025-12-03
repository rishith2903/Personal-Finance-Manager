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
  private final com.finance.insight.InsightService insightService;

  public TransactionController(TransactionRepository repository, TransactionParserService parserService,
      AuthUtil authUtil, com.finance.insight.InsightService insightService) {
    this.repository = repository;
    this.parserService = parserService;
    this.authUtil = authUtil;
    this.insightService = insightService;
  }

  public record ProcessRequest(String rawMessage) {
  }

  @PostMapping("/process")
  public ResponseEntity<?> process(@RequestBody ProcessRequest req, HttpServletRequest request) {
    String userId = authUtil.getUserId(request);
    if (userId == null)
      return ResponseEntity.status(401).body("Unauthorized");
    Transaction t = parserService.parse(req.rawMessage());
    t.setUserId(userId);
    repository.save(t);

    // Update insights for the transaction month
    String month = java.time.YearMonth.from(t.getTransactionDate()).toString();
    insightService.generateAndUpsert(userId, month);

    return ResponseEntity.ok(t);
  }

  @GetMapping
  public ResponseEntity<List<Transaction>> list(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      HttpServletRequest request) {
    System.out.println("TransactionController: list called");
    String userId = authUtil.getUserId(request);
    if (userId == null)
      return ResponseEntity.status(401).build();

    System.out.println("TransactionController: list called for user " + userId + " from " + from + " to " + to);
    if (from != null && to != null) {
      List<Transaction> result = repository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId,
          from, to);
      System.out.println("Found " + result.size() + " transactions");
      return ResponseEntity.ok(result);
    }
    List<Transaction> result = repository.findByUserIdOrderByTransactionDateDesc(userId);
    System.out.println("Found " + result.size() + " transactions (no date filter)");
    return ResponseEntity.ok(result);
  }

  @PostMapping("/manual")
  public ResponseEntity<?> createManual(@RequestBody ManualTransactionRequest req, HttpServletRequest request) {
    String userId = authUtil.getUserId(request);
    if (userId == null)
      return ResponseEntity.status(401).body("Unauthorized");

    // Validate type
    if (!req.type().equals("debit") && !req.type().equals("credit")) {
      return ResponseEntity.badRequest().body("Type must be 'debit' or 'credit'");
    }

    Transaction t = Transaction.builder()
        .userId(userId)
        .amount(req.amount())
        .merchant(req.merchant())
        .category(req.category())
        .type(req.type())
        .transactionDate(req.transactionDate())
        .rawMessage(req.description() != null ? req.description() : "Manual entry")
        .balance(req.balance())
        .build();

    repository.save(t);

    // Update insights for the transaction month
    String month = java.time.YearMonth.from(t.getTransactionDate()).toString();
    insightService.generateAndUpsert(userId, month);

    return ResponseEntity.ok(t);
  }
}
