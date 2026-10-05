package com.joy.catering.service;

import com.joy.catering.ApiException;
import com.joy.catering.dto.Dtos.InquiryInput;
import com.joy.catering.dto.Dtos.InquiryReplyInput;
import com.joy.catering.model.Inquiry;
import com.joy.catering.model.InquiryStatus;
import com.joy.catering.model.User;
import com.joy.catering.repo.InquiryRepository;
import com.joy.catering.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class InquiryService {

    private final InquiryRepository inquiryRepo;
    private final UserRepository userRepo;

    public InquiryService(InquiryRepository inquiryRepo, UserRepository userRepo) {
        this.inquiryRepo = inquiryRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public Inquiry createInquiry(Long customerId, InquiryInput input) {
        User customer = userRepo.findById(customerId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        Inquiry inquiry = new Inquiry();
        inquiry.setCustomer(customer);
        inquiry.setSubject(input.subject().trim());
        inquiry.setMessage(input.message().trim());
        inquiry.setStatus(InquiryStatus.OPEN);
        return inquiryRepo.save(inquiry);
    }

    @Transactional
    public Inquiry updateInquiry(Long inquiryId, Long customerId, InquiryInput input) {
        Inquiry inquiry = inquiryRepo.findById(inquiryId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Inquiry not found"));
        if (!inquiry.getCustomer().getId().equals(customerId)) throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized");
        if (inquiry.getStatus() != InquiryStatus.OPEN) throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot update a replied or resolved inquiry");
        inquiry.setSubject(input.subject().trim());
        inquiry.setMessage(input.message().trim());
        return inquiryRepo.save(inquiry);
    }

    @Transactional
    public void deleteInquiry(Long inquiryId, Long customerId) {
        Inquiry inquiry = inquiryRepo.findById(inquiryId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Inquiry not found"));
        if (!inquiry.getCustomer().getId().equals(customerId)) throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized");
        inquiryRepo.delete(inquiry);
    }

    @Transactional
    public Inquiry replyInquiry(Long inquiryId, InquiryReplyInput input) {
        Inquiry inquiry = inquiryRepo.findById(inquiryId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Inquiry not found"));
        inquiry.setReply(input.reply().trim());
        inquiry.setStatus(InquiryStatus.REPLIED);
        inquiry.setRepliedAt(OffsetDateTime.now());
        return inquiryRepo.save(inquiry);
    }

    @Transactional
    public Inquiry resolveInquiry(Long inquiryId) {
        Inquiry inquiry = inquiryRepo.findById(inquiryId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Inquiry not found"));
        inquiry.setStatus(InquiryStatus.RESOLVED);
        return inquiryRepo.save(inquiry);
    }
}
