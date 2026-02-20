package com.seuusuario.pos.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.seuusuario.pos.dto.ProdutoDTO;
import com.seuusuario.pos.entity.Fornecedor;
import com.seuusuario.pos.entity.Produto;
import com.seuusuario.pos.repository.FornecedorRepository;
import com.seuusuario.pos.repository.ProdutoRepository;
import com.seuusuario.pos.entity.Estoque;
import com.seuusuario.pos.repository.EstoqueRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProdutoService {
    private final ProdutoRepository produtoRepo;
    private final FornecedorRepository fornecedorRepo;
    private final EstoqueRepository estoqueRepo;

    public ProdutoDTO salvar(@Valid ProdutoDTO dto) {
        if(produtoRepo.existsByCodigoBarras(dto.codigoBarras())){
            throw new IllegalArgumentException("O Código de Barras '" + dto.codigoBarras() + "' já está cadastrado.");
        }

        Fornecedor fornecedor = fornecedorRepo.findById(dto.fornecedorId())
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado"));

        Produto p = Produto.builder()
                .nome(dto.nome())
                .codigoBarras(dto.codigoBarras())
                .fornecedor(fornecedor)
                .precoCompra(dto.precoCompra())
                .precoVenda(dto.precoVenda())
                .ativo(dto.ativo() !=null ? dto.ativo() : true)
                .build();
        
        Produto produtoSalvo = produtoRepo.save(p);

        Estoque novoEstoque = Estoque.builder()
                .produto(produtoSalvo)
                .quantidade(dto.quantidadeInicial() != null ? dto.quantidadeInicial() : 0)
                .estoqueMinimo(5)
                .build();
        
        estoqueRepo.save(novoEstoque);

        return toDTO(produtoSalvo);
    }

    public ProdutoDTO toDTO(Produto p){

        Integer quantidade = 0;
        if (p.getId() != null) {
            quantidade = estoqueRepo.findByProdutoId(p.getId())
                .map(Estoque::getQuantidade)
                .orElse(0);
        }

        return new ProdutoDTO(
                p.getId(),
                p.getNome(),
                p.getCodigoBarras(),
                (p.getFornecedor() != null) ? p.getFornecedor().getId() : null,
                p.getPrecoCompra(),
                p.getPrecoVenda(),
                p.getAtivo(),
                quantidade
                
        );
    }
    
    public ProdutoDTO buscarPorId(Long id){
        Produto produto = produtoRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
            return toDTO(produto);
    }

    
    public ProdutoDTO atualizar(Long id, @Valid ProdutoDTO dto){
        
        Produto produtoExistente = produtoRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
       
        produtoExistente.setNome(dto.nome());
        produtoExistente.setPrecoVenda(dto.precoVenda());
        produtoExistente.setPrecoCompra(dto.precoCompra());
        produtoExistente.setAtivo(dto.ativo());

    
        if(dto.fornecedorId() != null){
            Fornecedor novoFornecedor = fornecedorRepo.findById(dto.fornecedorId())
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado"));

            produtoExistente.setFornecedor(novoFornecedor);
        }

        Produto produtoAtualizado = produtoRepo.save(produtoExistente);
        return toDTO(produtoAtualizado);
    }

    
    public void deletar(Long id){
        
        Produto produto= produtoRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado para exclusão com Id:" + id));

        produto.setAtivo(false);
        produtoRepo.save(produto);        
    }
    
 

    //Busca todos os produtos ativos e os mapeia para DTOs.     
    public List<ProdutoDTO> listarTodos() {
        List<Produto> produtos = produtoRepo.findAll();
        return produtos.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}

        