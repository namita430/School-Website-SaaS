package com.schoolsaas.platform.tenant;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.public-site")
public class PublicSiteProperties {

    /** e.g. "yoursaas.com" - a request Host of "abcschool.yoursaas.com" resolves to school slug "abcschool". */
    private String baseDomain;

    public String getBaseDomain() {
        return baseDomain;
    }

    public void setBaseDomain(String baseDomain) {
        this.baseDomain = baseDomain;
    }
}
