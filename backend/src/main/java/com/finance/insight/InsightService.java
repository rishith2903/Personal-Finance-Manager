package com.finance.insight;

import com.finance.transaction.Transaction;
import com.finance.transaction.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InsightService {
  private final TransactionRepository txRepo;
  private final InsightRepository insightRepo;

  public InsightService(TransactionRepository txRepo, InsightRepository insightRepo) {
    this.txRepo = txRepo;
    this.insightRepo = insightRepo;
  }

  public Insight generateAndUpsert(String userId, String monthStr) {
    YearMonth ym = monthStr != null && !monthStr.isBlank()
      ? YearMonth.parse(monthStr)
      : YearMonth.now();
    LocalDate start = ym.atDay(1);
    LocalDate end = ym.atEndOfMonth();

    List<Transaction> txs = txRepo.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, start, end);

    double totalSpend = txs.stream().filter(t -> "debit".equalsIgnoreCase(t.getType()))
      .mapToDouble(Transaction::getAmount).sum();
    double totalIncome = txs.stream().filter(t -> "credit".equalsIgnoreCase(t.getType()))
      .mapToDouble(Transaction::getAmount).sum();

    Map<String, Double> categorySummary = new HashMap<>();
    for (Transaction t : txs) {
      categorySummary.merge(t.getCategory(), t.getAmount(), Double::sum);
    }

    Map<String, Double> merchantSummary = new HashMap<>();
    for (Transaction t : txs) {
      if ("debit".equalsIgnoreCase(t.getType())) {
        merchantSummary.merge(t.getMerchant(), t.getAmount(), Double::sum);
      }
    }

    List<Insight.TopMerchant> topMerchants = merchantSummary.entrySet().stream()
      .map(e -> new Insight.TopMerchant(e.getKey(), e.getValue()))
      .sorted((a, b) -> Double.compare(b.getAmount(), a.getAmount()))
      .limit(5)
      .collect(Collectors.toList());

    String recs = recommendations(totalSpend, totalIncome, categorySummary, topMerchants);

    Insight insight = insightRepo.findByUserIdAndMonth(userId, ym.toString()).orElse(new Insight());
    insight.setUserId(userId);
    insight.setMonth(ym.toString());
    insight.setTotal_spend(totalSpend);
    insight.setTotal_income(totalIncome);
    insight.setCategory_summary(categorySummary);
    insight.setRecommendations(recs);
    insight.setTop_merchants(topMerchants);

    return insightRepo.save(insight);
  }

  private String recommendations(double totalSpend, double totalIncome, Map<String, Double> categorySummary, List<Insight.TopMerchant> topMerchants) {
    List<String> list = new ArrayList<>();
    if (totalIncome > 0) {
      double savingsRate = ((totalIncome - totalSpend) / totalIncome) * 100.0;
      if (savingsRate < 20) list.add(String.format(Locale.ENGLISH, "Your savings rate is %.1f%%. Consider reducing expenses to save at least 20%% of your income.", savingsRate));
      else list.add(String.format(Locale.ENGLISH, "Great job! You're saving %.1f%% of your income.", savingsRate));
    }

    Optional<Map.Entry<String, Double>> topCat = categorySummary.entrySet().stream()
      .sorted((a,b)->Double.compare(b.getValue(), a.getValue())).findFirst();
    if (topCat.isPresent() && totalSpend > 0) {
      String cat = topCat.get().getKey();
      double perc = (topCat.get().getValue() / totalSpend) * 100.0;
      if (perc > 30 && !"Income".equalsIgnoreCase(cat)) {
        list.add(String.format(Locale.ENGLISH, "%s accounts for %.1f%% of your spending. Consider setting a budget to control this category.", cat, perc));
      }
    }

    if (!topMerchants.isEmpty() && totalSpend > 0) {
      Insight.TopMerchant tm = topMerchants.get(0);
      double perc = (tm.getAmount() / totalSpend) * 100.0;
      if (perc > 20) {
        list.add(String.format(Locale.ENGLISH, "%s is your top spending destination at ₹%.2f (%.1f%% of total spend).", tm.getMerchant(), tm.getAmount(), perc));
      }
    }

    double food = categorySummary.getOrDefault("Food & Dining", 0.0);
    if (food > totalSpend * 0.25) {
      list.add("Food & Dining expenses are high. Consider meal planning or cooking at home to reduce costs.");
    }

    double subs = categorySummary.getOrDefault("Subscriptions", 0.0);
    if (subs > 0) list.add(String.format(Locale.ENGLISH, "You're spending ₹%.2f on subscriptions. Review and cancel unused services.", subs));

    if (list.isEmpty()) list.add("Your spending patterns look balanced. Keep tracking to maintain financial awareness.");
    return String.join(" ", list);
  }
}
