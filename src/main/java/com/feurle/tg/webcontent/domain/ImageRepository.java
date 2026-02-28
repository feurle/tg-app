package com.feurle.tg.webcontent.domain;

import java.util.List;
import java.util.Optional;

public interface ImageRepository {
    List<Image> findAll();
    Optional<Image> findById(Long id);
    List<Image> findAllById(Iterable<Long> ids);
    Image save(Image image);
    void deleteById(Long id);
}