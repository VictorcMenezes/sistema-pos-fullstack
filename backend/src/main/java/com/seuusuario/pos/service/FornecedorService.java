package com.seuusuario.pos.service;

import org.springframework.stereotype.Service;

import com.seuusuario.pos.dto.FornecedorDTO;
import com.seuusuario.pos.entity.Fornecedor;
import com.seuusuario.pos.repository.FornecedorRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;


@Service
@RequiredArgsConstructor
public class FornecedorService {
    private final FornecedorRepository fornecedorRepo;

    public FornecedorDTO salvar(@Valid FornecedorDTO dot) {
       
        //Verifica se já existe um fornecedor com o mesmo CNPJ
        if (fornecedorRepo.existsByCnpj(dot.cnpj())) {
            throw new IllegalArgumentException("O CNPJ fornecido já está cadastrado.");
        }
        //Mapeando DTO para entidade e salvando
        @lombok.NonNull
        Fornecedor f = Fornecedor.builder()
                .nome(dot.nome())
                .cnpj(dot.cnpj())
                .telefone(dot.telefone())
                .email(dot.email())
                .ativo(dot.ativo() != null ? dot.ativo() : true)
                .build();
        fornecedorRepo.save(f);
        return toDTO(f);
    }
    public FornecedorDTO toDTO(Fornecedor f){
        return new FornecedorDTO(
                f.getId(),
                f.getNome(),
                f.getCnpj(),
                f.getTelefone(),
                f.getEmail(),
                f.getAtivo()
        );
    }

    //buscar fornecedor por id
    public FornecedorDTO buscarPorId(Long id){
        Fornecedor fornecedor = fornecedorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado"));
            return toDTO(fornecedor);
    }
    //listar todos os fornecedores
    public List<FornecedorDTO> lista() {
    return fornecedorRepo.findAll()
            .stream()
            .map(this::toDTO)
            .toList(); 
}

    //atualizar fornecedor
    public FornecedorDTO atualizar(Long id, @Valid FornecedorDTO dto){
        //verifica se o fornecedor existe  
        Fornecedor fornecedor = fornecedorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado"));

        //VERIFICAÇÃO DE UNICIDADE DO CNPJ
        if (!fornecedor.getCnpj().equals(dto.cnpj())) { 
            if (fornecedorRepo.existsByCnpj(dto.cnpj())) {
                throw new IllegalArgumentException("O novo CNPJ já está cadastrado em outro fornecedor.");
            }
            fornecedor.setCnpj(dto.cnpj());
        }
        
        fornecedor.setNome(dto.nome());
        fornecedor.setTelefone(dto.telefone());
        fornecedor.setEmail(dto.email());
        if (dto.ativo() != null) {
            fornecedor.setAtivo(dto.ativo());
        }

        fornecedorRepo.save(fornecedor);
        return toDTO(fornecedor);
    }

    //deletar fornecedor
    public void deletar(Long id){
        //soft delete - desativar o fornecedor
        Fornecedor fornecedor = fornecedorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado com Id:"  + id));

        fornecedor.setAtivo(false);
        fornecedorRepo.save(fornecedor);
    }

}
