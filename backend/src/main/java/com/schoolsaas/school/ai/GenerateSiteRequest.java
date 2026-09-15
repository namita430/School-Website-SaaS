package com.schoolsaas.school.ai;

/** All fields optional - the generator falls back to sensible defaults for anything omitted. */
public record GenerateSiteRequest(String schoolType, String location, String style, String primaryColor) {
}
