package com.feurle.tg.webcontent.domain;

import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.Language;
import com.feurle.tg.webcontent.domain.enumeration.PageType;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository {
    List<Article> findAll();
    List<Article> findByPage(PageType page);
    List<Article> findByPageAndState(PageType page, ArticleState state);
    List<Article> findByPageAndStateAndLanguage(PageType page, ArticleState state, Language language);
    Optional<Article> findById(Long id);
    Article save(Article article);
    void deleteById(Long id);
}