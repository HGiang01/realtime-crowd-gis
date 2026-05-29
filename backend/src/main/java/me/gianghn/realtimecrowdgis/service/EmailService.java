package me.gianghn.realtimecrowdgis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final Map<String, String> optStorage = new ConcurrentHashMap<>();

    public Instant sendOtp(String toEmail) {
        String otp = createOptCode();
        // refactor: allow 5 times in a day (Redis)
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[Realtime Crowd GIS] Your OTP Verification Code");
        String mailBody = "Hello, \n\n"
                + "You recently requested a One-Time Password (OTP) for your service in the Realtime Crowd GIS app.\n\n"
                + "Your OTP code is: " + otp + "\n"
                + "(This code is valid for 5 minutes)\n\n"
                + "----------------------------------------\n"
                + "⚠ IMPORTANT:\n"
                + "1. Do NOT share this code with anyone.\n"
                + "2. If you did not request this, someone might have entered your email by mistake. "
                + "Just ignore and delete this email. No one can access the app without this code.\n"
                + "----------------------------------------\n\n"
                + "Best regards,\n"
                + "Realtime Crowd GIS Team";
        message.setText(mailBody);
        mailSender.send(message);

        // refactor: Using Redis to storage the stage of opt, add TTL (time-to-live)
        optStorage.put(toEmail, otp);

        return Instant.now();
    }

    private String createOptCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    // todo: verify email ở đây
    public boolean verifyOtpMailCode(String email, String previousOpt) {
        return optStorage.containsKey(email) && optStorage.get(email).equals(previousOpt);
    }
}
