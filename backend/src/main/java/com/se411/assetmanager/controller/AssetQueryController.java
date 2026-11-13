package com.se411.assetmanager.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.se411.assetmanager.dto.AssetPageResponse;
import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.service.AssetQueryService;

@RestController
@RequestMapping("/api/assets")
public class AssetQueryController {

    private final AssetQueryService assetQueryService;

    // Constructor injection: Spring provides the AssetQueryService bean
    public AssetQueryController(AssetQueryService assetQueryService) {
        this.assetQueryService = assetQueryService;
    }

    /**
     * READ one asset.
     * GET /api/assets/{requestedId}
     * 200 OK + asset JSON, 404 NOT FOUND (empty body), 500 on server error.
     */
    @GetMapping("/{requestedId}")
    public ResponseEntity<Asset> findById(@PathVariable("requestedId") Long requestedId) {
        try {
            Optional<Asset> asset = assetQueryService.findById(requestedId);

            if (asset.isPresent()) {
                return ResponseEntity.ok(asset.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * READ all assets, one page at a time.
     * GET /api/assets?page=0&size=5&sort=name,desc&search=dell&status=In%20Use
     * 200 OK + page JSON, 400 BAD REQUEST for invalid page/size/sort,
     * 500 on server error.
     */
    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "5") int size,
            @RequestParam(name = "sort", required = false) String sort,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) String status) {
        try {
            AssetPageResponse result =
                    assetQueryService.findAll(page, size, sort, search, status);

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException ex) {
            // Client input failed validation
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));

        } catch (Exception ex) {
            // Do not expose internal details to the client
            return ResponseEntity.internalServerError().build();
        }
    }
}
