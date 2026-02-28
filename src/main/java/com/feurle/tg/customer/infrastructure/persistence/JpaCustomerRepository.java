package com.feurle.tg.customer.infrastructure.persistence;

import com.feurle.tg.customer.domain.Customer;
import com.feurle.tg.customer.domain.CustomerRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JpaCustomerRepository extends JpaRepository<Customer, Long>, CustomerRepository {
    Optional<Customer> findByEmail(String email);
}