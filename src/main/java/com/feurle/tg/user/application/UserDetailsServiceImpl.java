package com.feurle.tg.user.application;

import com.feurle.tg.user.domain.entity.Authority;
import com.feurle.tg.user.domain.entity.User;
import com.feurle.tg.user.domain.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        return userRepository
            .findByLogin(login)
            .filter(User::getActivated)
            .map(user -> new org.springframework.security.core.userdetails.User(
                user.getLogin(),
                user.getPassword(),
                user.getAuthorities().stream()
                    .map(Authority::getName)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList())
            ))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + login));
    }
}
