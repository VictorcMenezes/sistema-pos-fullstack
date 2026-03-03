package com.seuusuario.pos.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.seuusuario.pos.dto.CriarVendaRequest;
import com.seuusuario.pos.dto.ItemVendaDTO;
import com.seuusuario.pos.dto.ItemVendaRequest;
import com.seuusuario.pos.dto.MovimentacaoEstoqueRequest;
import com.seuusuario.pos.dto.VendaResponse;
import com.seuusuario.pos.entity.Caixa;
import com.seuusuario.pos.entity.ItemVenda;
import com.seuusuario.pos.entity.Produto;
import com.seuusuario.pos.entity.Usuario;
import com.seuusuario.pos.entity.Venda;
import com.seuusuario.pos.entity.enums.TipoMovimentacao;
import com.seuusuario.pos.repository.CaixaRepository;
import com.seuusuario.pos.repository.ProdutoRepository;
import com.seuusuario.pos.repository.UsuarioRepository;
import com.seuusuario.pos.repository.VendaRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VendaService {

    private final CaixaRepository caixaRepo;
    private final UsuarioRepository usuarioRepo;
    private final ProdutoRepository produtoRepo;
    private final VendaRepository vendaRepo;
    private final EstoqueService estoqueService;

    @Transactional
    public VendaResponse criarVenda(CriarVendaRequest req) {
        Caixa caixa = caixaRepo.findById(req.caixaId())
                .orElseThrow(() -> new EntityNotFoundException("Caixa não encontrado"));
        
        if (!"ABERTO".equalsIgnoreCase(caixa.getStatus())) {
            throw new IllegalStateException("Caixa não está aberto");
        }

        Usuario usuario = usuarioRepo.findById(req.usuarioId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        Venda venda = new Venda();
        venda.setCaixa(caixa);
        venda.setUsuario(usuario);
        venda.setNumeroVenda(UUID.randomUUID().toString());
        venda.setFormaPagamento(req.formaPagamento());
        venda.setDataVenda(Instant.now());

        BigDecimal totalBruto = BigDecimal.ZERO;
        List<ItemVenda> itens = new ArrayList<>();

        for (ItemVendaRequest itemReq : req.itens()) {
            Produto produto = produtoRepo.findById(itemReq.produtoId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));

            BigDecimal preco = produto.getPrecoVenda();
            BigDecimal subtotal = preco.multiply(BigDecimal.valueOf(itemReq.quantidade()));

            ItemVenda item = ItemVenda.builder()
                    .venda(venda)
                    .produto(produto)
                    .quantidade(itemReq.quantidade())
                    .precoUnitario(preco)
                    .subtotal(subtotal)
                    .build();

            itens.add(item);
            totalBruto = totalBruto.add(subtotal);

            estoqueService.movimentar(new MovimentacaoEstoqueRequest(
                    produto.getId(),
                    TipoMovimentacao.SAIDA,
                    itemReq.quantidade(),
                    "Venda " + venda.getNumeroVenda()));
        }

        venda.setValorTotal(totalBruto);
        
 
        BigDecimal valorDesconto = (req.desconto() != null) ? req.desconto() : BigDecimal.ZERO;
        
        venda.setValorFinal(totalBruto.subtract(valorDesconto));
        
        venda.setItens(itens);
        Venda salva = vendaRepo.save(venda);

       
        caixa.setSaldoAtual(caixa.getSaldoAtual().add(salva.getValorFinal()));
        caixaRepo.save(caixa);

        
        return new VendaResponse(
            salva.getId(),
            salva.getNumeroVenda(),
            salva.getValorTotal(),
            salva.getValorFinal(),
            salva.getFormaPagamento(),
            salva.getDataVenda(),
            salva.getItens().stream() 
                .map(i -> new ItemVendaDTO(
                    i.getProduto().getNome(), 
                    i.getQuantidade(), 
                    i.getPrecoUnitario()))
                .collect(Collectors.toList())
        );
    }

    public List<VendaResponse> buscarComFiltros(String dataInicio, String dataFim, String formaPagamento) {
        return vendaRepo.findAll().stream()
                .filter(venda -> {
                    boolean match = true;
                    if (formaPagamento != null && !formaPagamento.isEmpty() && !formaPagamento.equalsIgnoreCase("Todas")) {
                        match = match && venda.getFormaPagamento().equalsIgnoreCase(formaPagamento);
                    }
                    try {
                        if (dataInicio != null && !dataInicio.isEmpty()) {
                            Instant inicio = LocalDate.parse(dataInicio).atStartOfDay(ZoneId.systemDefault()).toInstant();
                            match = match && !venda.getDataVenda().isBefore(inicio);
                        }
                        if (dataFim != null && !dataFim.isEmpty()) {
                            Instant fim = LocalDate.parse(dataFim).atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
                            match = match && !venda.getDataVenda().isAfter(fim);
                        }
                    } catch (Exception e) {  }
                    return match;
                })
                .map(v -> new VendaResponse(
                        v.getId(),
                        v.getNumeroVenda(),
                        v.getValorTotal(),
                        v.getValorFinal(),
                        v.getFormaPagamento(),
                        v.getDataVenda(),
                        v.getItens().stream() 
                            .map(i -> new ItemVendaDTO(
                                i.getProduto().getNome(), 
                                i.getQuantidade(), 
                                i.getPrecoUnitario()))
                            .collect(Collectors.toList())
                )) 
                .collect(Collectors.toList());
    }
}