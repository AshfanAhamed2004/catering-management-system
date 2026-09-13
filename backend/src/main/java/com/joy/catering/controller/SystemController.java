package com.joy.catering.controller;
import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController public class SystemController {final JdbcTemplate db;public SystemController(JdbcTemplate d){db=d;}@GetMapping("/health") Object health(){db.queryForObject("SELECT 1",Integer.class);return Map.of("status","ok");}}
