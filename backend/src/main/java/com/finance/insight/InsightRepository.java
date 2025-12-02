package com.finance.insight;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface InsightRepository extends MongoRepository<Insight, String> {
  Optional<Insight> findByUserIdAndMonth(String userId, String month);
}
