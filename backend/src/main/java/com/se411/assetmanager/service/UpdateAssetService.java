package com.se411.assetmanager.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.repository.AssetStore;

@Service
public class UpdateAssetService {

    private final AssetStore assetStore;

    // Spring automatically provides the shared AssetStore
    public UpdateAssetService(AssetStore assetStore) {
        this.assetStore = assetStore;
    }

    // Validate and update an existing asset.
    // Returns Optional.empty() when no asset has this ID (controller turns it into 404).
    // Throws IllegalArgumentException for invalid data (controller turns it into 400).
    public Optional<Asset> updateAsset(Long id, Asset updatedAsset) {

        // 1. The request must contain an ID and asset information
        if (id == null) {
            throw new IllegalArgumentException("Asset ID is required.");
        }
        if (updatedAsset == null) {
            throw new IllegalArgumentException("Asset information is required.");
        }

        // 2. The asset must already exist
        if (assetStore.findById(id).isEmpty()) {
            return Optional.empty();
        }

        // 3. Validate required fields
        if (isBlank(updatedAsset.getName()) ||
            isBlank(updatedAsset.getType()) ||
            isBlank(updatedAsset.getSerialNumber()) ||
            isBlank(updatedAsset.getStatus()) ||
            updatedAsset.getPurchaseDate() == null) {

            throw new IllegalArgumentException("Please fill in all required fields.");
        }

        // 4. Validate allowed asset types (same rules as Add Asset)
        if (!updatedAsset.getType().equals("Laptop") &&
            !updatedAsset.getType().equals("Desktop") &&
            !updatedAsset.getType().equals("Monitor")) {

            throw new IllegalArgumentException("Invalid asset type.");
        }

        // 5. Validate allowed statuses
        if (!updatedAsset.getStatus().equals("In Use") &&
            !updatedAsset.getStatus().equals("In Stock") &&
            !updatedAsset.getStatus().equals("Under Repair") &&
            !updatedAsset.getStatus().equals("Retired")) {

            throw new IllegalArgumentException("Invalid asset status.");
        }

        // 6. Reject future purchase dates
        if (updatedAsset.getPurchaseDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Purchase date cannot be in the future.");
        }

        // 7. Prevent duplicate serial numbers, ignoring the asset being edited
        String newSerial = updatedAsset.getSerialNumber().trim();

        boolean duplicate = assetStore.findAll().stream()
                .anyMatch(asset ->
                        !asset.getId().equals(id) &&
                        asset.getSerialNumber() != null &&
                        asset.getSerialNumber().trim().equalsIgnoreCase(newSerial));

        if (duplicate) {
            throw new IllegalArgumentException("This serial number already exists.");
        }

        // 8. Remove unnecessary spaces
        updatedAsset.setName(updatedAsset.getName().trim());
        updatedAsset.setSerialNumber(newSerial);

        if (updatedAsset.getAssignedTo() != null) {
            updatedAsset.setAssignedTo(updatedAsset.getAssignedTo().trim());
        }

        // 9. Save the changes in the shared backend collection
        return assetStore.update(id, updatedAsset);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
