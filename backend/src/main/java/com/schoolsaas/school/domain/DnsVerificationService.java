package com.schoolsaas.school.domain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

/**
 * Performs a real DNS TXT record lookup - not a stub - using the JDK's
 * built-in DNS service provider (com.sun.jndi.dns), which ships with every
 * JDK and needs no extra dependency. Verification convention: the school
 * must publish a TXT record at {@code _schoolsaas-verify.<domain>} whose
 * value is the domain's verification_token (see Domain entity).
 *
 * This genuinely queries the public DNS system over the network, so it
 * requires outbound network/DNS access from wherever the backend runs.
 */
@Service
public class DnsVerificationService {

    private static final Logger log = LoggerFactory.getLogger(DnsVerificationService.class);
    private static final String TXT_PREFIX = "_schoolsaas-verify.";

    public boolean verifyTxtRecord(String domain, String expectedToken) {
        String hostname = TXT_PREFIX + domain;
        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.dns.DnsContextFactory");

        try {
            InitialDirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(hostname, new String[]{"TXT"});
            Attribute txt = attrs.get("TXT");
            if (txt == null) {
                return false;
            }
            for (int i = 0; i < txt.size(); i++) {
                String value = stripQuotes(String.valueOf(txt.get(i)));
                if (expectedToken.equals(value)) {
                    return true;
                }
            }
            return false;
        } catch (NamingException e) {
            // No TXT record found, NXDOMAIN, DNS server unreachable, etc. -
            // all just mean "not verified yet", not a server error.
            log.debug("DNS TXT lookup for {} did not resolve/match: {}", hostname, e.getMessage());
            return false;
        }
    }

    /** Suggested record for the DNS instructions shown to the school admin. */
    public String txtRecordNameFor(String domain) {
        return TXT_PREFIX + domain;
    }

    private static String stripQuotes(String value) {
        return value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")
                ? value.substring(1, value.length() - 1)
                : value;
    }
}
