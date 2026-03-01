package com.feurle.tg.user.application;

import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;

    public User createUser(User user) {
        if (userRepository.existsByLogin(user.getLogin())) {
            throw new IllegalArgumentException("Login already exists: " + user.getLogin());
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userUpdate) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if (!user.getEmail().equals(userUpdate.getEmail()) && userRepository.existsByEmail(userUpdate.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userUpdate.getEmail());
        }

        user.setEmail(userUpdate.getEmail());
        if (userUpdate.getPassword() != null) {
            user.setPassword(userUpdate.getPassword());
        }
        user.setFirstName(userUpdate.getFirstName());
        user.setLastName(userUpdate.getLastName());
        user.setLangKey(userUpdate.getLangKey());
        user.setImageUrl(userUpdate.getImageUrl());
        user.setActivated(userUpdate.getActivated());

        if (userUpdate.getAuthorities() != null) {
            user.setAuthorities(userUpdate.getAuthorities());
        }

        return userRepository.save(user);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByLogin(String login) {
        return userRepository.findByLogin(login);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public boolean existsByLogin(String login) {
        return userRepository.existsByLogin(login);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
