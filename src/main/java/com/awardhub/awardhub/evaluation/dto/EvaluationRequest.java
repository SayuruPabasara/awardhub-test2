package com.awardhub.awardhub.evaluation.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class EvaluationRequest {
    private Long nominationId;
    private Map<String, Integer> scores;
    private String comments;

    public EvaluationRequest() {}

    public EvaluationRequest(Long nominationId, Map<String, Integer> scores, String comments) {
        this.nominationId = nominationId;
        this.scores = scores;
        this.comments = comments;
    }

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }

    public Map<String, Integer> getScores() {
        return scores;
    }

    public void setScores(Map<String, Integer> scores) {
        this.scores = scores;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
