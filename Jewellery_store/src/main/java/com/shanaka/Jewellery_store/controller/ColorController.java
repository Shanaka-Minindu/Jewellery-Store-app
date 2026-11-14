package com.shanaka.Jewellery_store.controller;

import com.shanaka.Jewellery_store.model.ProductColor;
import com.shanaka.Jewellery_store.service.ColorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ColorController {
    @Autowired
    private ColorService colorService;

    @GetMapping("/getColors")
    public ResponseEntity<List<ProductColor>> getColors(){
        return new ResponseEntity<>(colorService.getColors(), HttpStatus.OK);
    }

    @PostMapping("/addColor")
    public ResponseEntity<ProductColor> addColor(@Valid @RequestBody ProductColor productColor){
        System.out.println(productColor);
        return new ResponseEntity<>( colorService.addColor(productColor),HttpStatus.OK);
    }

}
