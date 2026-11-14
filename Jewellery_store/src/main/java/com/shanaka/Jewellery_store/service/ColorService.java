package com.shanaka.Jewellery_store.service;

import com.shanaka.Jewellery_store.model.ProductColor;
import com.shanaka.Jewellery_store.repo.ColorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ColorService {

    @Autowired
    private ColorRepo colorRepo;

    @Transactional(readOnly = true)
    public List<ProductColor> getColors(){
        return colorRepo.findAll();
    }

    @Transactional
    public ProductColor addColor(ProductColor productColor){
        System.out.println(productColor);
        return (ProductColor) colorRepo.save(productColor);
    }

}
