package com.feurle.tg.customer.infrastructure.rest.dto;

public record CreateCustomerRequest(
    String firstName,
    String lastName,
    String email,
    String phone,
    String address,
    String city,
    String state,
    String zip,
    String country
) {}