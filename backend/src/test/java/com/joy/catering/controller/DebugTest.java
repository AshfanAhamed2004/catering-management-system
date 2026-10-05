package com.joy.catering.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class DebugTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testOutput() throws Exception {
        MvcResult result = mockMvc.perform(get("/staff/customers")
                .with(user("supervisor@test.com").roles("CUSTOMER_SERVICE_SUPERVISOR")))
                .andReturn();
        System.out.println("JSON OUTPUT: " + result.getResponse().getContentAsString());
    }
}