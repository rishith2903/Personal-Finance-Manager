package com.finance.transaction;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record ManualTransactionRequest(
        @NotNull @Positive Double amount,
        @NotBlank String merchant,
        @NotBlank String category,
        @NotBlank String type, // "debit" or "credit"
        @NotNull LocalDate transactionDate,
        String description,
        Double balance) {
}
