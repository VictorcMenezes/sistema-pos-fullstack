package com.seuusuario.pos.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.seuusuario.pos.dto.CriarVendaRequest;
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
    private final EstoqueService estoqueService; // já criado antes

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

        BigDecimal total = BigDecimal.ZERO;
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
            total = total.add(subtotal);

            estoqueService.movimentar(
                new MovimentacaoEstoqueRequest(
                    produto.getId(),
                    TipoMovimentacao.SAIDA,
                    itemReq.quantidade(),
                    "Venda " + venda.getNumeroVenda()
                )
            );
        }

        venda.setValorTotal(total);
        venda.setValorFinal(total);
        venda.setItens(itens);

        Venda salva = vendaRepo.save(venda);

        BigDecimal novoSaldo = caixa.getSaldoAtual().add(salva.getValorFinal());
        caixa.setSaldoAtual(novoSaldo);
        caixaRepo.save(caixa); // Atualiza o saldo na tabela CAIXAS

        return new VendaResponse(
            salva.getId(),
            salva.getNumeroVenda(),
            salva.getValorTotal(),
            salva.getValorFinal(),
            salva.getFormaPagamento(),
            salva.getDataVenda()
        );
    }
}
