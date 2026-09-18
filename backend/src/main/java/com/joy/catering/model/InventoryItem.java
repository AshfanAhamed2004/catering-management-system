package com.joy.catering.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
public class InventoryItem extends BaseEntity {
    private String name;
    private String category;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String sku;
    private String maintenanceStatus;
}
