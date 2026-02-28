package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ImageRepository imageRepository;

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
                                 LocalDateTime publishedDate, List<Long> imageIds) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + id));

        article.setTitle(title);
        article.setContent(content);
        article.setState(state);
        article.setPublishedDate(publishedDate);

        if (imageIds != null) {
            article.setImages(imageIds.isEmpty() ? List.of() : imageRepository.findAllById(imageIds));
        }

        return articleRepository.save(article);
    }

    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }
}