package com.awardhub.awardhub.voting.entity;

import com.awardhub.awardhub.category.entity.AwardCategory;
import com.awardhub.awardhub.user.entity.Nominee;
import com.awardhub.awardhub.user.entity.Voter;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Vote associative entity: voter + nominee + category.
 * Scoped by AwardCategory, cast by Voter, received by Nominee.
 */
@Entity
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"voter_id", "nominee_id", "category_id"})
})
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vote_id")
    private Long voteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voter_id", nullable = false)
    private Voter voter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominee_id", nullable = false)
    private Nominee nominee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AwardCategory category;

    @Column(name = "vote_timestamp", nullable = false)
    private LocalDateTime voteTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private VoteStatus status = VoteStatus.VALID;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    public Vote() {}

    @PrePersist
    protected void onCreate() {
        this.voteTimestamp = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getVoteId() {
        return voteId;
    }

    public void setVoteId(Long voteId) {
        this.voteId = voteId;
    }

    public Voter getVoter() {
        return voter;
    }

    public void setVoter(Voter voter) {
        this.voter = voter;
    }

    public Nominee getNominee() {
        return nominee;
    }

    public void setNominee(Nominee nominee) {
        this.nominee = nominee;
    }

    public AwardCategory getCategory() {
        return category;
    }

    public void setCategory(AwardCategory category) {
        this.category = category;
    }

    public LocalDateTime getVoteTimestamp() {
        return voteTimestamp;
    }

    public void setVoteTimestamp(LocalDateTime voteTimestamp) {
        this.voteTimestamp = voteTimestamp;
    }

    public VoteStatus getStatus() {
        return status;
    }

    public void setStatus(VoteStatus status) {
        this.status = status;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
