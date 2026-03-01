package com.feurle.tg.user.infrastructure.persistence;

import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.domain.repository.UserRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaUserRepository extends JpaRepository<User, Long>, UserRepository {
}
