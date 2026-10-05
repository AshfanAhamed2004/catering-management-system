
const fs = require("fs");
let ui = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", "utf8");

// We need to add EntityManager to the constructor
ui = ui.replace(
  "public UserController(UserRepository u,ProfileRepository p, PasswordEncoder e){users=u;profiles=p;passwordEncoder=e;}",
  "final jakarta.persistence.EntityManager em;\n public UserController(UserRepository u,ProfileRepository p, PasswordEncoder e, jakarta.persistence.EntityManager em){users=u;profiles=p;passwordEncoder=e;this.em=em;}"
);

// Add the DeleteMapping
const deleteMapping = `
 @DeleteMapping("/admin/users/{id}")
 @PreAuthorize("hasRole('GENERAL_MANAGER')")
 @org.springframework.transaction.annotation.Transactional
 public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication a){
   User gm = (User) a.getPrincipal();
   if(id.equals(gm.getId())) throw new ApiException(HttpStatus.CONFLICT, "Cannot delete your own account");
   User u = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
   
   em.createNativeQuery("DELETE FROM staff_schedules WHERE staff_id = :id").setParameter("id", id).executeUpdate();
   em.createNativeQuery("DELETE FROM waste_records WHERE recorded_by_id = :id").setParameter("id", id).executeUpdate();
   em.createNativeQuery("DELETE FROM password_resets WHERE user_id = :id").setParameter("id", id).executeUpdate();
   em.createNativeQuery("DELETE FROM feedback_categories WHERE feedback_id IN (SELECT id FROM feedbacks WHERE customer_id = :id)").setParameter("id", id).executeUpdate();
   em.createNativeQuery("DELETE FROM feedbacks WHERE customer_id = :id").setParameter("id", id).executeUpdate();
   em.createNativeQuery("DELETE FROM bookings WHERE customer_id = :id").setParameter("id", id).executeUpdate();
   em.createNativeQuery("DELETE FROM customer_profiles WHERE user_id = :id").setParameter("id", id).executeUpdate();
   users.delete(u);
   return ResponseEntity.ok().build();
 }
`;

ui = ui.replace("}", deleteMapping + "\n}");

fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", ui);

