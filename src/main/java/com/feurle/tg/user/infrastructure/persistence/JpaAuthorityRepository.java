package com.feurle.tg.user.infrastructure.persistence;

import com.feurle.tg.user.domain.entity.Authority;
import com.feurle.tg.user.domain.repository.AuthorityRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JpaAuthorityRepository extends JpaRepository<Authority, Long>, AuthorityRepository {
    Optional<Authority> findByName(String name);
}
