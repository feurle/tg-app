package com.feurle.tg.webcontent.infrastructure.config;

import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebContentConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToLanguageConverter());
        registry.addConverter(new StringToPageTypeConverter());
    }

    public static class StringToLanguageConverter implements org.springframework.core.convert.converter.Converter<String, Language> {
        @Override
        public Language convert(String source) {
            if (source == null || source.isBlank()) {
                return null;
            }

            return switch (source.toUpperCase()) {
                case "DE", "GERMAN" -> Language.GERMAN;
                case "EN", "ENGLISH" -> Language.ENGLISH;
                case "SV", "SWEDISH" -> Language.SWEDISH;
                case "RU", "RUSSIAN" -> Language.RUSSIAN;
                default -> throw new IllegalArgumentException("Unknown language: " + source);
            };
        }
    }

    public static class StringToPageTypeConverter implements org.springframework.core.convert.converter.Converter<String, PageType> {
        @Override
        public PageType convert(String source) {
            if (source == null || source.isBlank()) {
                return null;
            }

            try {
                return PageType.valueOf(source.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Unknown page type: " + source);
            }
        }
    }
}