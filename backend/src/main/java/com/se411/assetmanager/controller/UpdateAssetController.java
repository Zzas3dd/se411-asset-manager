package com.se411.assetmanager.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.service.UpdateAssetService;

@RestController
@RequestMapping("/api/assets")
public class UpdateAssetController {

    private final UpdateAssetService updateAssetService;

    public UpdateAssetController(UpdateAssetService updateAssetService) {
        this.updateAssetService = updateAssetService;
    }

    // PUT /api/assets/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(@PathVariable Long id,
                                         @RequestBody Asset asset) {
        try {
            Optional<Asset> updated = updateAssetService.updateAsset(id, asset);

            if (updated.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Asset not found."));
            }

            return ResponseEntity.ok(updated.get());

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
