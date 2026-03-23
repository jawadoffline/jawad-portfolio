package dev.jawad.portfolio.model;

public record BondInput(
        double faceValue,
        double couponRate,
        int couponFrequency,
        double yearsToMaturity,
        double marketYield,
        int daysSinceLastCoupon,
        int daysInCouponPeriod
) {
    public BondInput {
        if (faceValue <= 0 || faceValue > 100_000_000) throw new IllegalArgumentException("Face value must be between 0 and 100,000,000");
        if (couponRate < 0 || couponRate > 100) throw new IllegalArgumentException("Coupon rate must be between 0 and 100");
        if (couponFrequency < 1 || couponFrequency > 12) throw new IllegalArgumentException("Coupon frequency must be 1-12");
        if (yearsToMaturity <= 0 || yearsToMaturity > 100) throw new IllegalArgumentException("Years to maturity must be between 0 and 100");
        if (marketYield < 0 || marketYield > 100) throw new IllegalArgumentException("Market yield must be between 0 and 100");
        if (daysSinceLastCoupon < 0 || daysSinceLastCoupon > 366) throw new IllegalArgumentException("Days since last coupon must be between 0 and 366");
        if (daysInCouponPeriod <= 0 || daysInCouponPeriod > 366) throw new IllegalArgumentException("Days in coupon period must be between 1 and 366");
    }
}
