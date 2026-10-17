// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.webcontent.infrastructure.rest.dto;

/** A CMS page without its articles; used for the page list in the admin area. */
public record PageSummaryResponse(Long id, String slug, String title, String description) {}
