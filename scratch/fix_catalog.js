
const fs = require("fs");
let code = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/CatalogController.java", "utf8");

// Add DELETE menu items
if (!code.includes("@DeleteMapping(\"/staff/menu-items/{id}\")")) {
  code = code.replace(
    "@GetMapping(\"/staff/packages\")", 
    "@DeleteMapping(\"/staff/menu-items/{id}\") @PreAuthorize(\"hasAnyRole(\"HEAD_CHEF\",\"GENERAL_MANAGER\")\") ResponseEntity<Void> deleteMenu(@PathVariable Long id){try{menus.deleteById(id);return ResponseEntity.noContent().build();}catch(org.springframework.dao.DataIntegrityViolationException e){throw new ApiException(HttpStatus.CONFLICT,\"Cannot delete menu item because it is included in one or more packages.\");}}\n @GetMapping(\"/staff/packages\")"
  );
}

// Add DELETE packages
if (!code.includes("@DeleteMapping(\"/staff/packages/{id}\")")) {
  code = code.replace(
    "}\n", 
    " @DeleteMapping(\"/staff/packages/{id}\") @PreAuthorize(\"hasAnyRole(\"HEAD_CHEF\",\"GENERAL_MANAGER\")\") ResponseEntity<Void> deletePackage(@PathVariable Long id){try{packages.deleteById(id);return ResponseEntity.noContent().build();}catch(org.springframework.dao.DataIntegrityViolationException e){throw new ApiException(HttpStatus.CONFLICT,\"Cannot delete package because it is currently booked by customers.\");}}\n}\n"
  );
}

fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/CatalogController.java", code);

