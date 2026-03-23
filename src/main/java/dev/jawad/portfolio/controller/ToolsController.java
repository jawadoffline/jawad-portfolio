package dev.jawad.portfolio.controller;

import dev.jawad.portfolio.model.BondInput;
import dev.jawad.portfolio.model.BondResult;
import dev.jawad.portfolio.service.BondPricingService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class ToolsController {

    private final BondPricingService pricingService;

    public ToolsController(BondPricingService pricingService) {
        this.pricingService = pricingService;
    }

    @GetMapping("/tools")
    public String toolsIndex() {
        return "tools/index";
    }

    @GetMapping("/tools/bond-calculator")
    public String bondCalculator() {
        return "tools/bond-calculator";
    }

    @PostMapping("/tools/bond-calculator/calculate")
    public String calculate(
            @RequestParam double faceValue,
            @RequestParam double couponRate,
            @RequestParam int couponFrequency,
            @RequestParam double yearsToMaturity,
            @RequestParam double marketYield,
            @RequestParam(defaultValue = "0") int daysSinceLastCoupon,
            @RequestParam(defaultValue = "180") int daysInCouponPeriod,
            Model model) {

        BondInput input = new BondInput(
                faceValue, couponRate, couponFrequency,
                yearsToMaturity, marketYield,
                daysSinceLastCoupon, daysInCouponPeriod
        );

        BondResult result = pricingService.calculate(input);
        model.addAttribute("result", result);
        return "tools/fragments/bond-results";
    }

    @PostMapping("/tools/bond-calculator/api")
    @ResponseBody
    public BondResult calculateApi(
            @RequestParam double faceValue,
            @RequestParam double couponRate,
            @RequestParam int couponFrequency,
            @RequestParam double yearsToMaturity,
            @RequestParam double marketYield,
            @RequestParam(defaultValue = "0") int daysSinceLastCoupon,
            @RequestParam(defaultValue = "180") int daysInCouponPeriod) {

        return pricingService.calculate(new BondInput(
                faceValue, couponRate, couponFrequency,
                yearsToMaturity, marketYield,
                daysSinceLastCoupon, daysInCouponPeriod
        ));
    }
}
