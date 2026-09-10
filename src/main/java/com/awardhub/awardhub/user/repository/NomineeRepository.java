package com.awardhub.awardhub.user.repository;

import com.awardhub.awardhub.user.entity.Nominee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long> {

    Optional<Nominee> findByNicPassport(String nicPassport);

    boolean existsByNicPassport(String nicPassport);
}
