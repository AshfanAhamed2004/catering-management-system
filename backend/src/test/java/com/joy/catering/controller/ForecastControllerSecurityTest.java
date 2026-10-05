package com.joy.catering.controller;

import com.joy.catering.dto.Dtos.ForecastOut;
import com.joy.catering.security.JwtFilter;
import com.joy.catering.security.JwtService;
import com.joy.catering.security.SecurityConfig;
import com.joy.catering.repo.UserRepository;
import com.joy.catering.service.ForecastService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;

@WebMvcTest(ForecastController.class)
@Import(SecurityConfig.class)
public class ForecastControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ForecastService forecastService;

    // We must mock these because SecurityConfig and JwtFilter depend on them
    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    private void mockServiceToPass() {
        ForecastOut dummyOut = new ForecastOut(null, null, 1L, "Test", null, 100, Collections.emptyList());
        when(forecastService.getCustomForecast(anyLong(), anyInt())).thenReturn(dummyOut);
        when(forecastService.getBookingForecast(anyLong())).thenReturn(dummyOut);
    }

    @Test
    @WithMockUser(roles = "HEAD_CHEF")
    void testCustomForecast_HeadChef_Allowed() throws Exception {
        mockServiceToPass();
        mockMvc.perform(get("/staff/forecast/custom?packageId=1&guestCount=10"))
               .andExpect(status().isOk()); 
    }

    @Test
    @WithMockUser(roles = "GENERAL_MANAGER")
    void testCustomForecast_GeneralManager_Allowed() throws Exception {
        mockServiceToPass();
        mockMvc.perform(get("/staff/forecast/custom?packageId=1&guestCount=10"))
               .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "FINANCE_OFFICER")
    void testCustomForecast_FinanceOfficer_Denied() throws Exception {
        mockMvc.perform(get("/staff/forecast/custom?packageId=1&guestCount=10"))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER_SERVICE_SUPERVISOR")
    void testCustomForecast_Supervisor_Denied() throws Exception {
        mockMvc.perform(get("/staff/forecast/custom?packageId=1&guestCount=10"))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "EVENT_COORDINATION_OFFICER")
    void testCustomForecast_EventCoordinator_Denied() throws Exception {
        mockMvc.perform(get("/staff/forecast/custom?packageId=1&guestCount=10"))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void testCustomForecast_Customer_Denied() throws Exception {
        mockMvc.perform(get("/staff/forecast/custom?packageId=1&guestCount=10"))
               .andExpect(status().isForbidden());
    }

    @Test
    void testCustomForecast_Anonymous_Denied() throws Exception {
        mockMvc.perform(get("/staff/forecast/custom?packageId=1&guestCount=10"))
               .andExpect(status().isUnauthorized());
    }
    
    @Test
    @WithMockUser(roles = "HEAD_CHEF")
    void testBookingForecast_HeadChef_Allowed() throws Exception {
        mockServiceToPass();
        mockMvc.perform(get("/staff/forecast?bookingId=1"))
               .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void testBookingForecast_Customer_Denied() throws Exception {
        mockMvc.perform(get("/staff/forecast?bookingId=1"))
               .andExpect(status().isForbidden());
    }
}