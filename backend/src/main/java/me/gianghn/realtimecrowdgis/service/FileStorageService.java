// BlobId = bucket name + object name (unique identifier)
// BlobInfo = BlobId + all metadata (content type, custom headers, etc.)
package me.gianghn.realtimecrowdgis.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import me.gianghn.realtimecrowdgis.exception.specify.FileIOException;
import me.gianghn.realtimecrowdgis.exception.specify.InvalidFile;
import me.gianghn.realtimecrowdgis.utils.ImageHelper;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final Storage storage;
    private final ImageHelper imageHelper;

    @Value("${app.gcp.bucket-name}")
    private String bucketName;

    private final long MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;
    private final Set<String> VALID_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg");

    private String uploadFile(MultipartFile file, String folderName, String reportFolder) {
        String fileName = UUID.randomUUID() + extractFileExtension(file.getOriginalFilename());

        String objectName = String.format("%s/%s/%s", folderName, reportFolder, fileName);

        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                                    .setContentType(file.getContentType())
                                    .build();
        try {
            byte[] content = null;
            if (file.getSize() > MAX_IMAGE_SIZE_IN_BYTES) {
                content = imageHelper.compressImage(file, MAX_IMAGE_SIZE_IN_BYTES);
            } else {
                content = file.getBytes();
            }
            storage.create(blobInfo, content);
            return objectName;
        } catch (IOException e) {
            throw new FileIOException("Failed to read file data");
        }
    }

    private boolean deleteFile(String objectName) {
        BlobId blobId = BlobId.of(bucketName, objectName);
        return storage.delete(blobId);
    }


    public List<String> uploadFiles(List<MultipartFile> files, String folderName, String reportFolder) {
        List<Future<String>> futures = new ArrayList<>();
        List<String> successfulUploads = new ArrayList<>();

        try (ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
            // Assign task for virtual thread
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    futures.add(virtualExecutor.submit(() -> uploadFile(file,
                                                                        folderName,
                                                                        reportFolder)
                    ));
                }
            }

            for (Future<String> future : futures) {
                successfulUploads.add(future.get());
            }

            return successfulUploads;
        } catch (InterruptedException | ExecutionException e) {
            // Rollback
            if (!successfulUploads.isEmpty()) {
                deleteFiles(successfulUploads);
            }

            throw new RuntimeException("Failed to upload files: " + e.getMessage());
        }
    }

    public void deleteFiles(List<String> objectNames) {
        if (objectNames == null || objectNames.isEmpty()) return;
        try (ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (String objectName : objectNames) {
                virtualExecutor.submit(() -> {
                    try {
                        deleteFile(objectName);
                    } catch (Exception e) {
                        System.err.println("Failed to delete file: " + objectName + ", error: " + e.getMessage());
                    }
                });
            }
        }
    }

    private @NonNull String extractFileExtension(String originalFilename) {
        String extension;
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new InvalidFile("Invalid or empty filename");
        }

        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex == -1 || dotIndex == originalFilename.length() - 1) {
            throw new InvalidFile("Missing extension of filename");
        }

        extension = originalFilename.substring(dotIndex).toLowerCase();
        if (!VALID_IMAGE_EXTENSIONS.contains(extension)) {
            throw new InvalidFile("Unsupported file extension");
        }
        return extension;
    }
}
