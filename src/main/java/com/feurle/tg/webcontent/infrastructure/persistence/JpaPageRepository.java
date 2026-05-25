// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.persistence;

import com.feurle.tg.webcontent.domain.Page;
import com.feurle.tg.webcontent.domain.PageRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaPageRepository extends JpaRepository<Page, Long>, PageRepository {}
