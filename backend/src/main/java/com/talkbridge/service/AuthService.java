package com.talkbridge.service;

import com.talkbridge.dto.AuthRequest;
import com.talkbridge.dto.AuthResponse;
import com.talkbridge.dto.RegisterRequest;
import com.talkbridge.dto.UserDTO;
import com.talkbridge.entity.Role;
import com.talkbridge.entity.User;
import com.talkbridge.exception.BadRequestException;
import com.talkbridge.repository.UserRepository;
import com.talkbridge.security.CustomUserDetails;
import com.talkbridge.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNativeLanguage(request.getNativeLanguage().trim());
        user.setLearningLanguage(request.getLearningLanguage().trim());
        user.setBio(request.getBio() != null ? request.getBio().trim() : "Hello! I am excited to practice languages on TalkBridge.");
        user.setInterests(request.getInterests() != null ? request.getInterests().trim() : "Culture, Travel, Technology");
        user.setProfileImage(request.getProfileImage() != null && !request.getProfileImage().isBlank() 
                ? request.getProfileImage() 
                : generateDefaultAvatar(request.getName()));
        user.setRole(Role.ROLE_USER);
        user.setIsOnline(true);
        user.setLastSeen(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, UserDTO.fromEntity(savedUser));
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setIsOnline(true);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, UserDTO.fromEntity(user));
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setIsOnline(false);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    private String generateDefaultAvatar(String name) {
        String initials = "TB";
        if (name != null && !name.trim().isEmpty()) {
            String[] parts = name.trim().split("\\s+");
            if (parts.length >= 2) {
                initials = (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
            } else if (parts[0].length() >= 2) {
                initials = parts[0].substring(0, 2).toUpperCase();
            } else {
                initials = parts[0].toUpperCase();
            }
        }
        return "https://api.dicebear.com/7.x/initials/svg?seed=" + initials + "&backgroundColor=6366f1,4f46e5,818cf8";
    }
}
