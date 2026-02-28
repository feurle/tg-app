package com.feurle.tg.webcontent.application;

import com.feurle.tg.webcontent.domain.Image;
import com.feurle.tg.webcontent.domain.ImageRepository;
import java.util.List;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class ImageService {

    private final ImageRepository imageRepository;

    public List<Image> getAllImages() {
        return imageRepository.findAll();
    }

    public Image upload(byte[] data, String fileName, String mimeType) {
        if (data == null || data.length == 0) {
            throw new IllegalArgumentException("Image data cannot be empty");
        }

        Image image = new Image();
        image.setImageData(data);
        image.setFileName(fileName);
        image.setMimeType(mimeType);

        return imageRepository.save(image);
    }

    public Image getImage(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Image not found: " + id));
    }

    public void deleteImage(Long id) {
        imageRepository.deleteById(id);
    }
}