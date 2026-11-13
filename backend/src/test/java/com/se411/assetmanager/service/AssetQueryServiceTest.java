package com.se411.assetmanager.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.se411.assetmanager.dto.AssetPageResponse;
import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.repository.AssetStore;

/**
 * Unit tests for AssetQueryServiceImpl.
 * The AssetStore (data layer) is mocked with Mockito, so only the
 * service logic (search, filter, sort, pagination) is tested.
 */
@ExtendWith(MockitoExtension.class)
class AssetQueryServiceTest {

    @Mock
    private AssetStore assetStore;

    @InjectMocks
    private AssetQueryServiceImpl service;

    private List<Asset> sixAssets;

    @BeforeEach
    void setUp() {
        sixAssets = new ArrayList<>(List.of(
            asset(1L, "Dell Latitude 5440", "DL5440-8XK21", "Sara Alqahtani", "In Use", 2024, 2),
            asset(2L, "Lenovo ThinkPad T14", "LNT14-PF3Q9", "Faisal Alharbi", "In Use", 2024, 5),
            asset(3L, "HP EliteDesk 800", "HPED800-2MN7", "", "In Stock", 2023, 9),
            asset(4L, "Samsung 27 inch Monitor", "SMS8-27-55HD", "Noura Alotaibi", "In Use", 2024, 1),
            asset(5L, "MacBook Pro 14", "C02MBP14-M3X", "Khalid Alshehri", "Under Repair", 2024, 3),
            asset(6L, "Lenovo ThinkCentre M70q", "LNM70Q-4471", null, "Retired", 2021, 11)
        ));
    }

    private static Asset asset(Long id, String name, String serial,
                               String assignedTo, String status,
                               int year, int month) {
        return new Asset(id, name, "Laptop", serial, assignedTo,
                status, LocalDate.of(year, month, 1));
    }

    private static List<Long> ids(AssetPageResponse page) {
        return page.content().stream().map(Asset::getId).toList();
    }

    private AssetPageResponse page(int page, int size) {
        return service.findAll(page, size, null, null, null);
    }

    // ---------- Search by ID ----------

    @Test
    void findById_existingId_returnsAsset() {
        when(assetStore.findById(2L)).thenReturn(Optional.of(sixAssets.get(1)));

        Optional<Asset> result = service.findById(2L);

        assertTrue(result.isPresent());
        assertEquals("Lenovo ThinkPad T14", result.get().getName());
        assertEquals("LNT14-PF3Q9", result.get().getSerialNumber());
        verify(assetStore).findById(2L);
    }

    @Test
    void findById_nonexistentId_returnsEmpty() {
        when(assetStore.findById(99L)).thenReturn(Optional.empty());

        assertTrue(service.findById(99L).isEmpty());
    }

    @Test
    void findById_nullId_returnsEmptyWithoutCallingStore() {
        assertTrue(service.findById(null).isEmpty());
        verify(assetStore, never()).findById(null);
    }

    // ---------- Pagination ----------

    @Test
    void findAll_firstPage_returnsFirstFiveAndMetadata() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result = page(0, 5);

