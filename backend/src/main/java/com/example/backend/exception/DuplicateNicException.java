package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateNicException extends RuntimeException {
    public DuplicateNicException(String nicNumber) {
        super("A customer with NIC number '" + nicNumber + "' already exists");
    }
}
