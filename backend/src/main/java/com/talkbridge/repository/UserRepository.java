package com.talkbridge.repository;

import com.talkbridge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByIdNot(Long id);

    @Query("SELECT u FROM User u WHERE u.id != :userId AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.nativeLanguage) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.learningLanguage) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.interests) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsers(@Param("userId") Long userId, @Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.id != :userId AND " +
           "LOWER(u.nativeLanguage) = LOWER(:nativeLang) AND LOWER(u.learningLanguage) = LOWER(:learningLang)")
    List<User> findComplementaryPartners(@Param("userId") Long userId,
                                         @Param("nativeLang") String nativeLang,
                                         @Param("learningLang") String learningLang);

    @Query("SELECT u FROM User u WHERE u.id != :userId AND LOWER(u.nativeLanguage) = LOWER(:learningLang)")
    List<User> findNativeSpeakersForLearning(@Param("userId") Long userId,
                                            @Param("learningLang") String learningLang);
}
