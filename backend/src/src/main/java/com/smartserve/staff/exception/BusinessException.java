package com.smartserve.staff.exception;
public class BusinessException extends RuntimeException {
    public final int status;
    public BusinessException(int status,String message){super(message);this.status=status;}
    public static BusinessException invalid(String message){return new BusinessException(400,message);}
    public static BusinessException conflict(String message){return new BusinessException(409,message);}
    public static BusinessException missing(){return new BusinessException(404,"Record not found or not available to your account.");}
}
