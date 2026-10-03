// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Limits how often one client may submit the public forms (message, appointment, referral,
 * questionnaire). Each submission can trigger e-mails, so unlimited posting would let anyone use
 * the site to spam the practice or third parties. The limit is per client address (behind the proxy
 * the real address comes from {@code X-Forwarded-For}) and kept in memory, so it resets on restart.
 */
@Slf4j
@Component
public class PublicFormRateLimitFilter extends OncePerRequestFilter {

  private static final Set<String> LIMITED_PATHS =
      Set.of(
          "/api/contact/message",
          "/api/contact/appointment",
          "/api/contact/referral",
          "/api/questionnaire");

  /** Above this many tracked clients, expired entries are swept so the map cannot grow forever. */
  private static final int SWEEP_THRESHOLD = 10_000;

  private final int maxRequests;
  private final Duration window;
  private final Clock clock;
  private final ConcurrentHashMap<String, Deque<Instant>> hitsByClient = new ConcurrentHashMap<>();

  @Autowired
  public PublicFormRateLimitFilter(
      @Value("${app.rate-limit.max-requests:5}") int maxRequests,
      @Value("${app.rate-limit.window:10m}") Duration window) {
    this(maxRequests, window, Clock.systemUTC());
  }

  PublicFormRateLimitFilter(int maxRequests, Duration window, Clock clock) {
    this.maxRequests = maxRequests;
    this.window = window;
    this.clock = clock;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !"POST".equals(request.getMethod()) || !LIMITED_PATHS.contains(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    Instant now = clock.instant();
    long retryAfterSeconds = tryAcquire(request.getRemoteAddr(), now);
    if (retryAfterSeconds > 0) {
      log.warn(
          "rate limit exceeded for {} on {}", request.getRemoteAddr(), request.getRequestURI());
      response.setStatus(429);
      response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
      response.setContentType("application/json");
      response.setCharacterEncoding(StandardCharsets.UTF_8.name());
      response
          .getWriter()
          .write(
              "{\"status\":429,\"error\":\"Too Many Requests\","
                  + "\"message\":\"Zu viele Anfragen. Bitte versuchen Sie es später erneut.\"}");
      return;
    }
    chain.doFilter(request, response);
  }

  /** Returns 0 if the request is allowed, otherwise the seconds until the client may retry. */
  private long tryAcquire(String client, Instant now) {
    if (hitsByClient.size() > SWEEP_THRESHOLD) {
      sweep(now);
    }
    Deque<Instant> hits = hitsByClient.computeIfAbsent(client, key -> new ArrayDeque<>());
    synchronized (hits) {
      Instant cutoff = now.minus(window);
      while (!hits.isEmpty() && !hits.peekFirst().isAfter(cutoff)) {
        hits.pollFirst();
      }
      if (hits.size() >= maxRequests) {
        return Math.max(1, Duration.between(now, hits.peekFirst().plus(window)).toSeconds());
      }
      hits.addLast(now);
      return 0;
    }
  }

  private void sweep(Instant now) {
    Instant cutoff = now.minus(window);
    hitsByClient.entrySet().removeIf(entry -> isExpired(entry.getValue(), cutoff));
  }

  private static boolean isExpired(Deque<Instant> hits, Instant cutoff) {
    synchronized (hits) {
      return hits.isEmpty() || !hits.peekLast().isAfter(cutoff);
    }
  }
}
