import os

files_to_update = [
    'frontend/src/pages/AdminBilling.tsx',
    'frontend/src/pages/AdminBookings.tsx',
    'frontend/src/pages/AdminPackages.tsx',
    'frontend/src/pages/ClientBookingRequest.tsx',
    'frontend/src/pages/ClientDashboard.tsx'
]

for filepath in files_to_update:
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('`$${\', \'`Rs. ${\')
    content = content.replace('`$${', '`Rs. ${')
    content = content.replace('Amount ($)', 'Amount (Rs.)')
    content = content.replace('>${pkg.price_per_person', '>Rs. ${pkg.price_per_person')
    content = content.replace('— ${p.price_per_person}/pp', '— Rs. ${p.price_per_person}/pp')
    content = content.replace('>${b.guest_count * getPackagePrice(b.package_id)}<', '>Rs. ${b.guest_count * getPackagePrice(b.package_id)}<')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Done!')
