
package com.se411.assetmanager.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.service.AddAssetService;

@RestController
@RequestMapping("/api/assets")
public class AddAssetController {

    private final AddAssetService addAssetService;

    public AddAssetController(AddAssetService addAssetService) {
        this.addAssetService = addAssetService;
    }

    @PostMapping
    public ResponseEntity<?> addAsset(@RequestBody Asset asset) {

        try {
            Asset savedAsset = addAssetService.createAsset(asset);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedAsset);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
