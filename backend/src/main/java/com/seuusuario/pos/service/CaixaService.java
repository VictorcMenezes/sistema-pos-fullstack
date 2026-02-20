package com.seuusuario.pos.service;

import java.time.Instant;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.seuusuario.pos.dto.AbrirCaixaRequest;
import com.seuusuario.pos.dto.CaixaResponse;
import com.seuusuario.pos.dto.FecharCaixaRequest;
import com.seuusuario.pos.entity.Caixa;
import com.seuusuario.pos.repository.CaixaRepository;
import com.seuusuario.pos.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CaixaService {

    private final CaixaRepository caixaRepo;
    private final UsuarioRepository usuarioRepo;

   @Transactional
    public CaixaResponse abrirCaixa(AbrirCaixaRequest req) {
       

        Caixa caixa = Caixa.builder()
                .usuario(usuarioRepo.getReferenceById(req.usuarioId()))
                .valorAbertura(req.valorAbertura())
                .saldoAtual(req.valorAbertura()) // INICIALIZA O SALDO COM O VALOR DE ABERTURA
                .status("ABERTO")
                .dataAbertura(Instant.now())
                .build();

        Caixa salvo = caixaRepo.save(caixa);
        return toResponse(salvo);
    }

    @Transactional
    public CaixaResponse fecharCaixa(Long caixaId, FecharCaixaRequest req) {
        Caixa caixa = caixaRepo.findById(caixaId)
                .orElseThrow(() -> new EntityNotFoundException("Caixa não encontrado"));

        if (!"ABERTO".equalsIgnoreCase(caixa.getStatus())) {
            throw new IllegalStateException("Caixa já está fechado");
        }

        caixa.setValorFechamento(req.valorFechamento());
        caixa.setDataFechamento(Instant.now());
        caixa.setStatus("FECHADO");

        Caixa salvo = caixaRepo.save(caixa);
        return toResponse(salvo);
    }

    public Optional<CaixaResponse> buscarCaixaAbertoPorUsuario(Long usuarioId) {
        return caixaRepo.findFirstByUsuarioIdAndStatusOrderByDataAberturaDesc(usuarioId, "ABERTO")
                .map(this::toResponse);
    }

    private CaixaResponse toResponse(Caixa c) {
        return new CaixaResponse(
                c.getId(),
                c.getUsuario().getId(),
                c.getValorAbertura(),
                c.getSaldoAtual(), // <--- PASSE O SALDO DA ENTIDADE PARA O DTO
                c.getValorFechamento(),
                c.getStatus(),
                c.getDataAbertura(),
                c.getDataFechamento()
        );
    }
}
