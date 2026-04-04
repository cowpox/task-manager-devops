-- Inserindo categorias iniciais
INSERT INTO categoria (nome) VALUES
                                 ('Infraestrutura'),
                                 ('Desenvolvimento'),
                                 ('Segurança'),
                                 ('Documentação');

-- Inserindo tarefas de exemplo
INSERT INTO tarefa (titulo, descricao, status, categoria_id, data_prevista_conclusao)
VALUES
    ('Configurar servidor CI/CD',
     'Instalar e configurar o Jenkins para integração contínua.',
     'EM_ANDAMENTO',
     1,
     CURRENT_TIMESTAMP + INTERVAL '7 days'),

    ('Implementar autenticação JWT',
     'Adicionar autenticação baseada em tokens JWT no backend.',
     'PENDENTE',
     2,
     CURRENT_TIMESTAMP + INTERVAL '10 days'),

    ('Revisar políticas de firewall',
     'Analisar e atualizar regras de firewall para maior segurança.',
     'PENDENTE',
     3,
     CURRENT_TIMESTAMP + INTERVAL '5 days'),

    ('Criar guia de instalação',
     'Documentar o processo de instalação do sistema para novos desenvolvedores.',
     'PENDENTE',
     4,
     CURRENT_TIMESTAMP + INTERVAL '14 days');
