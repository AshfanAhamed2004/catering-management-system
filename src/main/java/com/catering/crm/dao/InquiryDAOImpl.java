package com.catering.crm.dao;

import com.catering.crm.model.Customer;
import com.catering.crm.model.Inquiry;
import com.catering.crm.model.InquiryStatus;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Concrete implementation of InquiryDAO utilizing PreparedStatement
 * to ensure security against SQL injection.
 */
public class InquiryDAOImpl implements InquiryDAO {

    @Override
    public boolean createInquiry(Inquiry inquiry) {
        // Ensure customer exists or is created first
        int customerId = getOrCreateCustomerId(inquiry.getCustomer());
        inquiry.setCustomerId(customerId);

        String sql = """
            INSERT INTO inquiries (customer_id, event_type, event_date, guest_count,
                                   venue_location, catering_style, budget_estimate,
                                   communication_channel, status, dietary_notes, follow_up_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, inquiry.getCustomerId());
            ps.setString(2, inquiry.getEventType());
            ps.setDate(3, inquiry.getEventDate());
            ps.setInt(4, inquiry.getGuestCount());
            ps.setString(5, inquiry.getVenueLocation());
            ps.setString(6, inquiry.getCateringStyle());
            ps.setDouble(7, inquiry.getBudgetEstimate());
            ps.setString(8, inquiry.getCommunicationChannel());
            ps.setString(9, inquiry.getStatus() != null ? inquiry.getStatus().name() : InquiryStatus.NEW.name());
            ps.setString(10, inquiry.getDietaryNotes());
            ps.setString(11, inquiry.getFollowUpNotes());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        inquiry.setInquiryId(rs.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error inserting inquiry: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public Inquiry getInquiryById(int id) {
        String sql = """
            SELECT i.*, c.full_name, c.email, c.phone, c.company_name
            FROM inquiries i
            JOIN customers c ON i.customer_id = c.customer_id
            WHERE i.inquiry_id = ?
        """;
        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToInquiry(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error finding inquiry by id: " + e.getMessage());
        }
        return null;
    }

    @Override
    public List<Inquiry> getAllInquiries() {
        return searchAndFilterInquiries(null, null, null);
    }

    @Override
    public List<Inquiry> searchAndFilterInquiries(String query, String status, String channel) {
        List<Inquiry> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT i.*, c.full_name, c.email, c.phone, c.company_name
            FROM inquiries i
            JOIN customers c ON i.customer_id = c.customer_id
            WHERE 1=1
        """);

        List<Object> params = new ArrayList<>();

