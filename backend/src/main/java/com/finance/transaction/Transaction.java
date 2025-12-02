package com.finance.transaction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
public class Transaction {
  @Id
  private String id;
  private String userId;
  private double amount;
  private String merchant;
  private String category;
  private String type; // debit | credit
  private LocalDate transactionDate;
  private String rawMessage;
  private Double balance;
}
