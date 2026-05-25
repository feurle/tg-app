// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.persistence;

import com.feurle.tg.webcontent.domain.Section;
import com.feurle.tg.webcontent.domain.SectionRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaSectionRepository extends JpaRepository<Section, Long>, SectionRepository {}
