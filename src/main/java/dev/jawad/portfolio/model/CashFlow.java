package dev.jawad.portfolio.model;

public record CashFlow(
        int period,
        double couponPayment,
        double principalPayment,
        double totalPayment,
        double discountFactor,
        double presentValue
) {}
