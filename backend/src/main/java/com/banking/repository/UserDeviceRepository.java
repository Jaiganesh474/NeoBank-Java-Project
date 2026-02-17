package com.banking.repository;

import com.banking.model.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    List<UserDevice> findByUserIdOrderByLoginTimeDesc(Long userId);

    Optional<UserDevice> findByRefreshToken(String refreshToken);

    void deleteByRefreshToken(String refreshToken);

    void deleteByUserIdAndIdNot(Long userId, Long currentDeviceId);

    void deleteByUserId(Long userId);
}
