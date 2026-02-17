package com.banking.repository;

import com.banking.model.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT d FROM UserDevice d WHERE d.user.id = :userId ORDER BY d.loginTime DESC")
    List<UserDevice> findByUserIdCustom(@org.springframework.data.repository.query.Param("userId") Long userId);

    Optional<UserDevice> findByRefreshToken(String refreshToken);

    void deleteByRefreshToken(String refreshToken);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM UserDevice d WHERE d.user.id = :userId AND d.id != :currentDeviceId")
    void deleteOtherDevices(@org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("currentDeviceId") Long currentDeviceId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM UserDevice d WHERE d.user.id = :userId")
    void deleteAllUserDevices(@org.springframework.data.repository.query.Param("userId") Long userId);
}
