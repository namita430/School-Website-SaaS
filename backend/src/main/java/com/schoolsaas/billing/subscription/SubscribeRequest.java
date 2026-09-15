package com.schoolsaas.billing.subscription;

import jakarta.validation.constraints.NotNull;

public record SubscribeRequest(@NotNull Long planId) {
}
