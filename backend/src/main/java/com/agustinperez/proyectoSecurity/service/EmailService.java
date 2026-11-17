package com.agustinperez.proyectoSecurity.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Verificá tu cuenta");
        message.setText(
                "¡Hola!\n\n" +
                        "Tu código de verificación es: " + code + "\n\n" +
                        "Este código vence en 15 minutos.\n\n" +
                        "¡Gracias por registrarte!"
        );
        mailSender.send(message);
    }

    public void sendResetPasswordEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Recuperación de contraseña");
        message.setText(
                "¡Hola!\n\n" +
                        "Recibimos una solicitud para restablecer tu contraseña.\n\n" +
                        "Tu código de recuperación es: " + token + "\n\n" +
                        "Este código vence en 15 minutos.\n\n" +
                        "Si no solicitaste este cambio, podés ignorar este correo."
        );
        mailSender.send(message);
    }
}