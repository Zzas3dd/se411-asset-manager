package com.se411.assetmanager.config;

import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.repository.AssetStore;

/**
 * Loads the six company computers from Part 1 (frontend src/data/assets.js)
 * into the shared AssetStore when the backend starts.
 *
 * It only runs when the store is empty, so it will not create duplicates
 * if the team later moves this seeding into AssetStore itself.
 * AssetStore.save() assigns IDs 1 to 6, which match the Part 1 IDs.
 */
@Configuration
public class InitialDataLoader {

    @Bean
    public ApplicationRunner loadInitialAssets(AssetStore assetStore) {
        return args -> {
            if (!assetStore.findAll().isEmpty()) {
                return;
            }
            for (Asset asset : partOneAssets()) {
                assetStore.save(asset);
            }
        };
    }

    static List<Asset> partOneAssets() {
        return List.of(
            new Asset(null, "Dell Latitude 5440", "Laptop",
                "DL5440-8XK21", "Sara Alqahtani", "In Use",
                LocalDate.of(2024, 2, 11)),
            new Asset(null, "Lenovo ThinkPad T14", "Laptop",
                "LNT14-PF3Q9", "Faisal Alharbi", "In Use",
                LocalDate.of(2024, 5, 3)),
            new Asset(null, "HP EliteDesk 800", "Desktop",
                "HPED800-2MN7", "", "In Stock",
                LocalDate.of(2023, 9, 18)),
            new Asset(null, "Samsung 27 inch Monitor", "Monitor",
                "SMS8-27-55HD", "Noura Alotaibi", "In Use",
                LocalDate.of(2024, 1, 22)),
            new Asset(null, "MacBook Pro 14", "Laptop",
                "C02MBP14-M3X", "Khalid Alshehri", "Under Repair",
                LocalDate.of(2024, 3, 7)),
            new Asset(null, "Lenovo ThinkCentre M70q", "Desktop",
                "LNM70Q-4471", "", "Retired",
                LocalDate.of(2021, 11, 2))
        );
    }
}
