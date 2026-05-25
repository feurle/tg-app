// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.user.infrastructure.config;

import static org.springframework.security.config.Customizer.withDefaults;

import com.feurle.tg.user.application.AppUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
  // Production/Default profile - Session auth only (no Basic Auth)
  // Note: Use @Profile("!dev") if you want to explicitly exclude dev profile
  // @TODO: refactor to JWT
  // @TODO: use methodLevelSecurity - preAuthorize

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

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // @TODO: fix authetication path for maintainence and admin stuff
    http.authorizeHttpRequests(
        authz -> {
          authz
              // Static frontend assets
              .requestMatchers("/", "/index.html", "/assets/**", "/*.png", "/*.svg", "/*.ico")
              .permitAll()
              .requestMatchers("/actuator/health")
              .permitAll()
              // Authentication endpoints
              .requestMatchers("/api/auth/**")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/auth/me")
              .permitAll()
              // Public API: read pages, articles and download images
              .requestMatchers(HttpMethod.GET, "/api/webcontent/articles/**")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/webcontent/pages/**")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/webcontent/images/**")
              .permitAll()
              // Contact form + public contact info
              .requestMatchers(HttpMethod.POST, "/api/contact/message")
              .permitAll()
              .requestMatchers(HttpMethod.GET, "/api/contact/info")
              .permitAll();

          // All other requests require authentication
          authz.anyRequest().authenticated();
        });

    http.csrf(csrf -> csrf.disable());
    http.formLogin(form -> form.disable());

    // Enable Basic Auth only in dev profile for easy curl/Postman testing
    if (isDevOrStageProfile()) {
      http.httpBasic(withDefaults());
      http.headers(headers -> headers.frameOptions(frame -> frame.disable()));
    } else {
      http.httpBasic(basic -> basic.disable());
      http.headers(
          headers ->
              headers.frameOptions(frame -> frame.disable())); // X-Frame-Options deaktivieren
      // ODER nur für gleiche Origin erlauben:
      // .frameOptions(frame -> frame.sameOrigin())
    }

    return http.build();
  }

  private boolean isDevOrStageProfile() {
    String[] activeProfiles = environment.getActiveProfiles();
    for (String profile : activeProfiles) {
      if ("dev".equals(profile) || ("stage".equals(profile))) {
        return true;
      }
    }
    return false;
  }
}
