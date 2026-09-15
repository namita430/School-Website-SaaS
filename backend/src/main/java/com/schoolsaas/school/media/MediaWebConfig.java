package com.schoolsaas.school.media;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves uploaded files straight off the local filesystem at
 * app.media.public-url-prefix (default "/media"). Public and unauthenticated
 * by design (also allowed in SecurityConfig) - these URLs get embedded
 * directly into published public pages, so they need to load in a
 * visitor's browser with no token.
 */
@Configuration
@EnableConfigurationProperties(MediaProperties.class)
public class MediaWebConfig implements WebMvcConfigurer {

    private final MediaProperties properties;

    public MediaWebConfig(MediaProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + properties.getStorageDir().replaceAll("/+$", "") + "/";
        registry.addResourceHandler(properties.getPublicUrlPrefix() + "/**")
                .addResourceLocations(location);
    }
}
