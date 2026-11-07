// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.ImageRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class ImageService {

  /**
   * Images are served publicly with their stored type, so only raster formats are accepted. SVG and
   * HTML could run script on our own origin.
   */
  static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

  private final ImageRepository imageRepository;

  public List<Image> getAllImages() {
    return imageRepository.findAll();
  }

  public Image upload(byte[] data, String fileName, String mimeType, String title) {
    if (data == null || data.length == 0) {
      throw new IllegalArgumentException("Image data cannot be empty");
    }
    if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
      throw new IllegalArgumentException("Unsupported image type: " + mimeType);
    }

    Image image = new Image();
    image.setImageData(data);
    image.setFileName(fileName);
    image.setMimeType(mimeType);
    image.setTitle(title);

    return imageRepository.save(image);
  }

  public Image getImage(Long id) {
    return imageRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Image not found: " + id));
  }

  public Image updateImage(Long id, String title) {
    Image image = getImage(id);
    image.setTitle(title);
    return imageRepository.save(image);
  }

  public void deleteImage(Long id) {
    imageRepository.deleteById(id);
  }
}
