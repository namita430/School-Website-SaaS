package com.schoolsaas.school.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Deterministic, template-based generator - no network call, no LLM. See
 * AiContentGenerator's Javadoc for why this is the only implementation
 * today. Every section it emits uses a real registered component type with
 * every property its schema marks required filled in, so it passes
 * PageContentValidator the same as a hand-built page would.
 */
@Service
public class StubAiGenerator implements AiContentGenerator {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** Style name (case-insensitive) -> a plausible design-token set. Falls back to the "modern" palette for anything unrecognized. */
    private static final java.util.Map<String, String[]> STYLE_PALETTES = java.util.Map.of(
            "modern", new String[]{"#2563eb", "#0f172a", "#f59e0b", "Poppins, sans-serif", "0.75rem"},
            "classic", new String[]{"#7c2d12", "#1c1917", "#b45309", "Georgia, serif", "0.25rem"},
            "playful", new String[]{"#db2777", "#581c87", "#facc15", "Baloo 2, sans-serif", "1.5rem"}
    );

    @Override
    public GeneratedSite generate(GenerationInput input) {
        String schoolName = input.schoolName() != null ? input.schoolName() : "Our School";
        String tagline = buildTagline(input);

        List<GeneratedPage> pages = new ArrayList<>();
        pages.add(page("home", "Home",
                section("hero", props(p -> {
                    p.put("title", "Welcome to " + schoolName);
                    p.put("subtitle", tagline);
                })),
                section("about", props(p -> {
                    p.put("title", "About " + schoolName);
                    p.put("body", aboutBlurb(input));
                })),
                section("notice_board", props(p -> p.put("title", "Latest Notices"))),
                section("events", props(p -> p.put("title", "Upcoming Events"))),
                section("cta", props(p -> {
                    p.put("title", "Ready to join " + schoolName + "?");
                    p.put("buttonLabel", "Apply Now");
                    p.put("buttonUrl", "/admissions");
                })),
                section("footer", props(p -> p.put("text", "© " + schoolName)))
        ));
        pages.add(page("about", "About",
                section("heading", props(p -> p.put("text", "About Us"))),
                section("text", props(p -> p.put("content", aboutBlurb(input))))
        ));
        pages.add(page("academics", "Academics",
                section("heading", props(p -> p.put("text", "Academics"))),
                section("text", props(p -> p.put("content",
                        "Our academic programs are designed to challenge and support every student.")))
        ));
        pages.add(page("admissions", "Admissions",
                section("heading", props(p -> p.put("text", "Admissions"))),
                section("text", props(p -> p.put("content", "We welcome applications year-round. Contact us to learn more.")))
        ));
        pages.add(page("teachers", "Teachers",
                section("heading", props(p -> p.put("text", "Our Teachers"))),
                section("teachers", props(p -> {}))
        ));
        pages.add(page("facilities", "Facilities",
                section("heading", props(p -> p.put("text", "Facilities"))),
                section("facilities", props(p -> {}))
        ));
        pages.add(page("gallery", "Gallery",
                section("heading", props(p -> p.put("text", "Gallery"))),
                section("gallery", props(p -> {}))
        ));
        pages.add(page("events", "Events",
                section("heading", props(p -> p.put("text", "Events"))),
                section("events", props(p -> {}))
        ));
        pages.add(page("news", "News",
                section("heading", props(p -> p.put("text", "News"))),
                section("news", props(p -> {}))
        ));
        pages.add(page("contact", "Contact",
                section("heading", props(p -> p.put("text", "Contact Us"))),
                section("text", props(p -> p.put("content", "Reach out with any questions - we'd love to hear from you.")))
        ));

        return new GeneratedSite(pages, themeTokens(input));
    }

    private JsonNode themeTokens(GenerationInput input) {
        String styleKey = input.style() != null ? input.style().toLowerCase(Locale.ROOT) : "modern";
        String[] palette = STYLE_PALETTES.getOrDefault(styleKey, STYLE_PALETTES.get("modern"));

        ObjectNode tokens = MAPPER.createObjectNode();
        tokens.put("colorPrimary", input.primaryColor() != null ? input.primaryColor() : palette[0]);
        tokens.put("colorSecondary", palette[1]);
        tokens.put("colorAccent", palette[2]);
        tokens.put("colorBackground", "#ffffff");
        tokens.put("colorText", "#111827");
        tokens.put("fontHeading", palette[3]);
        tokens.put("fontBody", "Inter, sans-serif");
        tokens.put("radius", palette[4]);
        return tokens;
    }

    private String buildTagline(GenerationInput input) {
        StringBuilder sb = new StringBuilder("Excellence in education");
        if (input.schoolType() != null) sb.append(" for every ").append(input.schoolType().toLowerCase(Locale.ROOT));
        if (input.location() != null) sb.append(" in ").append(input.location());
        return sb.append(".").toString();
    }

    private String aboutBlurb(GenerationInput input) {
        String type = input.schoolType() != null ? input.schoolType() : "school";
        String location = input.location() != null ? " in " + input.location() : "";
        return "We are a " + type.toLowerCase(Locale.ROOT) + location
                + " committed to helping every student reach their full potential through a supportive, engaging learning environment.";
    }

    private GeneratedPage page(String slug, String title, JsonNode... sections) {
        ObjectNode content = MAPPER.createObjectNode();
        ArrayNode sectionsArray = content.putArray("sections");
        for (JsonNode s : sections) {
            sectionsArray.add(s);
        }
        return new GeneratedPage(slug, title, content);
    }

    private JsonNode section(String type, JsonNode props) {
        ObjectNode section = MAPPER.createObjectNode();
        section.put("id", UUID.randomUUID().toString());
        section.put("type", type);
        section.set("props", props);
        return section;
    }

    private JsonNode props(java.util.function.Consumer<ObjectNode> builder) {
        ObjectNode node = MAPPER.createObjectNode();
        builder.accept(node);
        return node;
    }
}
