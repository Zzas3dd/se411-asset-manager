package com.se411.assetmanager.dto;

import java.util.List;

import com.se411.assetmanager.model.Asset;

/**
 * One page of assets returned by GET /api/assets.
 *
 * content        the assets on the requested page
 * page           the requested page number (starts at 0)
 * size           the requested page size
 * totalElements  number of assets that match the search/filter
 * totalPages     number of pages for that total (0 when nothing matches)
 * first          true when this is the first page
 * last           true when there is no next page
 */
public record AssetPageResponse(
        List<Asset> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last) {
}
