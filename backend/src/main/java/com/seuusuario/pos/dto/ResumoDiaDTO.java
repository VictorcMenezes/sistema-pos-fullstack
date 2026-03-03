package com.seuusuario.pos.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumoDiaDTO {
    private BigDecimal totalDia;
    private Long qtdDia;
    private Long totalItensHoje;
    private BigDecimal ticketMedio;
    
    
    private List<VendaResumoDTO> ultimasVendas;

    
}