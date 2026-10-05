
const axios = require("axios");

async function run() {
  try {
    const login = await axios.post("http://localhost:8000/auth/login", { email: "gm@smartserve.com", password: "password123" });
    const token = login.data.access_token;
    
    console.log("Token:", token.substring(0,10) + "...");
    
    console.log("Trying SNAKE CASE...");
    try {
      const res = await axios.post("http://localhost:8000/staff/packages", {
        name: "Test Package Snake",
        description: "Test description snake",
        event_type_id: 1,
        price_per_person: 60,
        minimum_guest_count: 40,
        maximum_guest_count: 500,
        menu_item_ids: [1],
        is_active: true
      }, { headers: { Authorization: "Bearer " + token }});
      console.log("SNAKE CASE WORKED!");
      // clean it up
      await axios.delete("http://localhost:8000/staff/packages/" + res.data.id, { headers: { Authorization: "Bearer " + token }});
    } catch (err) {
      console.log("SNAKE CASE FAILED:", err.response?.data);
    }

    console.log("Trying CAMEL CASE...");
    try {
      const res = await axios.post("http://localhost:8000/staff/packages", {
        name: "Test Package Camel",
        description: "Test description camel",
        eventTypeId: 1,
        pricePerPerson: 60,
        minimumGuestCount: 40,
        maximumGuestCount: 500,
        menuItemIds: [1],
        isActive: true
      }, { headers: { Authorization: "Bearer " + token }});
      console.log("CAMEL CASE WORKED!");
      await axios.delete("http://localhost:8000/staff/packages/" + res.data.id, { headers: { Authorization: "Bearer " + token }});
    } catch (err) {
      console.log("CAMEL CASE FAILED:", err.response?.data);
    }
  } catch(e) {
    console.log("Login failed", e);
  }
}
run();

