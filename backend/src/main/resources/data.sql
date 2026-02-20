-- Criar usuário ADMIN (Senha é '123' criptografada em BCrypt)
INSERT INTO usuarios (ativo, criando_em, email, nome, role, senha, telefone) 
VALUES (true, CURRENT_TIMESTAMP, 'admin@teste.com', 'Admin Victor', 'ROLE_ADMIN', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', '11999999999');
-- Criar Produtos
INSERT INTO produtos (ativo, codigo_barras, nome, preco_compra, preco_venda)
VALUES (true, '123', 'Notebook Gamer', 3000.00, 5000.00);

INSERT INTO produtos (ativo, codigo_barras, nome, preco_compra, preco_venda)
VALUES (true, '456', 'Detergente', 1.50, 3.00);

-- Inicializar Estoque (Importante para evitar Erro 500 na venda)
INSERT INTO estoques (estoque_minimo, quantidade, produto_id) VALUES (5, 10, 1);
INSERT INTO estoques (estoque_minimo, quantidade, produto_id) VALUES (10, 50, 2);