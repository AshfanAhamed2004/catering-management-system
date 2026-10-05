
const axios = require("axios");
async function run() {
  try {
    const login = await axios.post("http://localhost:8000/auth/login", { email: "admin@smartserve.com", password: "password" });
    const token = login.data.access_token;
    
    const res = await axios.post("http://localhost:8000/staff/menu-items/1/ingredients", {
      ingredientName: "Lobster Test",
      quantityPerGuest: 0.25,
      unit: "kg"
    }, { headers: { Authorization: "Bearer " + token }});
    console.log("CAMELCASE WORKED:", res.data);
  } catch(e) {
    console.log("CAMELCASE FAILED:", e.response?.data);
  }
  
  try {
    const login = await axios.post("http://localhost:8000/auth/login", { email: "admin@smartserve.com", password: "password" });
    const token = login.data.access_token;
    
    const res = await axios.post("http://localhost:8000/staff/menu-items/1/ingredients", {
      ingredient_name: "Lobster Test",
      quantity_per_guest: 0.25,
      unit: "kg"
    }, { headers: { Authorization: "Bearer " + token }});
    console.log("SNAKECASE WORKED:", res.data);
  } catch(e) {
    console.log("SNAKECASE FAILED:", e.response?.data);
  }
}
run();

