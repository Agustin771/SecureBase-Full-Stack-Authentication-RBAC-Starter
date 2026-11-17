package com.agustinperez.proyectoSecurity.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String code;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, String> errors;
    private Integer remainingSeconds;

    public ErrorResponse(
            int status,
            String message,
            LocalDateTime timestamp) {

        this(status, null, message, timestamp, null, null);
    }

    public ErrorResponse(
            int status,
            String message,
            LocalDateTime timestamp,
            Map<String, String> errors) {

        this(status, null, message, timestamp, errors, null);
    }
}
