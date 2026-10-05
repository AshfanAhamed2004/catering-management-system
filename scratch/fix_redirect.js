
const fs = require("fs");
let code = fs.readFileSync("frontend/src/auth.tsx", "utf8");

const oldComponent = `    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded shadow max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">403 Unauthorized</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access this page.</p>
          <Link to={getDashboardRoute(user.role)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );`;

const newComponent = `    return <Navigate to={getDashboardRoute(user.role)} replace />;`;

code = code.replace(oldComponent, newComponent);

fs.writeFileSync("frontend/src/auth.tsx", code);

