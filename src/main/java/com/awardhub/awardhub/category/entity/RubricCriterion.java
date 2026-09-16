package com.awardhub.awardhub.category.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

/**
 * Embeddable criterion representing a component of a category's scoring rubric.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RubricCriterion {

    @Column(name = "criterion_key", nullable = false, length = 100)
    private String key;

    @Column(name = "criterion_label", nullable = false, length = 150)
    private String label;

    @Column(name = "weight", nullable = false)
    private Double weight;
}
