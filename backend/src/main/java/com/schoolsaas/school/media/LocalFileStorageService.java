package com.schoolsaas.school.media;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/**
 * Writes uploaded files to a local directory, keyed by school id, and
 * serves them back via the static resource handler registered in
 * {@link MediaWebConfig}. Storage key format: "{schoolId}/{uuid}.{ext}" -
 * the school id prefix keeps one tenant's files from colliding with
 * another's even though the filesystem itself has no tenant-filter
 * equivalent to Hibernate's (a real object-storage backend would use the
 * same key scheme, just against a bucket instead of a local directory).
 */
@Service
public class LocalFileStorageService implements StorageService {

    private final MediaProperties properties;

    public LocalFileStorageService(MediaProperties properties) {
        this.properties = properties;
    }

    @Override
    public StorageResult store(MultipartFile file, Long schoolId) throws IOException {
        String extension = extensionOf(file.getOriginalFilename());
        String storageKey = schoolId + "/" + UUID.randomUUID() + extension;

        Path target = Path.of(properties.getStorageDir()).resolve(storageKey).normalize();
        Files.createDirectories(target.getParent());
        file.transferTo(target);

        String url = properties.getPublicUrlPrefix() + "/" + storageKey;
        return new StorageResult(storageKey, url);
    }

    @Override
    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(Path.of(properties.getStorageDir()).resolve(storageKey).normalize());
        } catch (IOException e) {
            // A failed local delete leaves an orphaned file but must not
            // block deleting the database row - the row is the source of
            // truth for what the app considers to exist.
        }
    }

    private String extensionOf(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dot = originalFilename.lastIndexOf('.');
        return dot >= 0 ? originalFilename.substring(dot) : "";
    }
}
