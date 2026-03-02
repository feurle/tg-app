package com.feurle.tg.user.infrastructure.config;

import com.feurle.tg.user.application.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(authenticationProvider());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authenticationProvider(authenticationProvider());

        http.authorizeHttpRequests(authz -> authz
            // Static frontend assets
            .requestMatchers("/", "/index.html", "/assets/**", "/*.png", "/*.svg", "/*.ico").permitAll()
            // H2 Console (dev only)
            .requestMatchers("/h2-console/**").permitAll()
            // Authentication endpoints
            .requestMatchers("/api/auth/**").permitAll()
            // Public API: read articles and download images
            .requestMatchers(HttpMethod.GET, "/api/webcontent/articles/page/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/webcontent/images/**").permitAll()
            // All other requests require authentication
            .anyRequest().authenticated()
        );

        http.csrf(csrf -> csrf.disable());
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));
        http.formLogin(form -> form.disable());
        http.httpBasic(basic -> basic.disable());

        return http.build();
    }
}

