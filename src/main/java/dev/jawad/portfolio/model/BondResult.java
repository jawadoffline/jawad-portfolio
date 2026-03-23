package dev.jawad.portfolio.model;

import java.util.List;

public record BondResult(
        double cleanPrice,
        double dirtyPrice,
        double accruedInterest,
        double macaulayDuration,
        double modifiedDuration,
        double dv01,
        double convexity,
        double currentYield,
        List<CashFlow> cashFlows
) {}
