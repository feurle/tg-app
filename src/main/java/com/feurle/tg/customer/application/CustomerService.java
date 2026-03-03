// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.customer.application;

import com.feurle.tg.customer.domain.Customer;
import com.feurle.tg.customer.domain.CustomerRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomerService {

  private final CustomerRepository customerRepository;

  public List<Customer> getAllCustomers() {
    return customerRepository.findAll();
  }

  public Customer getCustomerById(Long id) {
    return customerRepository
        .findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));
  }

  public Customer getCustomerByEmail(String email) {
    return customerRepository
        .findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("Customer not found with email: " + email));
  }

  public Customer createCustomer(
      String firstName,
      String lastName,
      String email,
      String phone,
      String address,
      String city,
      String state,
      String zip,
      String country) {
    Customer customer = new Customer();
    customer.setFirstName(firstName);
    customer.setLastName(lastName);
    customer.setEmail(email);
    customer.setPhone(phone);
    customer.setAddress(address);
    customer.setCity(city);
    customer.setState(state);
    customer.setZip(zip);
    customer.setCountry(country);
    return customerRepository.save(customer);
  }

  public Customer updateCustomer(
      Long id,
      String firstName,
      String lastName,
      String email,
      String phone,
      String address,
      String city,
      String state,
      String zip,
      String country) {
    Customer customer =
        customerRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + id));

    customer.setFirstName(firstName);
    customer.setLastName(lastName);
    customer.setEmail(email);
    customer.setPhone(phone);
    customer.setAddress(address);
    customer.setCity(city);
    customer.setState(state);
    customer.setZip(zip);
    customer.setCountry(country);

    return customerRepository.save(customer);
  }

  public void deleteCustomer(Long id) {
    customerRepository.deleteById(id);
  }
}
