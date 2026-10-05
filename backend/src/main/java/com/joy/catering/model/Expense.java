package com.joy.catering.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Getter
@Setter
public class Expense extends BaseEntity {
    private String name;
    private String category;
    private BigDecimal amount;
    private LocalDate date;
}
