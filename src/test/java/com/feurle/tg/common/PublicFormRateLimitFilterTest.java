// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class PublicFormRateLimitFilterTest {

  /** Clock the test can move forward. */
  private static final class MutableClock extends Clock {
    private Instant now = Instant.parse("2026-10-03T10:00:00Z");

    void advance(Duration duration) {
      now = now.plus(duration);
    }

    @Override
    public java.time.ZoneId getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return now;
    }
  }

  private final MutableClock clock = new MutableClock();
  private final PublicFormRateLimitFilter filter =
      new PublicFormRateLimitFilter(2, Duration.ofMinutes(10), clock);

  private MockHttpServletResponse send(String method, String path, String client) throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest(method, path);
    request.setRemoteAddr(client);
    MockHttpServletResponse response = new MockHttpServletResponse();
    filter.doFilter(request, response, new MockFilterChain());
    return response;
  }

  @Test
  void allowsRequestsUpToTheLimitThenRejectsWithRetryAfter() throws Exception {
    assertThat(send("POST", "/api/contact/message", "1.1.1.1").getStatus()).isEqualTo(200);
    assertThat(send("POST", "/api/contact/referral", "1.1.1.1").getStatus()).isEqualTo(200);

    MockHttpServletResponse blocked = send("POST", "/api/questionnaire", "1.1.1.1");

    assertThat(blocked.getStatus()).isEqualTo(429);
    assertThat(blocked.getHeader("Retry-After")).isEqualTo("600");
    assertThat(blocked.getContentAsString()).contains("Zu viele Anfragen");
  }

  @Test
  void countsEachClientSeparately() throws Exception {
    send("POST", "/api/contact/message", "1.1.1.1");
    send("POST", "/api/contact/message", "1.1.1.1");

    assertThat(send("POST", "/api/contact/message", "2.2.2.2").getStatus()).isEqualTo(200);
  }

  @Test
  void allowsAgainOnceTheWindowHasPassed() throws Exception {
    send("POST", "/api/contact/appointment", "1.1.1.1");
    send("POST", "/api/contact/appointment", "1.1.1.1");
    assertThat(send("POST", "/api/contact/appointment", "1.1.1.1").getStatus()).isEqualTo(429);

    clock.advance(Duration.ofMinutes(11));

    assertThat(send("POST", "/api/contact/appointment", "1.1.1.1").getStatus()).isEqualTo(200);
  }

  @Test
  void ignoresReadsAndOtherEndpoints() throws Exception {
    for (int i = 0; i < 5; i++) {
      assertThat(send("GET", "/api/questionnaire", "1.1.1.1").getStatus()).isEqualTo(200);
      assertThat(send("POST", "/api/auth/login", "1.1.1.1").getStatus()).isEqualTo(200);
    }
  }
}
