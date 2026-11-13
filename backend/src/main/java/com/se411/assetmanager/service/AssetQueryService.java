package com.se411.assetmanager.service;

import java.util.Optional;

import com.se411.assetmanager.dto.AssetPageResponse;
import com.se411.assetmanager.model.Asset;

/**
 * Read operations on assets (search by ID and paginated list).
 *
 * MVC + Service layer: the controller depends on this interface,
 * and Spring injects the implementation (AssetQueryServiceImpl).
 */
public interface AssetQueryService {

    int DEFAULT_PAGE_SIZE = 5;

    // Response size limiting: an API must not return unlimited results
    int MAX_PAGE_SIZE = 100;

    // Find one asset by its ID. Empty when the asset does not exist.
    Optional<Asset> findById(Long id);

    /**
     * Return one page of assets.
     *
     * @param page   page index, starting at 0
     * @param size   number of assets per page (1 to 100)
     * @param sort   optional "field" or "field,asc|desc", e.g. "name,desc".
     *               Default is "id,asc" so pages are always in a stable order.
     * @param search optional text matched against name, serial number
     *               and assigned employee (not case-sensitive)
     * @param status optional exact status; "All" or blank means no filter
     * @throws IllegalArgumentException for invalid page, size or sort
     */
    AssetPageResponse findAll(int page, int size, String sort,
                              String search, String status);
}
