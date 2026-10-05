
const fs = require("fs");
let ui = fs.readFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", "utf8");

const oldMethod = `
    @PutMapping("/admin/users/{id}") 
    @PreAuthorize("hasRole('GENERAL_MANAGER')") 
    UserOut updateUser(@PathVariable Long id,@Valid @RequestBody UserUpdate d,Authentication a){
        User GENERAL_MANAGER=(User)a.getPrincipal();
        if(id.equals(GENERAL_MANAGER.getId()))throw new ApiException(HttpStatus.CONFLICT,"Use another administrator to change your own access");
        User u=users.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"User not found"));
        if((u.getRole()==Role.CUSTOMER)!=(d.role()==Role.CUSTOMER))throw new ApiException(HttpStatus.CONFLICT,"Customer and staff identities cannot be converted; create a separate staff account");
        u.setRole(d.role());
        u.setActive(d.isActive());
        u.setTokenVersion(u.getTokenVersion()+1);
        return Mapping.user(users.save(u));
    }
`.trim();

const newMethod = `
    @PutMapping("/admin/users/{id}") 
    @PreAuthorize("hasRole('GENERAL_MANAGER')") 
    @Transactional
    public UserOut updateUser(@PathVariable Long id,@Valid @RequestBody UserUpdate d,Authentication a){
        User GENERAL_MANAGER=(User)a.getPrincipal();
        if(id.equals(GENERAL_MANAGER.getId()))throw new ApiException(HttpStatus.CONFLICT,"Use another administrator to change your own access");
        User u=users.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"User not found"));
        if((u.getRole()==Role.CUSTOMER)!=(d.role()==Role.CUSTOMER))throw new ApiException(HttpStatus.CONFLICT,"Customer and staff identities cannot be converted; create a separate staff account");
        u.setRole(d.role());
        u.setActive(d.isActive());
        u.setTokenVersion(u.getTokenVersion()+1);
        
        if (d.fullName() != null && !d.fullName().trim().isEmpty()) {
            CustomerProfile p = profiles.findByUserId(id).orElse(null);
            if (p != null) {
                p.setFullName(d.fullName());
                profiles.save(p);
                u.setProfile(p);
            }
        }
        
        return Mapping.user(users.save(u));
    }
`.trim();

ui = ui.replace(oldMethod, newMethod);
fs.writeFileSync("backend/src/main/java/com/joy/catering/controller/UserController.java", ui);

