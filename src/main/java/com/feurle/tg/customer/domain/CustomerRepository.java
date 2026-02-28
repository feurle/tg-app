package com.feurle.tg.customer.domain;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository {
    List<Customer> findAll();
    Optional<Customer> findById(Long id);
    Optional<Customer> findByEmail(String email);
    Customer save(Customer customer);
    void deleteById(Long id);
    void deleteAll();
}