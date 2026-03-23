package dev.jawad.portfolio.service;

import dev.jawad.portfolio.model.BondInput;
import dev.jawad.portfolio.model.BondResult;
import dev.jawad.portfolio.model.CashFlow;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BondPricingService {

    /**
     * Calculates comprehensive bond analytics from input parameters.
     * Uses standard discounted cash flow methodology.
     */
    public BondResult calculate(BondInput input) {
        int totalPeriods = (int) (input.yearsToMaturity() * input.couponFrequency());
        double couponPerPeriod = input.faceValue() * (input.couponRate() / 100.0) / input.couponFrequency();
        double yieldPerPeriod = (input.marketYield() / 100.0) / input.couponFrequency();

        // Build cash flow schedule
        List<CashFlow> cashFlows = buildCashFlows(input, totalPeriods, couponPerPeriod, yieldPerPeriod);

        // Dirty price = sum of all present values
        double dirtyPrice = cashFlows.stream().mapToDouble(CashFlow::presentValue).sum();

        // Accrued interest
        double accrualFraction = (double) input.daysSinceLastCoupon() / input.daysInCouponPeriod();
        double accruedInterest = couponPerPeriod * accrualFraction;

        // Clean price = dirty price - accrued interest
        double cleanPrice = dirtyPrice - accruedInterest;

        // Macaulay duration (weighted average time to receive cash flows)
        double macaulayDuration = calculateMacaulayDuration(cashFlows, dirtyPrice, input.couponFrequency());

        // Modified duration = Macaulay / (1 + yield per period)
        double modifiedDuration = macaulayDuration / (1 + yieldPerPeriod);

        // DV01 = modified duration * dirty price * 0.0001
        double dv01 = modifiedDuration * dirtyPrice * 0.0001 / 100.0;

        // Convexity
        double convexity = calculateConvexity(cashFlows, dirtyPrice, yieldPerPeriod, input.couponFrequency());

        // Current yield = annual coupon / clean price
        double annualCoupon = input.faceValue() * (input.couponRate() / 100.0);
        double currentYield = (cleanPrice > 0) ? (annualCoupon / cleanPrice) * 100.0 : 0;

        return new BondResult(
                round(cleanPrice, 4),
                round(dirtyPrice, 4),
                round(accruedInterest, 4),
                round(macaulayDuration, 4),
                round(modifiedDuration, 4),
                round(dv01, 6),
                round(convexity, 4),
                round(currentYield, 4),
                cashFlows
        );
    }

    private List<CashFlow> buildCashFlows(BondInput input, int totalPeriods, double couponPerPeriod, double yieldPerPeriod) {
        List<CashFlow> flows = new ArrayList<>();

        for (int i = 1; i <= totalPeriods; i++) {
            double principal = (i == totalPeriods) ? input.faceValue() : 0;
            double total = couponPerPeriod + principal;
            double discountFactor = 1.0 / Math.pow(1 + yieldPerPeriod, i);
            double pv = total * discountFactor;

            flows.add(new CashFlow(
                    i,
                    round(couponPerPeriod, 4),
                    round(principal, 4),
                    round(total, 4),
                    round(discountFactor, 6),
                    round(pv, 4)
            ));
        }

        return flows;
    }

    private double calculateMacaulayDuration(List<CashFlow> cashFlows, double dirtyPrice, int frequency) {
        double weightedSum = 0;
        for (CashFlow cf : cashFlows) {
            double timeInYears = (double) cf.period() / frequency;
            weightedSum += timeInYears * cf.presentValue();
        }
        return weightedSum / dirtyPrice;
    }

    private double calculateConvexity(List<CashFlow> cashFlows, double dirtyPrice, double yieldPerPeriod, int frequency) {
        double sum = 0;
        for (CashFlow cf : cashFlows) {
            int t = cf.period();
            sum += cf.presentValue() * t * (t + 1);
        }
        return sum / (dirtyPrice * Math.pow(1 + yieldPerPeriod, 2) * frequency * frequency);
    }

    private double round(double value, int places) {
        double factor = Math.pow(10, places);
        return Math.round(value * factor) / factor;
    }
}
