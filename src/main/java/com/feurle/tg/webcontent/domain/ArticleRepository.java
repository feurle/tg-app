package com.feurle.tg.webcontent.domain;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository {
    List<Article> findAll();
    List<Article> findByPage(PageType page);
    List<Article> findByPageAndState(PageType page, ArticleState state);
    Optional<Article> findById(Long id);
    Article save(Article article);
    void deleteById(Long id);
}