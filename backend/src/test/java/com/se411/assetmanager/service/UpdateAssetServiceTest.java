package com.se411.assetmanager.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.repository.AssetStore;

@ExtendWith(MockitoExtension.class)
class UpdateAssetServiceTest {

    @Mock
    private AssetStore assetStore;

    @InjectMocks
    private UpdateAssetService updateAssetService;

    private Asset existingAsset;
    private Asset otherAsset;
    private Asset changes;

    @BeforeEach
    void setUp() {
        existingAsset = new Asset(1L, "Dell Latitude 5440", "Laptop",
                "DL5440-8XK21", "Sara", "In Use", LocalDate.of(2024, 2, 11));

        otherAsset = new Asset(2L, "Lenovo ThinkPad T14", "Laptop",
                "LNT14-PF3Q9", "Faisal", "In Use", LocalDate.of(2024, 5, 3));

        // The edited version of asset 1 (new name, same serial number)
        changes = new Asset(null, "Dell Latitude 5550", "Laptop",
                "DL5440-8XK21", "Sara", "In Stock", LocalDate.of(2024, 2, 11));
    }

    // Test 1: A valid update is saved and returned
    @Test
    void shouldUpdateValidAsset() {
        when(assetStore.findById(1L)).thenReturn(Optional.of(existingAsset));
        when(assetStore.findAll()).thenReturn(List.of(existingAsset, otherAsset));
        when(assetStore.update(1L, changes)).thenAnswer(invocation -> {
            Asset saved = invocation.getArgument(1);
            saved.setId(1L);
            return Optional.of(saved);
        });

        Optional<Asset> result = updateAssetService.updateAsset(1L, changes);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
        assertEquals("Dell Latitude 5550", result.get().getName());
        assertEquals("In Stock", result.get().getStatus());

        verify(assetStore).update(1L, changes);
    }

    // Test 2: Updating an asset that does not exist returns empty
    @Test
    void shouldReturnEmptyForNonexistentAsset() {
        when(assetStore.findById(99L)).thenReturn(Optional.empty());

        Optional<Asset> result = updateAssetService.updateAsset(99L, changes);

        assertTrue(result.isEmpty());
        verify(assetStore, never()).update(anyLong(), any());
    }

    // Test 3: Required fields must not be empty
    @Test
    void shouldRejectMissingRequiredFields() {
        when(assetStore.findById(1L)).thenReturn(Optional.of(existingAsset));
        changes.setName("   ");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> updateAssetService.updateAsset(1L, changes));

        assertEquals("Please fill in all required fields.", exception.getMessage());
        verify(assetStore, never()).update(anyLong(), any());
    }

    // Test 4: Future purchase dates are not allowed
    @Test
    void shouldRejectFutureDate() {
        when(assetStore.findById(1L)).thenReturn(Optional.of(existingAsset));
        changes.setPurchaseDate(LocalDate.now().plusDays(1));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> updateAssetService.updateAsset(1L, changes));

        assertEquals("Purchase date cannot be in the future.", exception.getMessage());
        verify(assetStore, never()).update(anyLong(), any());
    }

    // Test 5: Invalid type or status is rejected
    @Test
    void shouldRejectInvalidStatus() {
        when(assetStore.findById(1L)).thenReturn(Optional.of(existingAsset));
        changes.setStatus("Lost");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> updateAssetService.updateAsset(1L, changes));

        assertEquals("Invalid asset status.", exception.getMessage());
        verify(assetStore, never()).update(anyLong(), any());
    }

    // Test 6: Cannot take another asset's serial number (case-insensitive)
    @Test
    void shouldRejectDuplicateSerialNumber() {
        when(assetStore.findById(1L)).thenReturn(Optional.of(existingAsset));
        when(assetStore.findAll()).thenReturn(List.of(existingAsset, otherAsset));
        changes.setSerialNumber("lnt14-pf3q9");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> updateAssetService.updateAsset(1L, changes));

        assertEquals("This serial number already exists.", exception.getMessage());
        verify(assetStore, never()).update(anyLong(), any());
    }

    // Test 7: Keeping the asset's own serial number is NOT a duplicate
    @Test
    void shouldAllowKeepingOriginalSerialNumber() {
        when(assetStore.findById(1L)).thenReturn(Optional.of(existingAsset));
        when(assetStore.findAll()).thenReturn(List.of(existingAsset, otherAsset));
        when(assetStore.update(1L, changes)).thenReturn(Optional.of(changes));

        Optional<Asset> result = updateAssetService.updateAsset(1L, changes);

        assertTrue(result.isPresent());
        assertEquals("DL5440-8XK21", result.get().getSerialNumber());
        verify(assetStore).update(1L, changes);
    }
}
