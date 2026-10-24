// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Spring Boot serves the React app itself (docs/adr/0001-single-container-deployment.md), so
 * client-side routes like {@code /treatments} must fall back to {@code index.html} on reload or
 * deep link. Paths with a file extension and the backend prefixes are left alone. Keep the
 * exclusions in sync with {@code SecurityConfig.SPA_ROUTE_REGEX}.
 */
@Controller
class SpaForwardController {

  @GetMapping({
    "/{path:^(?!api$|actuator$|assets$|v3$|swagger-ui$)[^.]*}",
    "/{path:^(?!api$|actuator$|assets$|v3$|swagger-ui$)[^.]*}/**"
  })
  String forwardToIndex() {
    return "forward:/index.html";
  }
}
