// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.customer.infrastructure.persistence;

import com.feurle.tg.customer.domain.Customer;
import com.feurle.tg.customer.domain.CustomerRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaCustomerRepository extends JpaRepository<Customer, Long>, CustomerRepository {
  Optional<Customer> findByEmail(String email);
}
