package com.schoolsaas.platform.common;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.function.Consumer;

/**
 * Shared CRUD skeleton for the Phase 8 content modules (notices, events,
 * news, teachers, gallery, testimonials, facilities, downloads) - eight
 * modules that are structurally identical (tenant-scoped list/create/
 * update/delete) but differ only in their entity's fields. Extracting this
 * base avoids writing the same five methods eight times; each concrete
 * entity's own Java file still defines its own fields, DTOs, and a thin
 * subclass of this constructor-only.
 *
 * Every method is implicitly tenant-scoped via the Hibernate tenantFilter,
 * same as every other TenantOwnedEntity repository in this codebase.
 */
public abstract class AbstractTenantContentService<T extends TenantOwnedEntity> {

    protected final JpaRepository<T, Long> repository;
    private final Sort defaultSort;

    protected AbstractTenantContentService(JpaRepository<T, Long> repository, Sort defaultSort) {
        this.repository = repository;
        this.defaultSort = defaultSort;
    }

    public List<T> list() {
        return repository.findAll(defaultSort);
    }

    public T getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException(entityName() + " " + id + " not found"));
    }

    public T create(T entity) {
        return repository.save(entity);
    }

    public T update(Long id, Consumer<T> applyChanges) {
        T entity = getById(id);
        applyChanges.accept(entity);
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.delete(getById(id));
    }

    private String entityName() {
        return getClass().getSimpleName().replace("Service", "");
    }
}
