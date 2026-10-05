package com.joy.catering.controller;

import com.joy.catering.service.BillingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BillingControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BillingService billingService;

    @Test
    @WithMockUser(roles = "GENERAL_MANAGER")
    void testMetrics_GM_Allowed() throws Exception {
        mockMvc.perform(get("/api/billing/metrics"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "FINANCE_OFFICER")
    void testMetrics_Finance_Allowed() throws Exception {
        mockMvc.perform(get("/api/billing/metrics"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void testMetrics_Customer_Denied() throws Exception {
        mockMvc.perform(get("/api/billing/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "HEAD_CHEF")
    void testMetrics_Chef_Denied() throws Exception {
        mockMvc.perform(get("/api/billing/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "EVENT_COORDINATION_OFFICER")
    void testMetrics_Coordinator_Denied() throws Exception {
        mockMvc.perform(get("/api/billing/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER_SERVICE_SUPERVISOR")
    void testMetrics_Supervisor_Denied() throws Exception {
        mockMvc.perform(get("/api/billing/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testMetrics_Anonymous_Denied() throws Exception {
        mockMvc.perform(get("/api/billing/metrics"))
                .andExpect(status().isUnauthorized());
    }
}