package com.finance.insight;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "insights")
@CompoundIndex(name = "user_month_unique", def = "{ 'userId': 1, 'month': 1 }", unique = true)
public class Insight {
  @Id
  private String id;
  private String userId;
  private String month; // YYYY-MM
  private double total_spend;
  private double total_income;
  private Map<String, Double> category_summary;
  private String recommendations;
  private List<TopMerchant> top_merchants;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class TopMerchant {
    private String merchant;
    private double amount;
  }
}
