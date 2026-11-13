
package com.se411.assetmanager.controller;

import java.time.LocalDate;
import java.util.Map;

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
import com.se411.assetmanager.service.AddAssetService;

@ExtendWith(MockitoExtension.class)
class AddAssetControllerTest {

    @Mock
    private AddAssetService addAssetService;

    @InjectMocks
    private AddAssetController controller;

    private Asset asset;

    @BeforeEach
    void setUp() {
        asset = new Asset(
            null,
            "Dell Laptop",
            "Laptop",
            "DL-123",
            "Sara",
            "In Use",
            LocalDate.of(2024, 2, 11)
        );
    }

    // Test 1: Successful creation returns HTTP 201
    @Test
    void shouldReturn201WhenAssetIsCreated() {

        when(addAssetService.createAsset(asset))
            .thenAnswer(invocation -> {
                asset.setId(1L);
                return asset;
            });

        ResponseEntity<?> response =
            controller.addAsset(asset);

        assertEquals(
            HttpStatus.CREATED,
            response.getStatusCode()
        );

        Asset result = (Asset) response.getBody();

        assertNotNull(result);
        assertEquals(1L, result.getId());

        verify(addAssetService).createAsset(asset);
    }

    // Test 2: Invalid asset returns HTTP 400
    @Test
    void shouldReturn400ForInvalidAsset() {

        when(addAssetService.createAsset(asset))
            .thenThrow(new IllegalArgumentException(
                "Please fill in all required fields."
            ));

        ResponseEntity<?> response =
            controller.addAsset(asset);

        assertEquals(
            HttpStatus.BAD_REQUEST,
            response.getStatusCode()
        );

        assertEquals(
            "Please fill in all required fields.",
            ((Map<?, ?>) response.getBody()).get("error")
        );
    }

    // Test 3: Duplicate serial number returns HTTP 400
    @Test
    void shouldReturn400ForDuplicateSerialNumber() {

        when(addAssetService.createAsset(asset))
            .thenThrow(new IllegalArgumentException(
                "This serial number already exists."
            ));

        ResponseEntity<?> response =
            controller.addAsset(asset);

        assertEquals(
            HttpStatus.BAD_REQUEST,
            response.getStatusCode()
        );

        assertEquals(
            "This serial number already exists.",
            ((Map<?, ?>) response.getBody()).get("error")
        );
    }
}