        assertEquals(List.of(1L, 2L, 3L, 4L, 5L), ids(result));
        assertEquals(0, result.page());
        assertEquals(5, result.size());
        assertEquals(6, result.totalElements());
        assertEquals(2, result.totalPages());
        assertTrue(result.first());
        assertFalse(result.last());
    }

    @Test
    void findAll_secondPage_returnsRemainingAsset() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result = page(1, 5);

        assertEquals(List.of(6L), ids(result));
        assertFalse(result.first());
        assertTrue(result.last());
    }

    @Test
    void findAll_defaultOrderIsById() {
        List<Asset> reversed = new ArrayList<>(sixAssets);
        Collections.reverse(reversed);
        when(assetStore.findAll()).thenReturn(reversed);

        assertEquals(List.of(1L, 2L, 3L), ids(page(0, 3)));
    }

    @Test
    void findAll_emptyStore_returnsEmptyPage() {
        when(assetStore.findAll()).thenReturn(List.of());

        AssetPageResponse result = page(0, 5);

        assertTrue(result.content().isEmpty());
        assertEquals(0, result.totalElements());
        assertEquals(0, result.totalPages());
        assertTrue(result.first());
        assertTrue(result.last());
    }

    @Test
    void findAll_pagePastTheEnd_returnsEmptyContent() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result = page(5, 5);

        assertTrue(result.content().isEmpty());
        assertEquals(6, result.totalElements());
        assertEquals(2, result.totalPages());
        assertTrue(result.last());
    }

    @Test
    void findAll_exactPageBoundary() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result = page(1, 3);

        assertEquals(List.of(4L, 5L, 6L), ids(result));
        assertEquals(2, result.totalPages());
        assertTrue(result.last());
    }

    @Test
    void findAll_negativePage_isRejected() {
        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class, () -> page(-1, 5));

        assertEquals("Page number cannot be negative.", ex.getMessage());
        verify(assetStore, never()).findAll();
    }

    @Test
    void findAll_sizeOutsideLimits_isRejected() {
        assertThrows(IllegalArgumentException.class, () -> page(0, 0));
        assertThrows(IllegalArgumentException.class,
            () -> page(0, AssetQueryService.MAX_PAGE_SIZE + 1));
    }

    // ---------- Sorting ----------

    @Test
    void findAll_sortByNameAscending() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result = service.findAll(0, 3, "name", null, null);

        // Dell, HP, Lenovo ThinkCentre
        assertEquals(List.of(1L, 3L, 6L), ids(result));
    }

    @Test
    void findAll_sortByPurchaseDateDescending() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result =
            service.findAll(0, 2, "purchaseDate,desc", null, null);

        // 2024-05 then 2024-03
        assertEquals(List.of(2L, 5L), ids(result));
    }

    @Test
    void findAll_sortWithNullValues_putsNullsLast() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result =
            service.findAll(0, 6, "assignedTo", null, null);

        assertEquals(List.of(6L), ids(result).subList(5, 6));
    }

    @Test
    void findAll_invalidSort_isRejected() {
        assertThrows(IllegalArgumentException.class,
            () -> service.findAll(0, 5, "price", null, null));
        assertThrows(IllegalArgumentException.class,
            () -> service.findAll(0, 5, "name,up", null, null));
        verify(assetStore, never()).findAll();
    }

    // ---------- Search and filter across all pages ----------

    @Test
    void findAll_searchMatchesNameSerialAndEmployee() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        assertEquals(List.of(2L, 6L),
            ids(service.findAll(0, 5, null, "lenovo", null)));
        assertEquals(List.of(5L),
            ids(service.findAll(0, 5, null, "c02mbp", null)));
        assertEquals(List.of(1L),
            ids(service.findAll(0, 5, null, "  SARA ", null)));
    }

    @Test
    void findAll_statusFilterAppliesBeforePaging() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result = service.findAll(0, 2, null, null, "In Use");

        assertEquals(List.of(1L, 2L), ids(result));
        assertEquals(3, result.totalElements());
        assertEquals(2, result.totalPages());
        assertFalse(result.last());
    }

    @Test
    void findAll_statusAllMeansNoFilter() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        assertEquals(6, service.findAll(0, 5, null, "", "All").totalElements());
        assertEquals(6, service.findAll(0, 5, null, null, " ").totalElements());
    }

    @Test
    void findAll_noMatch_returnsEmptyPage() {
        when(assetStore.findAll()).thenReturn(sixAssets);

        AssetPageResponse result = service.findAll(0, 5, null, "Dell", "Retired");

        assertTrue(result.content().isEmpty());
        assertEquals(0, result.totalElements());
        assertEquals(0, result.totalPages());
    }
}
