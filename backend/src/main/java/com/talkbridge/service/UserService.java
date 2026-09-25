package com.talkbridge.service;

import com.talkbridge.dto.ChangePasswordRequest;
import com.talkbridge.dto.UpdateProfileRequest;
import com.talkbridge.dto.UserDTO;
import com.talkbridge.entity.User;
import com.talkbridge.exception.BadRequestException;
import com.talkbridge.exception.ResourceNotFoundException;
import com.talkbridge.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getEntityByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public User getEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserDTO getCurrentUser(String email) {
        return UserDTO.fromEntity(getEntityByEmail(email));
    }

    public UserDTO getUserById(Long id) {
        return UserDTO.fromEntity(getEntityById(id));
    }

    @Transactional
    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = getEntityByEmail(email);

        user.setName(request.getName().trim());
        user.setBio(request.getBio() != null ? request.getBio().trim() : user.getBio());
        user.setNativeLanguage(request.getNativeLanguage().trim());
        user.setLearningLanguage(request.getLearningLanguage().trim());
        user.setInterests(request.getInterests() != null ? request.getInterests().trim() : user.getInterests());
        if (request.getProfileImage() != null && !request.getProfileImage().isBlank()) {
            user.setProfileImage(request.getProfileImage().trim());
        }

        User updatedUser = userRepository.save(user);
        return UserDTO.fromEntity(updatedUser);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getEntityByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = getEntityByEmail(email);
        userRepository.delete(user);
    }

    public List<UserDTO> getAllOtherUsers(Long currentUserId) {
        return userRepository.findByIdNot(currentUserId).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserDTO> searchUsers(Long currentUserId, String query) {
        if (query == null || query.isBlank()) {
            return getAllOtherUsers(currentUserId);
        }
        return userRepository.searchUsers(currentUserId, query.trim()).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void setUserOnlineStatus(Long userId, boolean isOnline) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setIsOnline(isOnline);
            userRepository.save(user);
        });
    }
}
