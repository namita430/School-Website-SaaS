package com.schoolsaas.superadmin.plan;

import com.schoolsaas.platform.common.ConflictException;
import com.schoolsaas.platform.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashSet;

@Service
public class PlanService {

    private final PlanRepository planRepository;

    public PlanService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Transactional
    public Plan create(CreatePlanRequest request) {
        if (planRepository.findAll().stream().anyMatch(p -> p.getCode().equalsIgnoreCase(request.code()))) {
            throw new ConflictException("A plan with code '" + request.code() + "' already exists");
        }
        Plan plan = new Plan();
        plan.setCode(request.code());
        plan.setName(request.name());
        plan.setPriceCents(request.priceCents());
        plan.setBillingInterval(request.billingInterval());
        plan.setActive(true);
        return planRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public List<Plan> listAll() {
        return planRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Plan> listActive() {
        return planRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public Plan getById(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Plan " + id + " not found"));
    }

    @Transactional
    public Plan setActive(Long id, boolean active) {
        Plan plan = getById(id);
        plan.setActive(active);
        return planRepository.save(plan);
    }

    @Transactional
    public Plan setTemplates(Long id, List<String> templateIds) {
        Plan plan = getById(id);
        plan.setTemplateIds(new LinkedHashSet<>(templateIds));
        return planRepository.save(plan);
    }
}
