package com.seuusuario.pos.service;

import com.seuusuario.pos.dto.MovimentacaoEstoqueRequest;
import com.seuusuario.pos.entity.Estoque;
import com.seuusuario.pos.entity.MovimentacaoEstoque;
import com.seuusuario.pos.entity.Produto;
import com.seuusuario.pos.entity.enums.TipoMovimentacao;
import com.seuusuario.pos.repository.EstoqueRepository;
import com.seuusuario.pos.repository.MovimentacaoEstoqueRepository;
import com.seuusuario.pos.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EstoqueService {

    private final EstoqueRepository estoqueRepo;
    private final MovimentacaoEstoqueRepository movRepo;
    private final ProdutoRepository produtoRepo;

    @Transactional
public void movimentar(MovimentacaoEstoqueRequest req) {
    Produto produto = produtoRepo.findById(req.produtoId())
        .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));

    Estoque estoque = estoqueRepo.findByProdutoId(produto.getId())
        .orElseGet(() -> Estoque.builder()
                .produto(produto)
                .quantidade(0)
                .estoqueMinimo(0)
                .build()
        );

    int atual = estoque.getQuantidade();
    int novoSaldo = atual;

    // Use sempre o "req" que é o nome do parâmetro do método
    if (req.tipo() == TipoMovimentacao.ENTRADA) {
        novoSaldo = atual + req.quantidade();
    } else if (req.tipo() == TipoMovimentacao.SAIDA) {
        if (atual < req.quantidade()) {
            throw new IllegalArgumentException("Estoque insuficiente para o produto: " + produto.getNome());
        }
        novoSaldo = atual - req.quantidade();
    } else if (req.tipo() == TipoMovimentacao.AJUSTE) {
        novoSaldo = req.quantidade();
    }

    estoque.setQuantidade(novoSaldo);
    estoqueRepo.save(estoque);

    MovimentacaoEstoque mov = MovimentacaoEstoque.builder()
        .produto(produto)
        .tipo(req.tipo())
        .quantidade(req.quantidade())
        .motivo(req.motivo())
        .dataMovimentacao(Instant.now())
        .build();
                
    movRepo.save(mov);
}
    public List<MovimentacaoEstoque> historico(Long produtoId) {
        return movRepo.findByProdutoIdOrderByDataMovimentacaoDesc(produtoId);
    }
}