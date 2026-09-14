package com.catering.crm.controller;

import com.catering.crm.dao.DBConnection;
import com.catering.crm.model.Customer;
import com.catering.crm.model.Inquiry;
import com.catering.crm.model.InquiryStatus;
import com.catering.crm.service.InquiryService;
import com.catering.crm.service.ValidationException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * InquiryHttpHandler functions as the FRONT CONTROLLER in our MVC architecture.
 * Dispatches requests, coordinates Service/DAO layer calls, and returns JSON or web views.
 */
public class InquiryHttpHandler implements HttpHandler {

    private final InquiryService service;

    public InquiryHttpHandler(InquiryService service) {
        this.service = service;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod().toUpperCase();
        URI uri = exchange.getRequestURI();
        String path = uri.getPath();
        String query = uri.getRawQuery();

        // Enable CORS for testing flexibility
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            if (path.startsWith("/api/inquiries/export")) {
                handleExportCsv(exchange);
            } else if (path.equals("/api/stats")) {
                handleGetStats(exchange);
            } else if (path.equals("/api/db-status")) {
                handleDbStatus(exchange);
            } else if (path.startsWith("/api/inquiries")) {
                handleInquiryApi(exchange, method, path, query);
            } else {
                handleStaticFiles(exchange, path);
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendJsonResponse(exchange, 500, "{\"success\":false,\"error\":\"Server Error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    private void handleInquiryApi(HttpExchange exchange, String method, String path, String query) throws IOException {
        String subPath = path.substring("/api/inquiries".length());
        if (subPath.startsWith("/")) subPath = subPath.substring(1);

        if (subPath.isEmpty()) {
            if ("GET".equals(method)) {
                Map<String, String> queryParams = parseQueryParams(query);
                String q = queryParams.get("query");
                String status = queryParams.get("status");
                String channel = queryParams.get("channel");

                List<Inquiry> list = service.searchAndFilter(q, status, channel);
                String json = "{\"success\":true,\"count\":" + list.size() + ",\"data\":" + JsonUtil.toJson(list) + "}";
                sendJsonResponse(exchange, 200, json);
            } else if ("POST".equals(method)) {
                handleCreateInquiry(exchange);
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
            }
        } else if (subPath.endsWith("/status") && "POST".equals(method)) {
            // e.g. /api/inquiries/5/status
            String[] parts = subPath.split("/");
            int id = Integer.parseInt(parts[0]);
            String body = readBody(exchange);
            Map<String, String> data = JsonUtil.parseFormOrJson(body);
            String newStatusStr = data.get("status");
            try {
                InquiryStatus newStatus = InquiryStatus.fromString(newStatusStr);
                boolean ok = service.updateStatus(id, newStatus);
                sendJsonResponse(exchange, ok ? 200 : 400, "{\"success\":" + ok + ",\"message\":\"Status updated successfully\"}");
            } catch (ValidationException ve) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"" + JsonUtil.escape(ve.getMessage()) + "\"}");
            }
        } else if (subPath.equals("update") && "POST".equals(method)) {
            handleUpdateInquiry(exchange);
        } else if (subPath.equals("delete") && "POST".equals(method)) {
            handleDeleteInquiry(exchange);
        } else {
            // Specific ID: /api/inquiries/{id}
            try {
                int id = Integer.parseInt(subPath);
                if ("GET".equals(method)) {
                    Inquiry inq = service.getInquiry(id);
                    if (inq != null) {
                        sendJsonResponse(exchange, 200, "{\"success\":true,\"data\":" + JsonUtil.toJson(inq) + "}");
                    } else {
                        sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Inquiry not found\"}");
                    }
                } else if ("DELETE".equals(method)) {
                    boolean ok = service.removeInquiry(id);
                    sendJsonResponse(exchange, ok ? 200 : 400, "{\"success\":" + ok + "}");
                }
            } catch (NumberFormatException nfe) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Invalid ID format\"}");
            } catch (ValidationException ve) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"" + JsonUtil.escape(ve.getMessage()) + "\"}");
            }
        }
    }

    private void handleCreateInquiry(HttpExchange exchange) throws IOException {
        String body = readBody(exchange);
        Map<String, String> data = JsonUtil.parseFormOrJson(body);

        try {
            Customer customer = new Customer();
            customer.setFullName(data.get("fullName"));
            customer.setEmail(data.get("email"));
            customer.setPhone(data.get("phone"));
            customer.setCompanyName(data.get("companyName"));

            Inquiry inq = new Inquiry();
            inq.setCustomer(customer);
            inq.setEventType(data.get("eventType"));
            
            String dateStr = data.get("eventDate");
            if (dateStr != null && !dateStr.trim().isEmpty()) {
                inq.setEventDate(Date.valueOf(dateStr.trim()));
            }
            
            inq.setGuestCount(parseIntSafe(data.get("guestCount"), 0));
            inq.setVenueLocation(data.get("venueLocation"));
            inq.setCateringStyle(data.get("cateringStyle"));
            inq.setBudgetEstimate(parseDoubleSafe(data.get("budgetEstimate"), 0.0));
            inq.setCommunicationChannel(data.get("communicationChannel"));
            inq.setStatus(InquiryStatus.fromString(data.get("status")));
            inq.setDietaryNotes(data.get("dietaryNotes"));
            inq.setFollowUpNotes(data.get("followUpNotes"));

            boolean ok = service.registerInquiry(inq);
            if (ok) {
                sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Inquiry successfully created!\",\"inquiryId\":" + inq.getInquiryId() + "}");
            } else {
                sendJsonResponse(exchange, 500, "{\"success\":false,\"error\":\"Failed to save inquiry to database\"}");
            }
        } catch (ValidationException ve) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"" + JsonUtil.escape(ve.getMessage()) + "\"}");
        } catch (IllegalArgumentException iae) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"Invalid date format. Expected YYYY-MM-DD\"}");
        }
    }

    private void handleUpdateInquiry(HttpExchange exchange) throws IOException {
        String body = readBody(exchange);
        Map<String, String> data = JsonUtil.parseFormOrJson(body);

        try {
            int inqId = parseIntSafe(data.get("inquiryId"), 0);
            Inquiry inq = service.getInquiry(inqId);
            if (inq == null) {
                sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":\"Inquiry not found\"}");
                return;
            }

            Customer customer = inq.getCustomer();
            if (customer == null) customer = new Customer();
            if (data.containsKey("fullName")) customer.setFullName(data.get("fullName"));
            if (data.containsKey("email")) customer.setEmail(data.get("email"));
            if (data.containsKey("phone")) customer.setPhone(data.get("phone"));
            if (data.containsKey("companyName")) customer.setCompanyName(data.get("companyName"));

            inq.setCustomer(customer);
            if (data.containsKey("eventType")) inq.setEventType(data.get("eventType"));
            if (data.containsKey("eventDate") && !data.get("eventDate").isEmpty()) {
                inq.setEventDate(Date.valueOf(data.get("eventDate").trim()));
            }
            if (data.containsKey("guestCount")) inq.setGuestCount(parseIntSafe(data.get("guestCount"), inq.getGuestCount()));
            if (data.containsKey("venueLocation")) inq.setVenueLocation(data.get("venueLocation"));
            if (data.containsKey("cateringStyle")) inq.setCateringStyle(data.get("cateringStyle"));
            if (data.containsKey("budgetEstimate")) inq.setBudgetEstimate(parseDoubleSafe(data.get("budgetEstimate"), inq.getBudgetEstimate()));
            if (data.containsKey("communicationChannel")) inq.setCommunicationChannel(data.get("communicationChannel"));
            if (data.containsKey("status")) inq.setStatus(InquiryStatus.fromString(data.get("status")));
            if (data.containsKey("dietaryNotes")) inq.setDietaryNotes(data.get("dietaryNotes"));
            if (data.containsKey("followUpNotes")) inq.setFollowUpNotes(data.get("followUpNotes"));

            boolean ok = service.updateInquiry(inq);
            sendJsonResponse(exchange, ok ? 200 : 400, "{\"success\":" + ok + ",\"message\":\"Inquiry updated successfully\"}");
        } catch (ValidationException ve) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"" + JsonUtil.escape(ve.getMessage()) + "\"}");
        }
    }

    private void handleDeleteInquiry(HttpExchange exchange) throws IOException {
        String body = readBody(exchange);
        Map<String, String> data = JsonUtil.parseFormOrJson(body);
        int id = parseIntSafe(data.get("inquiryId"), 0);
        try {
            boolean ok = service.removeInquiry(id);
            sendJsonResponse(exchange, ok ? 200 : 404, "{\"success\":" + ok + ",\"message\":\"Inquiry deleted successfully\"}");
        } catch (ValidationException ve) {
            sendJsonResponse(exchange, 400, "{\"success\":false,\"error\":\"" + JsonUtil.escape(ve.getMessage()) + "\"}");
        }
    }

    private void handleGetStats(HttpExchange exchange) throws IOException {
        int total = service.getTotalCount();
        int newLeads = service.getCountByStatus(InquiryStatus.NEW);
        int contacted = service.getCountByStatus(InquiryStatus.CONTACTED);
        int quoted = service.getCountByStatus(InquiryStatus.QUOTATION_SENT);
        int confirmed = service.getCountByStatus(InquiryStatus.CONFIRMED);
        int cancelled = service.getCountByStatus(InquiryStatus.CANCELLED);

        double conversionRate = total > 0 ? ((double) confirmed / total) * 100.0 : 0.0;

        String json = String.format(
            "{\"total\":%d,\"newLeads\":%d,\"contacted\":%d,\"quoted\":%d,\"confirmed\":%d,\"cancelled\":%d,\"conversionRate\":\"%.1f%%\"}",
            total, newLeads, contacted, quoted, confirmed, cancelled, conversionRate
        );
        sendJsonResponse(exchange, 200, json);
    }

    private void handleDbStatus(HttpExchange exchange) throws IOException {
        String dbInfo = DBConnection.getInstance().getActiveDatabaseType();
        sendJsonResponse(exchange, 200, "{\"database\":\"" + JsonUtil.escape(dbInfo) + "\"}");
    }

    private void handleExportCsv(HttpExchange exchange) throws IOException {
        List<Inquiry> list = service.getAllInquiries();
        StringBuilder csv = new StringBuilder();
        csv.append("InquiryID,CustomerName,Phone,Email,Company,EventType,EventDate,GuestCount,Venue,Style,Budget,Channel,Status,DietaryNotes\n");

        for (Inquiry i : list) {
            Customer c = i.getCustomer();
            csv.append(i.getInquiryId()).append(",")
               .append("\"").append(c != null ? c.getFullName() : "").append("\",")
               .append("\"").append(c != null ? c.getPhone() : "").append("\",")
               .append("\"").append(c != null ? c.getEmail() : "").append("\",")
               .append("\"").append(c != null && c.getCompanyName() != null ? c.getCompanyName() : "").append("\",")
               .append("\"").append(i.getEventType()).append("\",")
               .append(i.getEventDate()).append(",")
               .append(i.getGuestCount()).append(",")
               .append("\"").append(i.getVenueLocation()).append("\",")
               .append("\"").append(i.getCateringStyle()).append("\",")
               .append(String.format("%.2f", i.getBudgetEstimate())).append(",")
               .append("\"").append(i.getCommunicationChannel()).append("\",")
               .append("\"").append(i.getStatus().name()).append("\",")
               .append("\"").append(i.getDietaryNotes() != null ? i.getDietaryNotes() : "").append("\"\n");
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "text/csv; charset=UTF-8");
        exchange.getResponseHeaders().add("Content-Disposition", "attachment; filename=\"culinary_connect_inquiries.csv\"");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void handleStaticFiles(HttpExchange exchange, String path) throws IOException {
        String filePath = path;
        if (filePath.equals("/") || filePath.equals("/crm") || filePath.isEmpty()) {
            filePath = "/index.html";
        }

        InputStream is = getClass().getResourceAsStream("/web" + filePath);
        if (is == null) {
            File f = new File("src/main/resources/web" + filePath);
            if (f.exists() && f.isFile()) {
                is = new FileInputStream(f);
            }
        }

        if (is == null) {
            String notFound = "<h1>404 Not Found</h1><p>Resource " + path + " not found.</p>";
            sendHtmlResponse(exchange, 404, notFound);
            return;
        }

        String mime = "text/html; charset=UTF-8";
        if (filePath.endsWith(".css")) mime = "text/css; charset=UTF-8";
        else if (filePath.endsWith(".js")) mime = "application/javascript; charset=UTF-8";
        else if (filePath.endsWith(".png")) mime = "image/png";
        else if (filePath.endsWith(".svg")) mime = "image/svg+xml";

        byte[] bytes = is.readAllBytes();
        is.close();

        exchange.getResponseHeaders().add("Content-Type", mime);
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendJsonResponse(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendHtmlResponse(HttpExchange exchange, int status, String html) throws IOException {
        byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "text/html; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        for (String pair : query.split("&")) {
            int idx = pair.indexOf('=');
            if (idx > 0) {
                try {
                    String k = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String v = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    map.put(k, v);
                } catch (Exception ignored) {}
            }
        }
        return map;
    }

    private int parseIntSafe(String val, int def) {
        if (val == null) return def;
        try { return Integer.parseInt(val.trim()); } catch (Exception e) { return def; }
    }

    private double parseDoubleSafe(String val, double def) {
        if (val == null) return def;
        try { return Double.parseDouble(val.trim()); } catch (Exception e) { return def; }
    }
}
