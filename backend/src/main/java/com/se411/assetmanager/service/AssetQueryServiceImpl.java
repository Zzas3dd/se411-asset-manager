package com.se411.assetmanager.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import org.springframework.stereotype.Service;

import com.se411.assetmanager.dto.AssetPageResponse;
import com.se411.assetmanager.model.Asset;
import com.se411.assetmanager.repository.AssetStore;

@Service
public class AssetQueryServiceImpl implements AssetQueryService {

    // Fields the client is allowed to sort by
    private static final Map<String, Function<Asset, Comparable<?>>> SORTABLE_FIELDS = Map.of(
            "id", Asset::getId,
            "name", asset -> lower(asset.getName()),
            "type", asset -> lower(asset.getType()),
            "serialNumber", asset -> lower(asset.getSerialNumber()),
            "assignedTo", asset -> lower(asset.getAssignedTo()),
            "status", asset -> lower(asset.getStatus()),
            "purchaseDate", Asset::getPurchaseDate
    );

    private final AssetStore assetStore;

    // Dependency injection: Spring provides the shared AssetStore bean
    public AssetQueryServiceImpl(AssetStore assetStore) {
        this.assetStore = assetStore;
    }

    @Override
    public Optional<Asset> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return assetStore.findById(id);
    }

    @Override
    public AssetPageResponse findAll(int page, int size, String sort,
                                     String search, String status) {

        // 1. Validate the paging parameters
        if (page < 0) {
            throw new IllegalArgumentException(
                "Page number cannot be negative."
            );
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException(
                "Page size must be between 1 and " + MAX_PAGE_SIZE + "."
            );
        }

        Comparator<Asset> order = buildComparator(sort);

        // 2. Filter ALL assets first, then sort, so search works across pages
        List<Asset> matching = assetStore.findAll()
                .stream()
                .filter(asset -> matchesSearch(asset, search))
                .filter(asset -> matchesStatus(asset, status))
                .sorted(order)
                .toList();

        // 3. Cut out the requested page
        long totalElements = matching.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        long start = (long) page * size;

        // A page past the end returns an empty list, not an error
        List<Asset> content = start >= totalElements
                ? List.of()
                : matching.subList((int) start,
                        (int) Math.min(start + size, totalElements));

        return new AssetPageResponse(
                content, page, size, totalElements, totalPages,
                page == 0, page >= totalPages - 1
        );
    }

    /**
     * Build the sort order from "field" or "field,asc|desc".
     * The ID is always the final tie-breaker, so the order is stable
     * and no asset appears on two pages.
     */
    private Comparator<Asset> buildComparator(String sort) {
        Comparator<Asset> byId = Comparator.comparing(
                Asset::getId, Comparator.nullsLast(Comparator.naturalOrder()));

        if (sort == null || sort.isBlank()) {
            return byId;
        }

        String[] parts = sort.split(",");
        String field = parts[0].trim();
        String direction = parts.length > 1
                ? parts[1].trim().toLowerCase(Locale.ROOT)
                : "asc";

        Function<Asset, Comparable<?>> key = SORTABLE_FIELDS.get(field);

        if (key == null || parts.length > 2
                || !(direction.equals("asc") || direction.equals("desc"))) {
            throw new IllegalArgumentException(
                "Invalid sort. Use field or field,asc|desc with one of: "
                + String.join(", ", SORTABLE_FIELDS.keySet().stream().sorted().toList())
                + "."
            );
        }

        @SuppressWarnings({"unchecked", "rawtypes"})
        Comparator<Asset> byField = Comparator.comparing(
                (Function) key,
                Comparator.nullsLast(Comparator.naturalOrder()));

        if (direction.equals("desc")) {
            byField = byField.reversed();
        }

        return byField.thenComparing(byId);
    }

    private boolean matchesSearch(Asset asset, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        String term = search.trim().toLowerCase(Locale.ROOT);

        return contains(asset.getName(), term)
                || contains(asset.getSerialNumber(), term)
                || contains(asset.getAssignedTo(), term);
    }

    private boolean matchesStatus(Asset asset, String status) {
        if (status == null || status.isBlank()
                || status.trim().equalsIgnoreCase("All")) {
            return true;
        }
        return asset.getStatus() != null
                && asset.getStatus().equalsIgnoreCase(status.trim());
    }

    private static boolean contains(String value, String term) {
        return value != null
                && value.toLowerCase(Locale.ROOT).contains(term);
    }

    private static String lower(String value) {
        return value == null ? null : value.toLowerCase(Locale.ROOT);
    }
}
