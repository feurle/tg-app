// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.ImageRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

  @Mock ImageRepository imageRepository;

  @InjectMocks ImageService imageService;

  // ========== upload ==========

  @Test
  void upload_savesImageAndReturnsIt() {
    byte[] data = "image-bytes".getBytes();
    Image saved = new Image();
    saved.setImageData(data);
    saved.setFileName("photo.jpg");
    saved.setMimeType("image/jpeg");

    when(imageRepository.save(any(Image.class))).thenReturn(saved);

    Image result = imageService.upload(data, "photo.jpg", "image/jpeg", "Title");

    assertThat(result.getFileName()).isEqualTo("photo.jpg");
    assertThat(result.getMimeType()).isEqualTo("image/jpeg");
    assertThat(result.getImageData()).isEqualTo(data);
    verify(imageRepository).save(any(Image.class));
  }

  @Test
  void upload_throwsWhenDataIsNull() {
    assertThatThrownBy(() -> imageService.upload(null, "photo.jpg", "image/jpeg", "Title"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Image data cannot be empty");

    verifyNoInteractions(imageRepository);
  }

  @Test
  void upload_throwsWhenDataIsEmpty() {
    assertThatThrownBy(() -> imageService.upload(new byte[0], "photo.jpg", "image/jpeg", "Title"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Image data cannot be empty");

    verifyNoInteractions(imageRepository);
  }

  // ========== getImage ==========

  @Test
  void getImage_returnsImageWhenFound() {
    Image image = new Image();
    image.setFileName("photo.jpg");
    when(imageRepository.findById(1L)).thenReturn(Optional.of(image));

    Image result = imageService.getImage(1L);

    assertThat(result.getFileName()).isEqualTo("photo.jpg");
  }

  @Test
  void getImage_throwsWhenNotFound() {
    when(imageRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> imageService.getImage(99L))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Image not found: 99");
  }

  // ========== deleteImage ==========

  @Test
  void deleteImage_delegatesToRepository() {
    imageService.deleteImage(1L);

    verify(imageRepository).deleteById(1L);
  }
}
