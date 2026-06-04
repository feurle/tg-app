// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.admin.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(
            authz ->
                authz
                    // SBA SPA static assets
                    .requestMatchers("/assets/**").permitAll()
                    // SBA client registration/deregistration — internal Docker network only
                    .requestMatchers(HttpMethod.POST, "/instances").permitAll()
                    .requestMatchers(HttpMethod.DELETE, "/instances/**").permitAll()
                    // Health check for nginx-proxy / load balancer
                    .requestMatchers("/actuator/health").permitAll()
                    .anyRequest().authenticated())
        .httpBasic(withDefaults())
        .csrf(csrf -> csrf.disable());

    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public UserDetailsService userDetailsService(
      @Value("${admin.username:admin}") String username,
      @Value("${admin.password:admin}") String password,
      PasswordEncoder encoder) {
    return new InMemoryUserDetailsManager(
        User.builder()
            .username(username)
            .password(encoder.encode(password))
            .roles("ADMIN")
            .build());
  }
}
