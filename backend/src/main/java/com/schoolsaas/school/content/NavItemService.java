package com.schoolsaas.school.content;

import com.schoolsaas.platform.common.AbstractTenantContentService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/** Public, unlike its siblings in NavItem.java - PublicSiteService (a different package) reuses it for the public nav fallback. */
@Service
public class NavItemService extends AbstractTenantContentService<NavItem> {
    NavItemService(NavItemRepository repository) {
        super(repository, Sort.by(Sort.Direction.ASC, "sortOrder"));
    }
}
