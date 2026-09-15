package com.schoolsaas.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserGlobalRoleRepository extends JpaRepository<UserGlobalRole, Long> {
    List<UserGlobalRole> findByUserId(Long userId);
}
