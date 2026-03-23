package dev.jawad.portfolio.controller;

import dev.jawad.portfolio.model.BondInput;
import dev.jawad.portfolio.model.BondResult;
import dev.jawad.portfolio.service.BondPricingService;
import dev.jawad.portfolio.service.HttpAnalyzerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class ToolsController {

    private final BondPricingService pricingService;
    private final HttpAnalyzerService analyzerService;

    public ToolsController(BondPricingService pricingService, HttpAnalyzerService analyzerService) {
        this.pricingService = pricingService;
        this.analyzerService = analyzerService;
    }

    @GetMapping("/tools")
    public String toolsIndex() {
        return "tools/index";
    }

    // ── Bond Calculator ─────────────────────────────────────

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

    // ── HTTP Response Analyzer ────────────────────────────

    @GetMapping("/tools/http-analyzer")
    public String httpAnalyzer() {
        return "tools/http-analyzer";
    }

    @PostMapping("/tools/http-analyzer/analyze")
    public String analyzeUrl(@RequestParam String url, Model model) {
        try {
            var result = analyzerService.analyze(url);
            model.addAttribute("result", result);
            return "tools/fragments/analyzer-results";
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", e.getMessage());
            return "tools/fragments/analyzer-error";
        } catch (Exception e) {
            model.addAttribute("error", "Could not reach the URL: " + e.getMessage());
            return "tools/fragments/analyzer-error";
        }
    }
}
