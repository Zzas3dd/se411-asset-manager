
package com.se411.assetmanager.model;

import java.time.LocalDate;

public class Asset {

    private Long id;
    private String name;
    private String type;
    private String serialNumber;
    private String assignedTo;
    private String status;
    private LocalDate purchaseDate;

    // Empty constructor
    public Asset() {
    }

    // Constructor with all fields
    public Asset(Long id, String name, String type,
                 String serialNumber, String assignedTo,
                 String status, LocalDate purchaseDate) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.serialNumber = serialNumber;
        this.assignedTo = assignedTo;
        this.status = status;
        this.purchaseDate = purchaseDate;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
}
