
package com.se411.assetmanager.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.repository.AssetStore;

@Service
public class AddAssetService {

    private final AssetStore assetStore;

    // Spring automatically provides the shared AssetStore
    public AddAssetService(AssetStore assetStore) {
        this.assetStore = assetStore;
    }

    // Validate and save a new computer asset
    public Asset createAsset(Asset asset) {

        // 1. Check that the request contains an asset
        if (asset == null) {
            throw new IllegalArgumentException(
                "Asset information is required."
            );
        }

        // 2. Validate required fields
        if (isBlank(asset.getName()) ||
            isBlank(asset.getType()) ||
            isBlank(asset.getSerialNumber()) ||
            isBlank(asset.getStatus()) ||
            asset.getPurchaseDate() == null) {

            throw new IllegalArgumentException(
                "Please fill in all required fields."
            );
        }

        // 3. Validate allowed asset types
        if (!asset.getType().equals("Laptop") &&
            !asset.getType().equals("Desktop") &&
            !asset.getType().equals("Monitor")) {

            throw new IllegalArgumentException(
                "Invalid asset type."
            );
        }

        // 4. Validate allowed statuses
        if (!asset.getStatus().equals("In Use") &&
            !asset.getStatus().equals("In Stock") &&
            !asset.getStatus().equals("Under Repair") &&
            !asset.getStatus().equals("Retired")) {

            throw new IllegalArgumentException(
                "Invalid asset status."
            );
        }

        // 5. Reject future purchase dates
        if (asset.getPurchaseDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                "Purchase date cannot be in the future."
            );
        }

        // 6. Prevent duplicate serial numbers
        if (assetStore.existsBySerialNumber(
                asset.getSerialNumber())) {

            throw new IllegalArgumentException(
                "This serial number already exists."
            );
        }

        // 7. Remove unnecessary spaces
        asset.setName(asset.getName().trim());
        asset.setSerialNumber(
            asset.getSerialNumber().trim()
        );

        if (asset.getAssignedTo() != null) {
            asset.setAssignedTo(
                asset.getAssignedTo().trim()
            );
        }

        // 8. Save the asset in the backend collection
        return assetStore.save(asset);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
