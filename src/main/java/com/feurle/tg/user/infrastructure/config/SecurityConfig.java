// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.config;

import static org.springframework.security.config.Customizer.withDefaults;

import com.feurle.tg.user.application.AppUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  private final AppUserDetailsService userDetailsService;
  private final Environment environment;

  public SecurityConfig(AppUserDetailsService userDetailsService, Environment environment) {
    this.userDetailsService = userDetailsService;
    this.environment = environment;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
    AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);
    builder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    return builder.build();
  }

  /**
   * Health endpoint is fully public — no HTTP Basic so bad credentials don't trigger a 401 even
   * when tg-admin polls with mismatched credentials.
   */
  @Bean
  @Order(1)
  public SecurityFilterChain healthFilterChain(HttpSecurity http) throws Exception {
    http.securityMatcher("/actuator/health")
        .authorizeHttpRequests(authz -> authz.anyRequest().permitAll())
        .csrf(csrf -> csrf.disable());
    return http.build();
  }

  /** Remaining actuator endpoints require ROLE_ADMIN via HTTP Basic so tg-admin can query them. */
  @Bean
  @Order(2)
  public SecurityFilterChain actuatorFilterChain(HttpSecurity http) throws Exception {
    http.securityMatcher("/actuator/**")
        .authorizeHttpRequests(authz -> authz.anyRequest().hasRole("ADMIN"))
        .httpBasic(withDefaults())
        .csrf(csrf -> csrf.disable())
        .headers(headers -> headers.frameOptions(frame -> frame.disable()));
    return http.build();
  }

  /** Main application chain — session-based auth. */
  @Bean
  @Order(3)
  public SecurityFilterChain appFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(
        authz -> {
          authz
              .requestMatchers("/", "/index.html", "/assets/**", "/*.png", "/*.svg", "/*.ico")
              .permitAll()
              .requestMatchers("/api/auth/**")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/auth/me")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/webcontent/articles/page/*/published")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/webcontent/articles/pagetype/*/published")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/webcontent/pages/**")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/webcontent/images/*/download")
              .permitAll()
              .requestMatchers(HttpMethod.POST, "/api/contact/message")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/contact/info")
              .permitAll();
          authz.anyRequest().authenticated();
        });

    http.csrf(csrf -> csrf.disable());
    http.formLogin(form -> form.disable());

    if (isDevProfile()) {
      http.httpBasic(withDefaults());
      http.headers(headers -> headers.frameOptions(frame -> frame.disable()));
    } else {
      http.httpBasic(basic -> basic.disable());
      http.headers(headers -> headers.frameOptions(frame -> frame.disable()));
    }

    return http.build();
  }

  private boolean isDevProfile() {
    for (String profile : environment.getActiveProfiles()) {
      if ("dev".equals(profile)) {
        return true;
      }
    }
    return false;
  }
}
