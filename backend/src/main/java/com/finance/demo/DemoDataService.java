package com.finance.demo;

import com.finance.insight.Insight;
import com.finance.insight.InsightRepository;
import com.finance.transaction.Transaction;
import com.finance.transaction.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DemoDataService {

        private final TransactionRepository transactionRepository;
        private final InsightRepository insightRepository;

        public DemoDataService(TransactionRepository transactionRepository,
                        InsightRepository insightRepository) {
                this.transactionRepository = transactionRepository;
                this.insightRepository = insightRepository;
        }

        public void seedDemoData(String userId) {
                // For demo users, always refresh demo data to ensure current month data exists
                // Delete old demo transactions and insights
                transactionRepository.deleteByUserId(userId);
                insightRepository.deleteByUserId(userId);

                // Create sample transactions
                List<Transaction> transactions = createSampleTransactions(userId);
                transactionRepository.saveAll(transactions);

                // Create sample insights
                Insight insight = createSampleInsight(userId);
                insightRepository.save(insight);
        }

        private List<Transaction> createSampleTransactions(String userId) {
                List<Transaction> transactions = new ArrayList<>();
                LocalDate today = LocalDate.now();
                // Use dates within the current month (days 1-4 to be safe)
                LocalDate currentMonthStart = today.withDayOfMonth(1);
                int maxDay = Math.min(today.getDayOfMonth(), 4);

                // Income transactions
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(5000.00)
                                .merchant("Acme Corp")
                                .category("Salary")
                                .type("credit")
                                .transactionDate(currentMonthStart)
                                .rawMessage("Salary credited from Acme Corp")
                                .balance(5000.00)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(200.00)
                                .merchant("Freelance Client")
                                .category("Freelance")
                                .type("credit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 4)))
                                .rawMessage("Payment received for project")
                                .balance(5200.00)
                                .build());

                // Grocery expenses
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(85.50)
                                .merchant("Whole Foods")
                                .category("Groceries")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Purchase at Whole Foods")
                                .balance(5114.50)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(120.75)
                                .merchant("Walmart")
                                .category("Groceries")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 3)))
                                .rawMessage("Shopping at Walmart")
                                .balance(4993.75)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(67.30)
                                .merchant("Trader Joe's")
                                .category("Groceries")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 3)))
                                .rawMessage("Groceries from Trader Joe's")
                                .balance(4926.45)
                                .build());

                // Dining out
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(45.00)
                                .merchant("Olive Garden")
                                .category("Dining")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Dinner at Olive Garden")
                                .balance(4881.45)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(28.50)
                                .merchant("Starbucks")
                                .category("Dining")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 2)))
                                .rawMessage("Coffee at Starbucks")
                                .balance(4852.95)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(65.00)
                                .merchant("Chipotle")
                                .category("Dining")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 2)))
                                .rawMessage("Lunch at Chipotle")
                                .balance(4787.95)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(35.20)
                                .merchant("Pizza Hut")
                                .category("Dining")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 3)))
                                .rawMessage("Pizza delivery")
                                .balance(4752.75)
                                .build());

                // Transportation
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(50.00)
                                .merchant("Shell Gas Station")
                                .category("Transportation")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Gas refill")
                                .balance(4702.75)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(12.50)
                                .merchant("Uber")
                                .category("Transportation")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 2)))
                                .rawMessage("Uber ride")
                                .balance(4690.25)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(45.00)
                                .merchant("BP Gas Station")
                                .category("Transportation")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 3)))
                                .rawMessage("Fuel purchase")
                                .balance(4645.25)
                                .build());

                // Entertainment
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(15.99)
                                .merchant("Netflix")
                                .category("Entertainment")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Netflix subscription")
                                .balance(4629.26)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(12.99)
                                .merchant("Spotify")
                                .category("Entertainment")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Spotify premium")
                                .balance(4616.27)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(45.00)
                                .merchant("AMC Theaters")
                                .category("Entertainment")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 2)))
                                .rawMessage("Movie tickets")
                                .balance(4571.27)
                                .build());

                // Utilities
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(120.00)
                                .merchant("Electric Company")
                                .category("Utilities")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Electricity bill")
                                .balance(4451.27)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(60.00)
                                .merchant("Water Department")
                                .category("Utilities")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Water bill payment")
                                .balance(4391.27)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(89.99)
                                .merchant("Verizon")
                                .category("Utilities")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 2)))
                                .rawMessage("Phone bill")
                                .balance(4301.28)
                                .build());

                // Shopping
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(150.00)
                                .merchant("Amazon")
                                .category("Shopping")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 2)))
                                .rawMessage("Online shopping")
                                .balance(4151.28)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(89.99)
                                .merchant("Target")
                                .category("Shopping")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 3)))
                                .rawMessage("Household items")
                                .balance(4061.29)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(65.00)
                                .merchant("Best Buy")
                                .category("Electronics")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 3)))
                                .rawMessage("Tech accessories")
                                .balance(3996.29)
                                .build());

                // Healthcare
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(25.00)
                                .merchant("Walgreens Pharmacy")
                                .category("Healthcare")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 2)))
                                .rawMessage("Prescription refill")
                                .balance(3971.29)
                                .build());

                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(150.00)
                                .merchant("General Hospital")
                                .category("Healthcare")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 3)))
                                .rawMessage("Doctor consultation")
                                .balance(3821.29)
                                .build());

                // Fitness
                transactions.add(Transaction.builder()
                                .userId(userId)
                                .amount(50.00)
                                .merchant("Planet Fitness")
                                .category("Fitness")
                                .type("debit")
                                .transactionDate(currentMonthStart.plusDays(Math.min(maxDay, 1)))
                                .rawMessage("Monthly gym membership")
                                .balance(3771.29)
                                .build());

                return transactions;
        }

        private Insight createSampleInsight(String userId) {
                LocalDate today = LocalDate.now();
                String currentMonth = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

                // Calculate category summary
                Map<String, Double> categorySummary = new HashMap<>();
                categorySummary.put("Groceries", 273.55);
                categorySummary.put("Dining", 173.70);
                categorySummary.put("Transportation", 107.50);
                categorySummary.put("Entertainment", 73.98);
                categorySummary.put("Utilities", 269.99);
                categorySummary.put("Shopping", 239.99);
                categorySummary.put("Electronics", 65.00);
                categorySummary.put("Healthcare", 175.00);
                categorySummary.put("Fitness", 50.00);

                // Top merchants
                List<Insight.TopMerchant> topMerchants = new ArrayList<>();
                topMerchants.add(new Insight.TopMerchant("Whole Foods", 85.50));
                topMerchants.add(new Insight.TopMerchant("Amazon", 150.00));
                topMerchants.add(new Insight.TopMerchant("General Hospital", 150.00));
                topMerchants.add(new Insight.TopMerchant("Walmart", 120.75));
                topMerchants.add(new Insight.TopMerchant("Electric Company", 120.00));

                String recommendations = "Great spending habits this month! "
                                + "You're maintaining a healthy balance between income and expenses. "
                                + "Consider setting aside 10% of your income for emergency savings. "
                                + "Your dining expenses are moderate - keep it up! "
                                + "Transportation costs are reasonable. "
                                + "Overall, you're on track to save $3,771 this month.";

                return Insight.builder()
                                .userId(userId)
                                .month(currentMonth)
                                .total_spend(1428.71)
                                .total_income(5200.00)
                                .category_summary(categorySummary)
                                .recommendations(recommendations)
                                .top_merchants(topMerchants)
                                .build();
        }
}
