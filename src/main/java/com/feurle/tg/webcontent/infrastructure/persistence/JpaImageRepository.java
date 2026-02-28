package com.feurle.tg.webcontent.infrastructure.persistence;

import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.ImageRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaImageRepository extends JpaRepository<Image, Long>, ImageRepository {
}