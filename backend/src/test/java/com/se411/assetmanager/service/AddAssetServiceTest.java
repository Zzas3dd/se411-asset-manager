
package com.se411.assetmanager.service;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.repository.AssetStore;

@ExtendWith(MockitoExtension.class)
class AddAssetServiceTest {

    @Mock
    private AssetStore assetStore;

    @InjectMocks
    private AddAssetService addAssetService;

    private Asset asset;

    @BeforeEach
    void setUp() {
        asset = new Asset(
            null,
            "Dell Latitude 5440",
            "Laptop",
            "DL-TEST-001",
            "Sara",
            "In Use",
            LocalDate.of(2024, 2, 11)
        );
    }

    // Test 1: A valid asset is saved successfully
    @Test
    void shouldAddValidAsset() {
        when(assetStore.save(asset)).thenAnswer(invocation -> {
            Asset savedAsset = invocation.getArgument(0);
            savedAsset.setId(1L);
            return savedAsset;
        });

        Asset result = addAssetService.createAsset(asset);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Dell Latitude 5440", result.getName());

        verify(assetStore).save(asset);
    }

    // Test 2: Required fields must not be empty
    @Test
    void shouldRejectMissingName() {
        asset.setName("");

        IllegalArgumentException exception =
            assertThrows(
                IllegalArgumentException.class,
                () -> addAssetService.createAsset(asset)
            );

        assertEquals(
            "Please fill in all required fields.",
            exception.getMessage()
        );

        verify(assetStore, never()).save(any());
    }

    // Test 3: Serial numbers must be unique
    @Test
    void shouldRejectDuplicateSerialNumber() {
        when(assetStore.existsBySerialNumber("DL-TEST-001"))
            .thenReturn(true);

        IllegalArgumentException exception =
            assertThrows(
                IllegalArgumentException.class,
                () -> addAssetService.createAsset(asset)
            );

        assertEquals(
            "This serial number already exists.",
            exception.getMessage()
        );

        verify(assetStore, never()).save(any());
    }

    // Test 4: Future purchase dates are not allowed
    @Test
    void shouldRejectFutureDate() {
        asset.setPurchaseDate(LocalDate.now().plusDays(1));

        IllegalArgumentException exception =
            assertThrows(
                IllegalArgumentException.class,
                () -> addAssetService.createAsset(asset)
            );

        assertEquals(
            "Purchase date cannot be in the future.",
            exception.getMessage()
        );

        verify(assetStore, never()).save(any());
    }

    // Test 5: Asset type must be valid
    @Test
    void shouldRejectInvalidType() {
        asset.setType("Phone");

        IllegalArgumentException exception =
            assertThrows(
                IllegalArgumentException.class,
                () -> addAssetService.createAsset(asset)
            );

        assertEquals(
            "Invalid asset type.",
            exception.getMessage()
        );

        verify(assetStore, never()).save(any());
    }

    // Test 6: Status must be valid
    @Test
    void shouldRejectInvalidStatus() {
        asset.setStatus("Unknown");

        IllegalArgumentException exception =
            assertThrows(
                IllegalArgumentException.class,
                () -> addAssetService.createAsset(asset)
            );

        assertEquals(
            "Invalid asset status.",
            exception.getMessage()
        );

        verify(assetStore, never()).save(any());
    }
}
