package com.catering.crm.controller;

import com.catering.crm.model.Customer;
import com.catering.crm.model.Inquiry;
import com.catering.crm.model.InquiryStatus;

import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Lightweight, zero-dependency JSON utility for the CRM REST endpoints.
 */
public class JsonUtil {

    public static String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    public static String toJson(Customer c) {
        if (c == null) return "null";
        return String.format(
            "{\"customerId\":%d,\"fullName\":\"%s\",\"email\":\"%s\",\"phone\":\"%s\",\"companyName\":\"%s\"}",
            c.getCustomerId(),
            escape(c.getFullName()),
            escape(c.getEmail()),
            escape(c.getPhone()),
            escape(c.getCompanyName())
        );
    }

    public static String toJson(Inquiry i) {
        if (i == null) return "null";
        String custJson = i.getCustomer() != null ? toJson(i.getCustomer()) : "null";
        return String.format(
            "{\"inquiryId\":%d,\"customerId\":%d,\"customer\":%s,\"eventType\":\"%s\",\"eventDate\":\"%s\",\"guestCount\":%d,\"venueLocation\":\"%s\",\"cateringStyle\":\"%s\",\"budgetEstimate\":%.2f,\"communicationChannel\":\"%s\",\"status\":\"%s\",\"statusDisplayName\":\"%s\",\"dietaryNotes\":\"%s\",\"followUpNotes\":\"%s\"}",
            i.getInquiryId(),
            i.getCustomerId(),
            custJson,
            escape(i.getEventType()),
            i.getEventDate() != null ? i.getEventDate().toString() : "",
            i.getGuestCount(),
            escape(i.getVenueLocation()),
            escape(i.getCateringStyle()),
            i.getBudgetEstimate(),
            escape(i.getCommunicationChannel()),
            i.getStatus() != null ? i.getStatus().name() : "NEW",
            i.getStatus() != null ? i.getStatus().getDisplayName() : "New Lead",
            escape(i.getDietaryNotes()),
            escape(i.getFollowUpNotes())
        );
    }

    public static String toJson(List<Inquiry> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(toJson(list.get(i)));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Simple parser for flat JSON or Form-Urlencoded key-values.
     */
    public static Map<String, String> parseFormOrJson(String body) {
        Map<String, String> map = new HashMap<>();
        if (body == null || body.trim().isEmpty()) return map;

        String trimmed = body.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            // Strip outer braces
            String inner = trimmed.substring(1, trimmed.length() - 1).trim();
            // Split by comma outside quotes
            boolean inQuotes = false;
            StringBuilder current = new StringBuilder();
            for (int i = 0; i < inner.length(); i++) {
                char c = inner.charAt(i);
                if (c == '\"') inQuotes = !inQuotes;
                if (c == ',' && !inQuotes) {
                    processPair(current.toString(), map);
                    current.setLength(0);
                } else {
                    current.append(c);
                }
            }
            if (current.length() > 0) {
                processPair(current.toString(), map);
            }
        } else {
            // URL Encoded (a=b&c=d)
            for (String pair : body.split("&")) {
                int idx = pair.indexOf('=');
                if (idx > 0) {
                    try {
                        String key = java.net.URLDecoder.decode(pair.substring(0, idx), "UTF-8");
                        String val = java.net.URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
                        map.put(key, val);
                    } catch (Exception ignored) {}
                }
            }
        }
        return map;
    }

    private static void processPair(String raw, Map<String, String> map) {
        int colon = raw.indexOf(':');
        if (colon > 0) {
            String key = clean(raw.substring(0, colon));
            String val = clean(raw.substring(colon + 1));
            map.put(key, val);
        }
    }

    private static String clean(String s) {
        s = s.trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1);
        }
        return s.replace("\\\"", "\"").replace("\\\\", "\\").trim();
    }
}
