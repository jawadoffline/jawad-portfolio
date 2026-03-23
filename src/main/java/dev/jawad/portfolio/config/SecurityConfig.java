package dev.jawad.portfolio.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class SecurityConfig {

    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
        FilterRegistrationBean<SecurityHeadersFilter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new SecurityHeadersFilter());
        bean.addUrlPatterns("/*");
        bean.setOrder(1);
        return bean;
    }

    static class SecurityHeadersFilter implements Filter {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            HttpServletResponse res = (HttpServletResponse) response;
            HttpServletRequest req = (HttpServletRequest) request;

            // Security headers
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "DENY");
            res.setHeader("X-XSS-Protection", "1; mode=block");
            res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
            res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'");

            // Cache headers for static assets
            String uri = req.getRequestURI();
            if (uri.startsWith("/css/") || uri.startsWith("/js/") || uri.startsWith("/images/")) {
                res.setHeader("Cache-Control", "public, max-age=86400, immutable");
            } else {
                res.setHeader("Cache-Control", "no-cache, must-revalidate");
            }

            chain.doFilter(request, response);
        }
    }
}
