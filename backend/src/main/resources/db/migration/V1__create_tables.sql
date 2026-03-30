-- Criação das tabelas do DevOps Task Manager

CREATE TABLE categoria (
                           id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tarefa (
                        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        titulo VARCHAR(100) NOT NULL,
                        descricao TEXT,
                        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        data_prevista_conclusao TIMESTAMP,
                        data_conclusao TIMESTAMP,
                        status VARCHAR(20) NOT NULL
                            CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CANCELADA', 'CONCLUIDA')),
                        categoria_id INTEGER NOT NULL,
                        CONSTRAINT fk_tarefa_categoria
                            FOREIGN KEY (categoria_id) REFERENCES categoria(id),
                        CONSTRAINT chk_data_prevista
                            CHECK (
                                data_prevista_conclusao IS NULL
                                    OR data_prevista_conclusao >= data_criacao
                                ),
                        CONSTRAINT chk_data_conclusao
                            CHECK (
                                data_conclusao IS NULL
                                    OR data_conclusao >= data_criacao
                                )
);

CREATE INDEX idx_tarefa_categoria_id ON tarefa(categoria_id);