        if (query != null && !query.trim().isEmpty()) {
            sql.append(" AND (LOWER(c.full_name) LIKE ? OR c.phone LIKE ? OR LOWER(i.venue_location) LIKE ? OR LOWER(i.event_type) LIKE ?)");
            String q = "%" + query.trim().toLowerCase() + "%";
            params.add(q);
            params.add(q);
            params.add(q);
            params.add(q);
        }

        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            sql.append(" AND i.status = ?");
            params.add(status.trim().toUpperCase());
        }

        if (channel != null && !channel.trim().isEmpty() && !"ALL".equalsIgnoreCase(channel.trim())) {
            sql.append(" AND i.communication_channel = ?");
            params.add(channel.trim());
        }

        sql.append(" ORDER BY i.inquiry_id DESC");

        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRowToInquiry(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error querying inquiries: " + e.getMessage());
        }
        return list;
    }

    @Override
    public boolean updateInquiry(Inquiry inquiry) {
        String sql = """
            UPDATE inquiries
            SET event_type = ?, event_date = ?, guest_count = ?, venue_location = ?,
                catering_style = ?, budget_estimate = ?, communication_channel = ?,
                status = ?, dietary_notes = ?, follow_up_notes = ?
            WHERE inquiry_id = ?
        """;
        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, inquiry.getEventType());
            ps.setDate(2, inquiry.getEventDate());
            ps.setInt(3, inquiry.getGuestCount());
            ps.setString(4, inquiry.getVenueLocation());
            ps.setString(5, inquiry.getCateringStyle());
            ps.setDouble(6, inquiry.getBudgetEstimate());
            ps.setString(7, inquiry.getCommunicationChannel());
            ps.setString(8, inquiry.getStatus().name());
            ps.setString(9, inquiry.getDietaryNotes());
            ps.setString(10, inquiry.getFollowUpNotes());
            ps.setInt(11, inquiry.getInquiryId());

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error updating inquiry: " + e.getMessage());
        }
        return false;
    }

    @Override
    public boolean updateInquiryStatus(int inquiryId, InquiryStatus status) {
        String sql = "UPDATE inquiries SET status = ? WHERE inquiry_id = ?";
        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, inquiryId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error updating status: " + e.getMessage());
        }
        return false;
    }

    @Override
    public boolean deleteInquiry(int inquiryId) {
        String sql = "DELETE FROM inquiries WHERE inquiry_id = ?";
        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, inquiryId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error deleting inquiry: " + e.getMessage());
        }
        return false;
    }

    @Override
    public int getOrCreateCustomerId(Customer customer) {
        if (customer == null) return 1;

        Connection conn = DBConnection.getInstance().getConnection();
        // Check if customer with same phone exists
        String checkSql = "SELECT customer_id FROM customers WHERE phone = ?";
        try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
            ps.setString(1, customer.getPhone());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("customer_id");
                }
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error looking up customer: " + e.getMessage());
        }

        // Insert new customer
        String insertSql = "INSERT INTO customers (full_name, email, phone, company_name) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, customer.getFullName());
            ps.setString(2, customer.getEmail());
            ps.setString(3, customer.getPhone());
            ps.setString(4, customer.getCompanyName());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error inserting customer: " + e.getMessage());
        }
        return 1;
    }

    @Override
    public Customer getCustomerById(int customerId) {
        String sql = "SELECT * FROM customers WHERE customer_id = ?";
        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, customerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Customer c = new Customer();
                    c.setCustomerId(rs.getInt("customer_id"));
                    c.setFullName(rs.getString("full_name"));
                    c.setEmail(rs.getString("email"));
                    c.setPhone(rs.getString("phone"));
                    c.setCompanyName(rs.getString("company_name"));
                    return c;
                }
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error finding customer: " + e.getMessage());
        }
        return null;
    }

    @Override
    public List<Customer> getAllCustomers() {
        List<Customer> list = new ArrayList<>();
        String sql = "SELECT * FROM customers ORDER BY full_name ASC";
        Connection conn = DBConnection.getInstance().getConnection();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Customer c = new Customer();
                c.setCustomerId(rs.getInt("customer_id"));
                c.setFullName(rs.getString("full_name"));
                c.setEmail(rs.getString("email"));
                c.setPhone(rs.getString("phone"));
                c.setCompanyName(rs.getString("company_name"));
                list.add(c);
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error loading customers: " + e.getMessage());
        }
        return list;
    }

    @Override
    public int getTotalInquiriesCount() {
        String sql = "SELECT COUNT(*) FROM inquiries";
        Connection conn = DBConnection.getInstance().getConnection();
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error count total: " + e.getMessage());
        }
        return 0;
    }

    @Override
    public int getInquiriesCountByStatus(InquiryStatus status) {
        String sql = "SELECT COUNT(*) FROM inquiries WHERE status = ?";
        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            System.err.println("[InquiryDAO] Error count status: " + e.getMessage());
        }
        return 0;
    }

    private Inquiry mapRowToInquiry(ResultSet rs) throws SQLException {
        Inquiry inq = new Inquiry();
        inq.setInquiryId(rs.getInt("inquiry_id"));
        inq.setCustomerId(rs.getInt("customer_id"));
        inq.setEventType(rs.getString("event_type"));
        inq.setGuestCount(rs.getInt("guest_count"));
        try {
            String dateStr = rs.getString("event_date");
            if (dateStr != null && !dateStr.trim().isEmpty()) {
                if (dateStr.length() > 10) dateStr = dateStr.substring(0, 10);
                inq.setEventDate(Date.valueOf(dateStr.trim()));
            }
        } catch (Exception e) {
            inq.setEventDate(new Date(System.currentTimeMillis()));
        }
        inq.setVenueLocation(rs.getString("venue_location"));
        inq.setCateringStyle(rs.getString("catering_style"));
        inq.setBudgetEstimate(rs.getDouble("budget_estimate"));
        inq.setCommunicationChannel(rs.getString("communication_channel"));
        inq.setStatus(InquiryStatus.fromString(rs.getString("status")));
        inq.setDietaryNotes(rs.getString("dietary_notes"));
        inq.setFollowUpNotes(rs.getString("follow_up_notes"));

        Customer c = new Customer();
        c.setCustomerId(rs.getInt("customer_id"));
        c.setFullName(rs.getString("full_name"));
        c.setEmail(rs.getString("email"));
        c.setPhone(rs.getString("phone"));
        c.setCompanyName(rs.getString("company_name"));
        inq.setCustomer(c);

        return inq;
    }
}
