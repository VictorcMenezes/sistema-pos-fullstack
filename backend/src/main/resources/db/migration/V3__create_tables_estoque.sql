    CREATE TABLE estoques (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL UNIQUE,
    quantidade INTEGER NOT NULL,
    estoque_minimo INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

CREATE TABLE movimentacoes_estoque (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    quantidade INTEGER NOT NULL,
    motivo VARCHAR(255),
    data_movimentacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimentacao_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

--Garante que a tabela usurios exista antes ou que o Hibernate a crier
INSERT INTO usuarios (ativo, criando_em, email, nome, role, senha, telefone) 
VALUES (true, CURRENT_TIMESTAMP, 'admin@teste.com', 'Admin Victor', 'ROLE_ADMIN', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', '11999999999');
