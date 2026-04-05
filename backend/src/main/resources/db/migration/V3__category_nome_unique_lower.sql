CREATE UNIQUE INDEX IF NOT EXISTS uk_categoria_nome_lower
    ON categoria (LOWER(nome));