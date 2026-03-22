package dev.jawad.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
@Controller
public class TerminalController {

    @PostMapping("/terminal")
    public String executeCommand(@RequestParam String command, Model model) {
        String cmd = command.trim().toLowerCase();
        String output = processCommand(cmd);
        model.addAttribute("command", command.trim());
        model.addAttribute("output", output);
        return "fragments/terminal-output";
    }

    private String processCommand(String cmd) {
        return switch (cmd) {
            case "help" -> """
                    Available commands:
                    ──────────────────────────────────────
                      whoami          Who is Jawad Ali?
                      cat about.txt   Read the full story
                      ls projects/    List all projects
                      cat skills.json View technical skills
                      experience      Career timeline
                      education       Academic background
                      contact         Contact information
                      java --version  Java version info
                      uptime          System uptime
                      date            Current date/time
                      neofetch        System info
                      matrix          Toggle matrix rain
                      clear           Clear terminal
                      help            Show this help
                    ──────────────────────────────────────""";

            case "whoami" -> """
                    Jawad Ali
                    Software Engineer @ SoftSolutions! S.r.l.
                    Bergamo, Italy (from Islamabad, Pakistan)

                    Building enterprise Fixed Income trading platforms.
                    Previously: mission-critical defense systems at NESCOM.

                    I build software where milliseconds matter
                    and failure isn't an option.""";

            case "cat about.txt" -> """
                    ═══ about.txt ═══

                    Most engineers pick a lane. I picked two of the hardest.

                    CHAPTER 1: DEFENSE
                    At NESCOM, I built ground control stations for UAVs,
                    mission planning tools for underwater vehicles, and
                    threat visualization platforms. Software where a bug
                    doesn't mean a 404 — it means a failed mission.
                    I learned what "mission-critical" really means.

                    CHAPTER 2: TRADING
                    Now at SoftSolutions, I optimize enterprise Fixed Income
                    trading platforms. RFQs, pricing, quoting, execution.
                    Every millisecond in a trader's workflow is money.
                    I profile, debug, and deliver measurable performance gains.

                    CHAPTER 3: THE BRIDGE
                    What connects defense and finance? Both demand software
                    that can't afford to fail. Both need engineers who
                    understand the domain, not just the code. Both need
                    someone who ships, supports, and trains end users.

                    That's what I do.""";

            case "ls projects/", "ls projects" -> """
                    drwxr-xr-x  bondlens/           [ACTIVE]  Full-stack fixed income analytics
                    drwxr-xr-x  trading-platform/   [ACTIVE]  Enterprise FI trading optimization
                    drwxr-xr-x  ground-control/     [DONE]    UAV/AUV/USV ground control systems
                    drwxr-xr-x  mission-planning/   [DONE]    Autonomous mission planning tools
                    drwxr-xr-x  threat-viz/         [DONE]    Real-time threat visualization
                    drwxr-xr-x  network-ids/        [DONE]    ML-based intrusion detection
                    drwxr-xr-x  siem-wazuh/         [DONE]    Open-source SIEM deployment
                    -rw-r--r--  portfolio/           [ACTIVE]  This site (Spring Boot + HTMX)

                    8 items | 3 active | 5 completed""";

            case "cat skills.json" -> """
                    {
                      "languages": {
                        "primary":    ["Java (Swing, JavaFX)"],
                        "secondary":  ["C# (WPF)", "SQL"],
                        "working":    ["Python"]
                      },
                      "frameworks": {
                        "backend":    ["Spring Boot"],
                        "desktop":    ["JavaFX", "Java Swing", "WPF (.NET)"]
                      },
                      "domains": [
                        "Fixed Income / Trading",
                        "Defense & Aerospace",
                        "Performance Optimization",
                        "Mission-Critical Systems"
                      ],
                      "tools": ["Git", "IntelliJ IDEA", "Jira", "Linux (RHEL)"],
                      "practices": [
                        "Performance Profiling",
                        "Production Debugging",
                        "Release Management",
                        "End-User Training"
                      ]
                    }""";

            case "experience" -> """
                    ┌─ CAREER TIMELINE ────────────────────────────────┐
                    │                                                  │
                    │  ● Software Engineer                             │
                    │    SoftSolutions! S.r.l. — Bergamo, Italy        │
                    │    Sep 2025 — Present                            │
                    │    Fixed Income trading platform optimization    │
                    │                                                  │
                    │  ○ Software Engineer (Assistant Manager)         │
                    │    NESCOM — Islamabad, Pakistan                  │
                    │    Aug 2023 — Sep 2025                           │
                    │    UAV/AUV/USV mission-critical systems          │
                    │                                                  │
                    └──────────────────────────────────────────────────┘""";

            case "education" -> """
                    BS Computer Science
                    PIEAS — Pakistan Institute of Engineering & Applied Sciences
                    Islamabad, Pakistan
                    2019 — 2023 | CGPA 3.70

                    HSSC Pre-Engineering
                    Pak-Turk Maarif Int'l College, Islamabad
                    2017 — 2019 | 84%""";

            case "contact" -> """
                    ┌─ CONTACT ───────────────────────────────────────┐
                    │  Email:    jawadali.pieas@gmail.com              │
                    │  Phone:    (+92) 335 5668145                     │
                    │  LinkedIn: linkedin.com/in/jawadali21/           │
                    │  Location: Bergamo, Italy                        │
                    └─────────────────────────────────────────────────┘""";

            case "java --version", "java -version" -> """
                    java 21.0.2 2024-01-16 LTS
                    Java(TM) SE Runtime Environment (build 21.0.2+13-LTS-58)
                    Java HotSpot(TM) 64-Bit Server VM (build 21.0.2+13-LTS-58)

                    // Yes, this portfolio runs on Java 21 + Spring Boot 3.2
                    // Because the portfolio IS the proof.""";

            case "uptime" -> {
                long uptimeMs = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
                long seconds = uptimeMs / 1000;
                long minutes = seconds / 60;
                long hours = minutes / 60;
                yield String.format("up %dh %dm %ds | JVM uptime | Spring Boot 3.2",
                        hours, minutes % 60, seconds % 60);
            }

            case "date" -> LocalDateTime.now().format(
                    DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss yyyy"));

            case "neofetch" -> """
                           ___          jawad@portfolio
                          / _ \\         ──────────────────
                         | | | |        OS:      Spring Boot 3.2.5
                         | | | |        Kernel:  Java 21 (LTS)
                         | |_| |        Shell:   Thymeleaf + HTMX
                          \\___/         UI:      Tailwind CSS
                                        WM:      Vanilla JavaScript
                    ──────────────       Uptime:  Always Online
                    Portfolio v3.0      Terminal: This thing right here
                                        Packages: 3 (Maven)
                                        CPU:     100% passion""";

            case "matrix" -> "__MATRIX__";

            case "clear" -> "__CLEAR__";

            case "sudo hire jawad" -> """

                    ████████████████████████████████████████
                    █                                      █
                    █   ACCESS GRANTED                     █
                    █                                      █
                    █   Great choice.                      █
                    █   Let's build something amazing.     █
                    █                                      █
                    █   → jawadali.pieas@gmail.com          █
                    █                                      █
                    ████████████████████████████████████████""";

            default -> "Command not found: " + cmd + "\nType 'help' for available commands.";
        };
    }
}
