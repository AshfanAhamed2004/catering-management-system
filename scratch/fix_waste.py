
import re
with open('frontend/src/pages/AdminWasteTracker.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix table reading
code = code.replace('{record.ingredientName}', '{record.ingredient_name || record.ingredientName}')
code = code.replace('{record.wasteDate}', '{record.waste_date || record.wasteDate}')
code = code.replace('{record.bookingReference', '{record.booking_reference || record.bookingReference')
code = code.replace('{record.recordedByName}', '{record.recorded_by_name || record.recordedByName}')

# Fix openModal
code = code.replace('setIngredientName(record.ingredientName);', 'setIngredientName(record.ingredient_name || record.ingredientName);')
code = code.replace('setWasteDate(record.wasteDate);', 'setWasteDate(record.waste_date || record.wasteDate);')
code = code.replace('setBookingId(record.bookingId ? String(record.bookingId) : '''');', 'setBookingId((record.booking_id || record.bookingId) ? String(record.booking_id || record.bookingId) : '''');')

# Fix POST / PUT payload
old_payload = '''const payload = {
          ingredientName,
          quantity: Number(quantity),
          unit,
          category,
          wasteDate,
          bookingId: bookingId ? Number(bookingId) : null,
          notes
        };'''

new_payload = '''const payload = {
          ingredient_name: ingredientName,
          quantity: Number(quantity),
          unit,
          category,
          waste_date: wasteDate,
          booking_id: bookingId ? Number(bookingId) : null,
          notes
        };'''

code = code.replace(old_payload, new_payload)

with open('frontend/src/pages/AdminWasteTracker.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

