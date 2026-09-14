package com.catering.crm;

import com.catering.crm.controller.InquiryHttpHandler;
import com.catering.crm.dao.DBConnection;
import com.catering.crm.service.InquiryService;
import com.sun.net.httpserver.HttpServer;

import java.net.InetSocketAddress;

/**
 * Main Application Launcher for Culinary Connect - CRM System.
 * Module: Centralized CRM & Inquiry Consolidation System (SE2030 Group Project).
 */
public class Main {

    private static final int PORT = 8080;

    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println("   CULINARY CONNECT - CATERING MANAGEMENT SYSTEM");
        System.out.println("   Module: Centralized CRM & Inquiry Consolidation System");
        System.out.println("   SE2030: Software Engineering - Progress Evaluation Demo");
        System.out.println("===============================================================");

        // 1. Initialize Database Connection (Singleton Pattern)
        System.out.println("[Bootstrap] Initializing database manager...");
        String dbInfo = DBConnection.getInstance().getActiveDatabaseType();
        System.out.println("[Bootstrap] Database Connection Established: " + dbInfo);

        // 2. Initialize Service Layer
        InquiryService service = new InquiryService();

        // 3. Start Embedded Web Server
        int port = PORT;
        HttpServer server = null;
        try {
            server = HttpServer.create(new InetSocketAddress(port), 0);
        } catch (Exception e) {
            port = 8085; // Fallback port if 8080 is taken
            try {
                server = HttpServer.create(new InetSocketAddress(port), 0);
            } catch (Exception ex) {
                System.err.println("[Error] Unable to start server: " + ex.getMessage());
                return;
            }
        }

        InquiryHttpHandler handler = new InquiryHttpHandler(service);
        server.createContext("/", handler);
        server.setExecutor(java.util.concurrent.Executors.newCachedThreadPool());
        server.start();

        System.out.println("---------------------------------------------------------------");
        System.out.println(" >>> CRM WEB APPLICATION RUNNING SUCCESSFULLY! <<<");
        System.out.println(" Access the Dashboard at: http://localhost:" + port + "/");
        System.out.println(" REST API Base URL:       http://localhost:" + port + "/api/inquiries");
        System.out.println("---------------------------------------------------------------");
        System.out.println(" Press Ctrl + C to terminate the application.");
    }
}
