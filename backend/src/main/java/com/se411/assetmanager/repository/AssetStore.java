
package com.se411.assetmanager.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.se411.assetmanager.model.Asset;

@Repository
public class AssetStore {

    // Collection that stores all company assets
    private final List<Asset> assets = new ArrayList<>();

    // Generates the next unique ID
    private long nextId = 1;

    // Save a new asset
    public synchronized Asset save(Asset asset) {
        asset.setId(nextId++);
        assets.add(asset);
        return asset;
    }

    // Get all assets
    public synchronized List<Asset> findAll() {
        return new ArrayList<>(assets);
    }

    // Find an asset by ID
    public synchronized Optional<Asset> findById(Long id) {
        return assets.stream()
                .filter(asset -> asset.getId().equals(id))
                .findFirst();
    }

    // Check if a serial number already exists
    public synchronized boolean existsBySerialNumber(String serialNumber) {
        return assets.stream()
                .anyMatch(asset ->
                        asset.getSerialNumber() != null &&
                        asset.getSerialNumber()
                                .trim()
                                .equalsIgnoreCase(serialNumber.trim()));
    }

    // Update an existing asset
    public synchronized Optional<Asset> update(Long id, Asset updatedAsset) {
        for (int i = 0; i < assets.size(); i++) {
            if (assets.get(i).getId().equals(id)) {
                updatedAsset.setId(id);
                assets.set(i, updatedAsset);
                return Optional.of(updatedAsset);
            }
        }
        return Optional.empty();
    }
}
