package com.finance.transaction;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
  List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(String userId, LocalDate from, LocalDate to);
  List<Transaction> findByUserIdOrderByTransactionDateDesc(String userId);
}
