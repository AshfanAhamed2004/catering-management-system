
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminPackages.tsx", "utf8");

const oldPayload = `const payload = {
      name,
      description,
      eventTypeId: Number(eventTypeId),
      pricePerPerson: Number(pricePerPerson),
      minimumGuestCount: Number(minimumGuestCount),
      maximumGuestCount: maximumGuestCount ? Number(maximumGuestCount) : null,
      menuItemIds: selectedMenuItems,
      isActive
    };`;

const newPayload = `const payload = {
      name,
      description,
      event_type_id: Number(eventTypeId),
      price_per_person: Number(pricePerPerson),
      minimum_guest_count: Number(minimumGuestCount),
      maximum_guest_count: maximumGuestCount ? Number(maximumGuestCount) : null,
      menu_item_ids: selectedMenuItems,
      is_active: isActive
    };`;

code = code.replace(oldPayload, newPayload);
fs.writeFileSync("frontend/src/pages/AdminPackages.tsx", code);

