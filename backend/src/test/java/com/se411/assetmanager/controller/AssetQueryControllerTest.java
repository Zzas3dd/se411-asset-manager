package com.se411.assetmanager.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
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

import com.se411.assetmanager.dto.AssetPageResponse;
import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.service.AssetQueryService;

/**
 * Unit tests for AssetQueryController.
 * The service is mocked with Mockito, so only the HTTP status codes
 * and response bodies chosen by the controller are tested.
 */
@ExtendWith(MockitoExtension.class)
class AssetQueryControllerTest {

    @Mock
    private AssetQueryService assetQueryService;

    @InjectMocks
    private AssetQueryController controller;

    private Asset asset;

    @BeforeEach
    void setUp() {
        asset = new Asset(
            1L,
            "Dell Latitude 5440",
            "Laptop",
            "DL5440-8XK21",
            "Sara Alqahtani",
            "In Use",
            LocalDate.of(2024, 2, 11)
        );
    }

    // ---------- GET /api/assets/{requestedId} ----------

    @Test
    void findById_existingAsset_returns200WithAsset() {
        when(assetQueryService.findById(1L)).thenReturn(Optional.of(asset));

        ResponseEntity<Asset> response = controller.findById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(asset, response.getBody());
        verify(assetQueryService).findById(1L);
    }

    @Test
    void findById_missingAsset_returns404WithEmptyBody() {
        when(assetQueryService.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Asset> response = controller.findById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void findById_unexpectedError_returns500() {
        when(assetQueryService.findById(1L))
            .thenThrow(new RuntimeException("storage failure"));

        ResponseEntity<Asset> response = controller.findById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());
    }

    // ---------- GET /api/assets?page=&size=&sort=&search=&status= ----------

    @Test
    void findAll_firstPage_returns200WithMetadata() {
        AssetPageResponse page = new AssetPageResponse(
            List.of(asset), 0, 5, 6, 2, true, false);
        when(assetQueryService.findAll(0, 5, null, null, null)).thenReturn(page);

        ResponseEntity<?> response = controller.findAll(0, 5, null, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AssetPageResponse body = (AssetPageResponse) response.getBody();
        assertEquals(1, body.content().size());
        assertEquals(0, body.page());
        assertEquals(6, body.totalElements());
        assertEquals(2, body.totalPages());
    }

    @Test
    void findAll_passesSortSearchAndStatusToService() {
        AssetPageResponse page = new AssetPageResponse(
            List.of(), 1, 5, 3, 1, false, true);
        when(assetQueryService.findAll(1, 5, "name,desc", "dell", "In Use"))
            .thenReturn(page);

        ResponseEntity<?> response =
            controller.findAll(1, 5, "name,desc", "dell", "In Use");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(page, response.getBody());
        verify(assetQueryService).findAll(1, 5, "name,desc", "dell", "In Use");
    }

    @Test
    void findAll_emptyResult_returns200() {
        AssetPageResponse empty = new AssetPageResponse(
            List.of(), 0, 5, 0, 0, true, true);
        when(assetQueryService.findAll(0, 5, null, null, null)).thenReturn(empty);

        ResponseEntity<?> response = controller.findAll(0, 5, null, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, ((AssetPageResponse) response.getBody()).totalElements());
    }

    @Test
    void findAll_invalidInput_returns400WithMessage() {
        when(assetQueryService.findAll(-1, 5, null, null, null))
            .thenThrow(new IllegalArgumentException("Page number cannot be negative."));

        ResponseEntity<?> response = controller.findAll(-1, 5, null, null, null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        @SuppressWarnings("unchecked")
        Map<String, String> body = (Map<String, String>) response.getBody();
        assertEquals("Page number cannot be negative.", body.get("error"));
    }

    @Test
    void findAll_unexpectedError_returns500WithoutDetails() {
        when(assetQueryService.findAll(0, 5, null, null, null))
            .thenThrow(new RuntimeException("storage failure"));

        ResponseEntity<?> response = controller.findAll(0, 5, null, null, null);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());
    }
}
