package com.schoolsaas.school.media;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Storage backend abstraction - per architecture principle #21, files are
 * never stored in MySQL, and the application should be designed for object
 * storage. {@link LocalFileStorageService} is the only implementation today
 * (this dev environment has neither Docker nor cloud credentials available
 * to run MinIO/S3 against), but every caller (MediaAssetService) depends
 * only on this interface - swapping in a real S3-backed implementation
 * later is a new @Service class, not a rewrite of the upload/delete flow.
 */
public interface StorageService {

    StorageResult store(MultipartFile file, Long schoolId) throws IOException;

    void delete(String storageKey);

    record StorageResult(String storageKey, String url) {
    }
}
