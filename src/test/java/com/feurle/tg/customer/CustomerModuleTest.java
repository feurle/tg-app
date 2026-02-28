package com.feurle.tg.customer;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.test.ApplicationModuleTest;

@ApplicationModuleTest
class CustomerModuleTest {

    @Test
    void verifyModuleStructure() {
        ApplicationModules modules = ApplicationModules.of(com.feurle.tg.Application.class);
        modules.verify();
    }
}