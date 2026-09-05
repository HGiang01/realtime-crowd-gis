package me.gianghn.realtimecrowdgis.utils;

import me.gianghn.realtimecrowdgis.exception.specify.FileIOException;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class ImageHelper {
    public byte[] compressImage(MultipartFile inputFile, long targetSizeInBytes) {
        long fileSize = inputFile.getSize();

        byte[] compressedBytes = null;
        try {
            if (fileSize <= targetSizeInBytes) {
                return inputFile.getBytes();
            }

            // quality: Compresses image details and colors (lossy compression) without changing its physical size.
            double quality = 0.95;
            // scale: Resizes the image dimensions (width x height), reducing the total number of pixels.
            double scale = 1.0;

            while (fileSize > targetSizeInBytes) {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();

                Thumbnails.of(inputFile.getInputStream())
                          .scale(scale)
                          .outputQuality(quality)
                          .outputFormat("jpg")
                          .toOutputStream(baos);

                compressedBytes = baos.toByteArray();
                fileSize = compressedBytes.length;

                if (quality > 0.30) {
                    quality -= 0.05;
                } else {
                    scale -= 0.1;
                    quality = 0.70;
                }

                // Avoid ìnfinite loop in case of very small target size
                if (scale < 0.1) {
                    break;
                }
            }
        } catch (IOException e) {
            throw new FileIOException("Failed to compress image: " + e.getMessage(), "IMAGE_COMPRESSION_ERROR");
        }

        return compressedBytes;
    }


}
