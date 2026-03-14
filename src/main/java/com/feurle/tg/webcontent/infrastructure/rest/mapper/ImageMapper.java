// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.mapper;

import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.infrastructure.rest.dto.ImageResponse;
import org.springframework.stereotype.Component;

@Component
public class ImageMapper {

  public ImageResponse toResponse(Image image) {
    return new ImageResponse(
        image.getId(), image.getFileName(), image.getMimeType(), image.getCreatedAt());
  }
}
