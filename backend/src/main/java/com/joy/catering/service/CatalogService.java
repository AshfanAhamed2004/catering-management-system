package com.joy.catering.service;
import com.joy.catering.*; import com.joy.catering.dto.Dtos.*; import com.joy.catering.model.*; import com.joy.catering.repo.*; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import java.util.*;
@Service public class CatalogService {
 final EventTypeRepository events; final MenuItemRepository menus; final PackageRepository packages;
 public CatalogService(EventTypeRepository e,MenuItemRepository m,PackageRepository p){events=e;menus=m;packages=p;}
 public PackageEntity save(PackageInput d,Long id){if(d.maximumGuestCount()!=null&&d.maximumGuestCount()<d.minimumGuestCount())throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Maximum guest count must be at least the minimum");if(new HashSet<>(d.menuItemIds()).size()!=d.menuItemIds().size())throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Menu items must not be duplicated");
  EventType e=events.findById(d.eventTypeId()).orElseThrow(()->new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Event type does not exist"));List<MenuItem> items=menus.findAllById(d.menuItemIds());if(items.size()!=d.menuItemIds().size())throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"One or more menu items do not exist");if(d.isActive()&&items.stream().anyMatch(x->!x.isActive()))throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"Active packages must contain only active menu items");
  PackageEntity p=id==null?new PackageEntity():packages.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Package not found"));p.setName(d.name());p.setDescription(d.description());p.setEventType(e);p.setPricePerPerson(d.pricePerPerson());p.setMinimumGuestCount(d.minimumGuestCount());p.setMaximumGuestCount(d.maximumGuestCount());p.setActive(d.isActive());p.setMenuItems(items);return packages.save(p);}
 public boolean publicAvailable(PackageEntity p){return p.isActive()&&!p.getMenuItems().stream().anyMatch(x->!x.isActive());}
}
