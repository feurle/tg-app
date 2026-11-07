// SPDX-License-Identifier: MIT
// Copyright (C) 2026 Daniel Feurle
package com.feurle.tg.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * Compression happens in the embedded Tomcat, so this needs a real server; MockMvc never
 * compresses. The JDK client does not decompress, so the raw encoding is visible.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class CompressionIT {

  @LocalServerPort private int port;

  private final HttpClient client = HttpClient.newHttpClient();

  private HttpResponse<byte[]> fetch(String path, boolean acceptGzip) throws Exception {
    HttpRequest.Builder request =
        HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
    if (acceptGzip) {
      request.header("Accept-Encoding", "gzip");
    }
    return client.send(request.build(), HttpResponse.BodyHandlers.ofByteArray());
  }

  @Test
  void javascriptIsGzipped() throws Exception {
    HttpResponse<byte[]> response = fetch("/assets/cache-test.js", true);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.headers().firstValue("Content-Encoding")).hasValue("gzip");
    assertThat(response.headers().allValues("Vary"))
        .anyMatch(v -> v.equalsIgnoreCase("accept-encoding"));
  }

  @Test
  void jsonIsGzipped() throws Exception {
    HttpResponse<byte[]> response = fetch("/api/webcontent/pages/home", true);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.headers().firstValue("Content-Encoding")).hasValue("gzip");
  }

  @Test
  void clientsWithoutGzipGetPlainResponses() throws Exception {
    HttpResponse<byte[]> response = fetch("/assets/cache-test.js", false);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.headers().firstValue("Content-Encoding")).isEmpty();
  }

  @Test
  void imagesAreNotCompressedAgain() throws Exception {
    HttpResponse<byte[]> response = fetch("/api/webcontent/images/1/download", true);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.headers().firstValue("Content-Encoding")).isEmpty();
  }
}
