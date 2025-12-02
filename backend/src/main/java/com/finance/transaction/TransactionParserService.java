package com.finance.transaction;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TransactionParserService {
  private static final Pattern AMOUNT_PATTERN = Pattern.compile("(?:rs\\.?|inr|₹)\\s*([0-9,]+\\.?[0-9]*)|([0-9,]+\\.?[0-9]*)\\s*(?:rs\\.?|inr|₹)", Pattern.CASE_INSENSITIVE);
  private static final Pattern DATE_PATTERN = Pattern.compile("\\b(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\b|\\b(\\d{4}[/-]\\d{1,2}[/-]\\d{1,2})\\b");
  private static final Pattern MERCHANT_PATTERN = Pattern.compile("(?:at|to|from)\\s+([A-Z][A-Za-z0-9\\s&]+?)(?:\\s+on|\\.|,|$)", Pattern.CASE_INSENSITIVE);
  private static final Pattern BALANCE_PATTERN = Pattern.compile("(?:balance|bal|available)\\s*:?\\s*(?:rs\\.?|inr|₹)?\\s*([0-9,]+\\.?[0-9]*)", Pattern.CASE_INSENSITIVE);

  private static final String[][] CATEGORY_KEYWORDS = new String[][]{
    {"Food & Dining", "swiggy","zomato","uber eats","food","restaurant","cafe","dominos","pizza","burger"},
    {"Shopping", "amazon","flipkart","myntra","shopping","mall","store"},
    {"Travel & Transport", "uber","ola","rapido","taxi","metro","bus","petrol","diesel","fuel"},
    {"Bills & Utilities", "electricity","water","gas","bill","recharge","mobile","internet","broadband"},
    {"Subscriptions", "netflix","prime","spotify","subscription","youtube","hotstar"},
    {"Healthcare", "hospital","doctor","medical","pharmacy","medicine","health"},
    {"Entertainment", "movie","cinema","entertainment","game","concert"},
    {"Cash Withdrawal", "atm","withdraw","cash"},
    {"Transfers", "transfer","upi","neft","imps","gpay","phonepe","paytm"},
    {"Income", "salary","credited","credit"}
  };

  public Transaction parse(String rawMessage) {
    if (rawMessage == null || rawMessage.isBlank()) {
      throw new IllegalArgumentException("rawMessage is required");
    }

    String lower = rawMessage.toLowerCase(Locale.ROOT);

    Matcher amountM = AMOUNT_PATTERN.matcher(rawMessage);
    double amount = 0.0;
    if (amountM.find()) {
      String num = amountM.group(1) != null ? amountM.group(1) : amountM.group(2);
      amount = Double.parseDouble(num.replace(",", ""));
    }

    String type = lower.contains("credit") ? "credit" : "debit";

    String merchant = "Unknown";
    Matcher merchantM = MERCHANT_PATTERN.matcher(rawMessage);
    if (merchantM.find() && merchantM.group(1) != null) {
      merchant = merchantM.group(1).trim();
    } else {
      String[] words = rawMessage.split("\\s+");
      for (String w : words) {
        if (w.length() > 3 && Character.isUpperCase(w.charAt(0))) {
          merchant = w;
          break;
        }
      }
    }

    String category = "Uncategorized";
    for (String[] cat : CATEGORY_KEYWORDS) {
      String name = cat[0];
      for (int i = 1; i < cat.length; i++) {
        if (lower.contains(cat[i])) { category = name; break; }
      }
      if (!"Uncategorized".equals(category)) break;
    }

    LocalDate date = LocalDate.now();
    Matcher dateM = DATE_PATTERN.matcher(rawMessage);
    if (dateM.find()) {
      String ds = dateM.group(0);
      try {
        ds = ds.replace('/', '-');
        if (ds.matches("\\d{4}-\\d{1,2}-\\d{1,2}")) {
          date = LocalDate.parse(ds, DateTimeFormatter.ofPattern("yyyy-M-d"));
        } else {
          date = LocalDate.parse(ds, DateTimeFormatter.ofPattern("d-M-yy"));
        }
      } catch (Exception ignored) {}
    }

    Double balance = null;
    Matcher balM = BALANCE_PATTERN.matcher(rawMessage);
    if (balM.find()) {
      balance = Double.parseDouble(balM.group(1).replace(",", ""));
    }

    return Transaction.builder()
      .amount(amount)
      .merchant(merchant)
      .category(category)
      .type(type)
      .transactionDate(date)
      .rawMessage(rawMessage)
      .balance(balance)
      .build();
  }
}
