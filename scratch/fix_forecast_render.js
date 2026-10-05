
const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/AdminForecasting.tsx", "utf8");

// We need to replace the property accesses in renderForecastTable.
code = code.replace(/forecast\.packageName/g, "(forecast.package_name || forecast.packageName)");
code = code.replace(/forecast\.guestCount/g, "(forecast.guest_count || forecast.guestCount)");
code = code.replace(/forecast\.bookingReference/g, "(forecast.booking_reference || forecast.bookingReference)");
code = code.replace(/forecast\.eventDate/g, "(forecast.event_date || forecast.eventDate)");

code = code.replace(/item\.ingredientName/g, "(item.ingredient_name || item.ingredientName)");
code = code.replace(/item\.quantityPerGuestTotal\.toFixed/g, "Number(item.quantity_per_guest_total || item.quantityPerGuestTotal).toFixed");
code = code.replace(/item\.requiredQuantity\.toFixed/g, "Number(item.required_quantity || item.requiredQuantity).toFixed");
code = code.replace(/item\.contributingMenuItems\.join/g, "(item.contributing_menu_items || item.contributingMenuItems || []).join");

fs.writeFileSync("frontend/src/pages/AdminForecasting.tsx", code);

