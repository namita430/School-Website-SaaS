package com.schoolsaas.school.media;

import java.time.Instant;

public record MediaAssetResponse(Long id, String fileName, String url, String contentType, long sizeBytes, Instant createdAt) {
    static MediaAssetResponse from(MediaAsset asset) {
        return new MediaAssetResponse(asset.getId(), asset.getFileName(), asset.getUrl(), asset.getContentType(), asset.getSizeBytes(), asset.getCreatedAt());
    }
}
