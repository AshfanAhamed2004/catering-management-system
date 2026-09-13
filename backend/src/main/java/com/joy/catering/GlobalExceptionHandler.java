package com.joy.catering;
import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestControllerAdvice public class GlobalExceptionHandler {
 @ExceptionHandler(ApiException.class) ResponseEntity<?> api(ApiException e){return ResponseEntity.status(e.status).body(Map.of("detail",e.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){
   var d=e.getBindingResult().getFieldErrors().stream().map(x->Map.of("loc",List.of("body",x.getField()),"msg",x.getDefaultMessage(),"type","value_error")).toList();
   return ResponseEntity.unprocessableEntity().body(Map.of("detail",d));
 }
 @ExceptionHandler(Exception.class) ResponseEntity<?> other(Exception e){e.printStackTrace();return ResponseEntity.status(503).body(Map.of("detail","Database temporarily unavailable"));}
}
