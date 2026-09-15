package com.schoolsaas.school.content;

import com.schoolsaas.platform.common.AbstractTenantContentService;
import com.schoolsaas.platform.common.NotFoundException;
import com.schoolsaas.platform.common.TenantOwnedEntity;
import com.schoolsaas.platform.tenant.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

/** See Notice.java for why this whole module lives in one file. */
@Getter
@Setter
@Entity
@Table(name = "events")
public class Event extends TenantOwnedEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_date")
    private LocalDate eventDate;

    private String location;
}

interface EventRepository extends JpaRepository<Event, Long> {
}

@Service
class EventService extends AbstractTenantContentService<Event> {
    EventService(EventRepository repository) {
        super(repository, Sort.by(Sort.Direction.ASC, "eventDate"));
    }
}

record CreateEventRequest(@NotBlank @Size(max = 255) String title, String description, LocalDate eventDate, String location) {
}

record UpdateEventRequest(@NotBlank @Size(max = 255) String title, String description, LocalDate eventDate, String location) {
}

record EventResponse(Long id, String title, String description, LocalDate eventDate, String location, Instant createdAt, Instant updatedAt) {
    static EventResponse from(Event e) {
        return new EventResponse(e.getId(), e.getTitle(), e.getDescription(), e.getEventDate(), e.getLocation(), e.getCreatedAt(), e.getUpdatedAt());
    }
}

@RestController
@RequestMapping("/api/v1/events")
class EventController {

    private static final String HAS_SCHOOL = "authentication.principal.schoolId != null and ";

    private final EventService service;

    EventController(EventService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_EVENT_CREATE')")
    ResponseEntity<EventResponse> create(@Valid @RequestBody CreateEventRequest req) {
        Event e = new Event();
        e.setTitle(req.title());
        e.setDescription(req.description());
        e.setEventDate(req.eventDate());
        e.setLocation(req.location());
        return ResponseEntity.status(HttpStatus.CREATED).body(EventResponse.from(service.create(e)));
    }

    @GetMapping
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    List<EventResponse> list() {
        return service.list().stream().map(EventResponse::from).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_WEBSITE_VIEW')")
    EventResponse get(@PathVariable Long id) {
        return EventResponse.from(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_EVENT_EDIT')")
    EventResponse update(@PathVariable Long id, @Valid @RequestBody UpdateEventRequest req) {
        return EventResponse.from(service.update(id, e -> {
            e.setTitle(req.title());
            e.setDescription(req.description());
            e.setEventDate(req.eventDate());
            e.setLocation(req.location());
        }));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(HAS_SCHOOL + "hasAuthority('PERM_EVENT_EDIT')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

/** See NoticePublicController for why the tenant guard here is not optional. */
@RestController
@RequestMapping("/api/v1/public/events")
class EventPublicController {

    private final EventService service;

    EventPublicController(EventService service) {
        this.service = service;
    }

    @GetMapping
    List<EventResponse> list(@RequestParam(defaultValue = "6") int limit) {
        if (!TenantContext.hasTenant()) {
            throw new NotFoundException("Site not found");
        }
        return service.list().stream().limit(limit).map(EventResponse::from).toList();
    }
}
