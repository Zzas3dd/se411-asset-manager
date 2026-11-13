package com.se411.assetmanager.controller;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.service.UpdateAssetService;

@ExtendWith(MockitoExtension.class)
class UpdateAssetControllerTest {

    @Mock
    private UpdateAssetService updateAssetService;

    @InjectMocks
    private UpdateAssetController controller;

    private Asset asset;

    @BeforeEach
    void setUp() {
        asset = new Asset(null, "Dell Latitude 5550", "Laptop",
                "DL5440-8XK21", "Sara", "In Use", LocalDate.of(2024, 2, 11));
    }

    // Test 1: Successful update returns HTTP 200 with the updated asset
    @Test
    void shouldReturn200WhenAssetIsUpdated() {
        when(updateAssetService.updateAsset(1L, asset)).thenAnswer(invocation -> {
            asset.setId(1L);
            return Optional.of(asset);
        });

        ResponseEntity<?> response = controller.updateAsset(1L, asset);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        Asset result = (Asset) response.getBody();
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Dell Latitude 5550", result.getName());

        verify(updateAssetService).updateAsset(1L, asset);
    }

    // Test 2: Unknown ID returns HTTP 404
    @Test
    void shouldReturn404WhenAssetDoesNotExist() {
        when(updateAssetService.updateAsset(99L, asset)).thenReturn(Optional.empty());

        ResponseEntity<?> response = controller.updateAsset(99L, asset);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Asset not found.", ((Map<?, ?>) response.getBody()).get("error"));
    }

    // Test 3: Invalid information returns HTTP 400
    @Test
    void shouldReturn400ForInvalidAsset() {
        when(updateAssetService.updateAsset(1L, asset))
                .thenThrow(new IllegalArgumentException("Please fill in all required fields."));

        ResponseEntity<?> response = controller.updateAsset(1L, asset);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Please fill in all required fields.",
                ((Map<?, ?>) response.getBody()).get("error"));
    }

    // Test 4: Duplicate serial number returns HTTP 400
    @Test
    void shouldReturn400ForDuplicateSerialNumber() {
        when(updateAssetService.updateAsset(1L, asset))
                .thenThrow(new IllegalArgumentException("This serial number already exists."));

        ResponseEntity<?> response = controller.updateAsset(1L, asset);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("This serial number already exists.",
                ((Map<?, ?>) response.getBody()).get("error"));
    }
}
