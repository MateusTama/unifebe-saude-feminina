CREATE TYPE enum_ciclomenstrual_intensidade AS ENUM ('1-Leve', '2-Moderado', '3-Intenso');
CREATE TYPE enum_usuario_perfil AS ENUM ('Administrador', 'Usuario');

CREATE TABLE Usuario (
    id SERIAL CONSTRAINT PK_Usuario_id PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    situacao BOOLEAN DEFAULT TRUE NOT NULL,
    data_nascimento DATE,
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_alteracao TIMESTAMPTZ,
    perfil enum_usuario_perfil DEFAULT 'Usuario',
    permite_notificacao BOOLEAN DEFAULT TRUE,
    permite_compartilhar_dados BOOLEAN DEFAULT FALSE,
    sexo CHAR(1) DEFAULT 'F'
);

CREATE TABLE Tema (
    id SERIAL CONSTRAINT PK_Tema_id PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao VARCHAR(3000),
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cadastro INT CONSTRAINT FK_Tema_usuario_cadastro_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL,
    situacao BOOLEAN DEFAULT TRUE NOT NULL,
    data_alteracao TIMESTAMPTZ,
    usuario_alteracao INT CONSTRAINT FK_Tema_usuario_alteracao_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL,
    tema_destaque BOOLEAN DEFAULT FALSE
);

CREATE TABLE FaseVida (
    id SERIAL CONSTRAINT PK_FaseVida_id PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao VARCHAR(3000),
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cadastro INT CONSTRAINT FK_FaseVida_usuario_cadastro_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL,
    situacao BOOLEAN DEFAULT TRUE NOT NULL,
    data_alteracao TIMESTAMPTZ,
    usuario_alteracao INT CONSTRAINT FK_FaseVida_usuario_alteracao_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL
);

CREATE TABLE Artigo (
    id SERIAL CONSTRAINT PK_Artigo_id PRIMARY KEY,
    tema_id INT CONSTRAINT FK_Artigo_tema_id_Tema_id REFERENCES Tema(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT,
    data_publicacao TIMESTAMPTZ,
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cadastro INT CONSTRAINT FK_Artigo_usuario_cadastro_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL,
    data_alteracao TIMESTAMPTZ,
    usuario_alteracao INT CONSTRAINT FK_Artigo_usuario_alteracao_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL,
    situacao BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE PalavraChave (
    id SERIAL CONSTRAINT PK_PalavraChave_id PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cadastro INT CONSTRAINT FK_PalavraChave_usuario_cadastro_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL,
    situacao BOOLEAN DEFAULT TRUE NOT NULL,
    data_alteracao TIMESTAMPTZ,
    usuario_alteracao INT CONSTRAINT FK_PalavraChave_usuario_alteracao_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL
);

CREATE TABLE Sintoma (
    id SERIAL CONSTRAINT PK_Sintoma_id PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_cadastro INT CONSTRAINT FK_Sintoma_usuario_cadastro_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL,
    situacao BOOLEAN DEFAULT TRUE NOT NULL,
    data_alteracao TIMESTAMPTZ,
    usuario_alteracao INT CONSTRAINT FK_Sintoma_usuario_alteracao_Usuario_id REFERENCES Usuario(id) ON DELETE SET NULL
);

CREATE TABLE Lembrete (
    id SERIAL CONSTRAINT PK_Lembrete_id PRIMARY KEY,
    usuario_id INT CONSTRAINT FK_Lembrete_usuario_id_Usuario_id REFERENCES Usuario(id) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descricao VARCHAR(10000),
    data_hora TIMESTAMPTZ,
    situacao BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE RegistroDiario (
    id SERIAL CONSTRAINT PK_RegistroDiario_id PRIMARY KEY,
    usuario_id INT CONSTRAINT FK_RegistroDiario_usuario_id_Usuario_id REFERENCES Usuario(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    observacoes VARCHAR(10000),
    UNIQUE (usuario_id, data)
);

CREATE TABLE RegistroSintoma (
    id SERIAL CONSTRAINT PK_RegistroSintoma_id PRIMARY KEY,
    registro_diario_id INT CONSTRAINT FK_RegistroSintoma_registro_diario_id_RegistroDiario_id REFERENCES RegistroDiario(id) ON DELETE CASCADE,
    sintoma_id INT CONSTRAINT FK_RegistroSintoma_sintoma_id_Sintoma_id REFERENCES Sintoma(id) ON DELETE CASCADE,
    situacao BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE CicloMenstrual (
    id SERIAL CONSTRAINT PK_CicloMenstrual_id PRIMARY KEY,
    usuario_id INT CONSTRAINT FK_CicloMenstrual_usuario_id_Usuario_id REFERENCES Usuario(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    intensidade enum_ciclomenstrual_intensidade,
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    situacao BOOLEAN DEFAULT TRUE NOT NULL,
    data_alteracao TIMESTAMPTZ
);

CREATE TABLE ArtigoPalavraChave (
    id SERIAL CONSTRAINT PK_ArtigoPalavraChave_id PRIMARY KEY,
    artigo_id INT CONSTRAINT FK_ArtigoPalavraChave_artigo_id_Artigo_id REFERENCES Artigo(id) ON DELETE CASCADE,
    palavra_chave_id INT CONSTRAINT FK_ArtigoPalavraChave_palavra_chave_id_PalavraChave_id REFERENCES PalavraChave(id) ON DELETE CASCADE
);

CREATE TABLE UsuarioFaseVida (
    id SERIAL CONSTRAINT PK_UsuarioFaseVida_id PRIMARY KEY,
    usuario_id INT CONSTRAINT FK_UsuarioFaseVida_usuario_id_Usuario_id REFERENCES Usuario(id) ON DELETE CASCADE,
    fase_vida_id INT CONSTRAINT FK_UsuarioFaseVida_fase_vida_id_FaseVida_id REFERENCES FaseVida(id) ON DELETE CASCADE,
    data_cadastro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    situacao BOOLEAN DEFAULT TRUE NOT NULL,
    data_alteracao TIMESTAMPTZ
);

CREATE TABLE ArtigoFaseVida (
    id SERIAL CONSTRAINT PK_ArtigoFaseVida_id PRIMARY KEY,
    fase_vida_id INT CONSTRAINT FK_ArtigoFaseVida_fase_vida_id_FaseVida_id REFERENCES FaseVida(id) ON DELETE CASCADE,
    artigo_id INT CONSTRAINT FK_ArtigoFaseVida_artigo_id_Artigo_id REFERENCES Artigo(id) ON DELETE CASCADE,
    situacao BOOLEAN DEFAULT TRUE NOT NULL
);