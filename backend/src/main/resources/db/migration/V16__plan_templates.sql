CREATE TABLE plan_templates (
    plan_id BIGINT NOT NULL,
    template_id VARCHAR(80) NOT NULL,
    PRIMARY KEY (plan_id, template_id),
    CONSTRAINT fk_plan_templates_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
