package com.banking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    private String deviceName;

    private String browser;

    private String os;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String ipAddress;

    private String location;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String refreshToken; // To identify the session uniquely

    @Column(nullable = false)
    private Boolean isCurrent = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime loginTime;

    @UpdateTimestamp
    private LocalDateTime lastActive;
}
