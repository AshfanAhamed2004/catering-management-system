package com.joy.catering.controller;

import com.joy.catering.model.InventoryItem;
import com.joy.catering.repo.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryItemRepository.findAll();
    }

    @PostMapping
    public InventoryItem create(@RequestBody InventoryItem item) {
        if (item.getAvailableQuantity() == null) {
            item.setAvailableQuantity(item.getTotalQuantity());
        }
        return inventoryItemRepository.save(item);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItem> update(@PathVariable Long id, @RequestBody InventoryItem itemDetails) {
        return inventoryItemRepository.findById(id).map(item -> {
            item.setName(itemDetails.getName());
            item.setCategory(itemDetails.getCategory());
            item.setTotalQuantity(itemDetails.getTotalQuantity());
            item.setAvailableQuantity(itemDetails.getAvailableQuantity());
            item.setSku(itemDetails.getSku());
            item.setMaintenanceStatus(itemDetails.getMaintenanceStatus());
            return ResponseEntity.ok(inventoryItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return inventoryItemRepository.findById(id).map(item -> {
            inventoryItemRepository.delete(item);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
