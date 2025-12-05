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
  public ResponseEntity<?> list(
      @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      HttpServletRequest request) {
    try {
      System.out.println("TransactionController: list called");
      String userId = authUtil.getUserId(request);
      System.out.println("TransactionController: userId = " + userId);

      if (userId == null) {
        System.out.println("TransactionController: userId is null, returning 401");
        return ResponseEntity.status(401).body("Unauthorized - no user ID");
      }

      System.out.println("TransactionController: Querying for user " + userId + " from " + from + " to " + to);

      List<Transaction> result;
      if (from != null && to != null) {
        result = repository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, from, to);
      } else {
        result = repository.findByUserIdOrderByTransactionDateDesc(userId);
      }

      System.out.println("TransactionController: Found " + result.size() + " transactions");
      return ResponseEntity.ok(result);

    } catch (Exception e) {
      System.out.println("TransactionController: ERROR - " + e.getClass().getName() + ": " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).body("Error: " + e.getMessage());
    }
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

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable("id") String id, HttpServletRequest request) {
    try {
      String userId = authUtil.getUserId(request);
      if (userId == null) {
        return ResponseEntity.status(401).body("Unauthorized");
      }

      // Find the transaction
      var transaction = repository.findById(id);
      if (transaction.isEmpty()) {
        return ResponseEntity.status(404).body("Transaction not found");
      }

      // Verify ownership
      if (!transaction.get().getUserId().equals(userId)) {
        return ResponseEntity.status(403).body("Forbidden - not your transaction");
      }

      // Get the month before deleting for insight update
      String month = java.time.YearMonth.from(transaction.get().getTransactionDate()).toString();

      // Delete the transaction
      repository.deleteById(id);

      // Update insights for the transaction month
      insightService.generateAndUpsert(userId, month);

      return ResponseEntity.ok().body("Transaction deleted successfully");

    } catch (Exception e) {
      System.out.println("TransactionController: DELETE ERROR - " + e.getClass().getName() + ": " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.status(500).body("Error: " + e.getMessage());
    }
  }
}
