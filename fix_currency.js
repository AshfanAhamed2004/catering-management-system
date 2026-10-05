const fs = require('fs');
const files_to_update = [
    'frontend/src/pages/AdminBilling.tsx',
    'frontend/src/pages/AdminBookings.tsx',
    'frontend/src/pages/AdminPackages.tsx',
    'frontend/src/pages/ClientBookingRequest.tsx',
    'frontend/src/pages/ClientDashboard.tsx'
];

for (const filepath of files_to_update) {
    if (!fs.existsSync(filepath)) continue;
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // AdminBilling & AdminBookings function formatting
    content = content.replace(/=> `\$\$\{/g, '=> `Rs. ${');
    content = content.replace(/Amount \(\$\)/g, 'Amount (Rs.)');
    
    // Packages / Dashboard string rendering
    content = content.replace(/>\$\{pkg\.price_per_person/g, '>Rs. ${pkg.price_per_person');
    content = content.replace(/— \$\{p\.price_per_person\}\/pp/g, '— Rs. ${p.price_per_person}/pp');
    content = content.replace(/>\$\{b\.guest_count \* getPackagePrice\(b\.package_id\)\}</g, '>Rs. ${b.guest_count * getPackagePrice(b.package_id)}<');
    content = content.replace(/pkg\.pricePerPerson/g, 'pkg.pricePerPerson'); // Just ensuring
    content = content.replace(/>\$\{pkg\.price_per_person \|\| pkg\.pricePerPerson\}<\/div>/g, '>Rs. ${pkg.price_per_person || pkg.pricePerPerson}</div>');
    
    fs.writeFileSync(filepath, content, 'utf-8');
}
console.log('Done!');
