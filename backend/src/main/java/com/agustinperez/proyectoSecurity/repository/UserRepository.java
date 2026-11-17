package com.agustinperez.proyectoSecurity.repository;

import com.agustinperez.proyectoSecurity.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT u FROM User u
        WHERE LOWER(u.email) = LOWER(:email)
    """)
    Optional<User> findByEmailForUpdate(@Param("email") String email);
}
