package com.schoolsaas.superadmin.plan;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/** The template catalog remains platform-owned; plans only reference allowed IDs. */
public record UpdatePlanTemplatesRequest(@NotNull List<String> templateIds) {
}
