package com.awardhub.awardhub.nomination.dto;

import java.util.List;

public class EvaluationAssignmentRequest {
    private Long nominationId;
    private List<Long> judgeIds;

    public EvaluationAssignmentRequest() {}

    public EvaluationAssignmentRequest(Long nominationId, List<Long> judgeIds) {
        this.nominationId = nominationId;
        this.judgeIds = judgeIds;
    }

    public Long getNominationId() {
        return nominationId;
    }

    public void setNominationId(Long nominationId) {
        this.nominationId = nominationId;
    }

    public List<Long> getJudgeIds() {
        return judgeIds;
    }

    public void setJudgeIds(List<Long> judgeIds) {
        this.judgeIds = judgeIds;
    }
}
