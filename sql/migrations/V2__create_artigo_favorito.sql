CREATE TABLE ArtigoFavorito (
    id SERIAL CONSTRAINT PK_ArtigoFavorito_id PRIMARY KEY,
    usuario_id INT NOT NULL CONSTRAINT FK_ArtigoFavorito_usuario_id_Usuario_id REFERENCES Usuario(id) ON DELETE CASCADE,
    artigo_id INT NOT NULL CONSTRAINT FK_ArtigoFavorito_artigo_id_Artigo_id REFERENCES Artigo(id) ON DELETE CASCADE,
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT UQ_ArtigoFavorito_usuario_artigo UNIQUE (usuario_id, artigo_id)
);

