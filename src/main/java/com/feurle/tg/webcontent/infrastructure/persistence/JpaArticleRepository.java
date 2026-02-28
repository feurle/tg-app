package com.feurle.tg.webcontent.infrastructure.persistence;

import com.feurle.tg.webcontent.domain.Article;
import com.feurle.tg.webcontent.domain.ArticleRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaArticleRepository extends JpaRepository<Article, Long>, ArticleRepository {
}