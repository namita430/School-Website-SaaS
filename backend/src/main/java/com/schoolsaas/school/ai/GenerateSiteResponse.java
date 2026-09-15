package com.schoolsaas.school.ai;

import java.util.List;

public record GenerateSiteResponse(List<String> createdPageSlugs, List<String> skippedPageSlugs, boolean themeApplied) {
}
