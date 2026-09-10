package com.awardhub.awardhub.common.dto;

import lombok.*;
import java.util.List;

/**
 * Paginated response wrapper with metadata for frontend pagination.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PagedResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}
