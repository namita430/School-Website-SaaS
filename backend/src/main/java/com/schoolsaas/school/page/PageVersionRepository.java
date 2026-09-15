package com.schoolsaas.school.page;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PageVersionRepository extends JpaRepository<PageVersion, Long> {
    Optional<PageVersion> findByPageIdAndStatus(Long pageId, PageVersionStatus status);
}
