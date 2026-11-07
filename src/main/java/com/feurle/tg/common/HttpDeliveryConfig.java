// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import java.util.concurrent.TimeUnit;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cache headers for what Spring Boot serves itself, the frontend included
 * (docs/adr/0001-single-container-deployment.md). Kept in code because the two paths need different
 * policies, which the spring.web.resources.cache properties cannot express. Compression is set in
 * application.yaml.
 */
@Configuration
class HttpDeliveryConfig implements WebMvcConfigurer {

  /**
   * Vite puts a content hash into every file name under {@code /assets/}, so a changed file gets a
   * new URL and the old one may stay cached for a year. Everything else ({@code index.html},
   * favicons) is revalidated on each visit (304 via Last-Modified) instead of Spring Security's
   * default "no-store", which would also keep pages out of the back/forward cache. API responses
   * are not affected and keep "no-store".
   */
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler("/assets/**")
        .addResourceLocations("classpath:/static/assets/")
        .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable());
    registry
        .addResourceHandler("/**")
        .addResourceLocations("classpath:/static/")
        .setCacheControl(CacheControl.noCache());
  }
}
