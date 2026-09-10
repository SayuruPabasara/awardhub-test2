package com.awardhub.awardhub.user.repository;

import com.awardhub.awardhub.user.entity.Voter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoterRepository extends JpaRepository<Voter, Long> {

    Optional<Voter> findByNic(String nic);

    boolean existsByNic(String nic);
}
