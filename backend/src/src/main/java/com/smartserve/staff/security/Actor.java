package com.smartserve.staff.security;
import com.smartserve.staff.entity.*;
import com.smartserve.staff.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
@Component public class Actor {
    private final UserRepository users;
    public Actor(UserRepository users){this.users=users;}
    public AppUser current(){
        var auth=SecurityContextHolder.getContext().getAuthentication();
        if(auth==null || !auth.isAuthenticated())throw new AccessDeniedException("Please sign in.");
        var user=users.findByEmail(auth.getName()).orElseThrow(()->new AccessDeniedException("Please sign in."));
        if(!user.active)throw new AccessDeniedException("Account is inactive.");
        return user;
    }
    public AppUser manager(){var u=current();if(u.role!=Role.OPERATIONS_MANAGER && u.role!=Role.ADMIN)throw new AccessDeniedException("Manager access required.");return u;}
    public AppUser staff(){var u=current();if(u.role!=Role.STAFF)throw new AccessDeniedException("Staff access required.");return u;}
}

