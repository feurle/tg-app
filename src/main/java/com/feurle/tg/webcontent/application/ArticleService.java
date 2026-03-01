package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.*;
import com.feurle.tg.webcontent.domain.enumeration.ArticleState;
import com.feurle.tg.webcontent.domain.enumeration.PageType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ImageRepository imageRepository;

    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    public List<Article> getArticlesByPage(PageType page) {
        return articleRepository.findByPage(page);
    }

    public List<Article> getPublishedArticlesByPage(PageType page) {
        return articleRepository.findByPageAndState(page, ArticleState.PUBLISHED);
    }

    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));
    }

    public Article createArticle(String title, String content, PageType page, List<Long> imageIds) {
        Article article = new Article();
        article.setTitle(title);
        article.setContent(content);
        article.setPage(page);
        article.setState(ArticleState.CREATED);

        if (imageIds != null && !imageIds.isEmpty()) {
            article.setImages(imageRepository.findAllById(imageIds));
        }

        return articleRepository.save(article);
    }

    public Article updateArticle(Long id, String title, String content, ArticleState state,
                                 List<Long> imageIds) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));

        article.setTitle(title);
        article.setContent(content);

        // Auto-set publishedDate when transitioning to PUBLISHED status
        if (state == ArticleState.PUBLISHED && article.getState() != ArticleState.PUBLISHED) {
            article.setPublishedDate(LocalDateTime.now());
        }

        article.setState(state);

        if (imageIds != null) {
            article.setImages(imageIds.isEmpty() ? new ArrayList<>() : imageRepository.findAllById(imageIds));
        }

        return articleRepository.save(article);
    }

    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }
}