package com.agustinperez.proyectoSecurity.exception;

public class VerificationCooldownException extends RuntimeException {

    private final int remainingSeconds;

    public VerificationCooldownException(int remainingSeconds) {
        super("Tenés que esperar antes de solicitar otro código.");
        this.remainingSeconds = remainingSeconds;
    }

    public int getRemainingSeconds() {
        return remainingSeconds;
    }
}
