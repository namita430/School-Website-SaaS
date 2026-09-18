package com.schoolsaas.superadmin.school;

import jakarta.validation.constraints.NotNull;

public record AssignPlanRequest(@NotNull Long planId) {
}
