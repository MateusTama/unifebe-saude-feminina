import unicodedata
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from sqlalchemy import func
from app.models import db, Artigo, Tema, PalavraChave, ArtigoPalavraChave, ArtigoFavorito


def remover_acentos(texto):
    if not texto:
        return ""
    nfkd = unicodedata.normalize('NFKD', str(texto))
    return "".join([c for c in nfkd if not unicodedata.combining(c)])


def serializar_artigo(artigo, curtido=None):
    palavras = (
        db.session.query(PalavraChave)
        .join(ArtigoPalavraChave, ArtigoPalavraChave.palavra_chave_id == PalavraChave.id)
        .filter(
            ArtigoPalavraChave.artigo_id == artigo.id,
            PalavraChave.situacao.is_(True)
        )
        .order_by(PalavraChave.nome.asc())
        .all()
    )

    data = {
        "id": artigo.id,
        "titulo": artigo.titulo,
        "conteudo": artigo.conteudo,
        "tema": {
            "id": artigo.tema.id,
            "nome": artigo.tema.nome
        } if artigo.tema else None,
        "palavras_chave": [
            {
                "id": pc.id,
                "nome": pc.nome
            }
            for pc in palavras
        ]
    }

    if curtido is not None:
        data["curtido"] = curtido

    return data


def listar_artigos():
    usuario_id = get_jwt_identity()

    query = Artigo.query.filter(Artigo.situacao.is_(True))

    # Filtro por título (accent e case insensitive)
    titulo = request.args.get('titulo')
    if titulo and titulo.strip():
        termo = f"%{titulo.strip()}%"
        try:
            query = query.filter(func.unaccent(Artigo.titulo).ilike(func.unaccent(termo)))
        except Exception:
            query = query.filter(Artigo.titulo.ilike(termo))

    # Filtro por tema_id
    tema_id = request.args.get('tema_id')
    if tema_id and str(tema_id).isdigit():
        query = query.filter(Artigo.tema_id == int(tema_id))

    # Filtro por destaque (temas em destaque)
    destaque = request.args.get('destaque')
    if destaque is not None and destaque != '':
        if str(destaque).lower() in ['true', '1', 't']:
            query = query.filter(
                Artigo.tema_id.in_(
                    db.session.query(Tema.id).filter(
                        Tema.tema_destaque.is_(True),
                        Tema.situacao.is_(True)
                    )
                )
            )

    # Filtro por palavras_chave_ids (ex: "1,2,3")
    palavras_chave_ids = request.args.get('palavras_chave_ids')
    if palavras_chave_ids and palavras_chave_ids.strip():
        ids = [int(i.strip()) for i in palavras_chave_ids.split(',') if i.strip().isdigit()]
        if ids:
            query = query.filter(
                Artigo.id.in_(
                    db.session.query(ArtigoPalavraChave.artigo_id).filter(
                        ArtigoPalavraChave.palavra_chave_id.in_(ids)
                    )
                )
            )

    try:
        artigos = query.order_by(Artigo.data_cadastro.desc(), Artigo.id.desc()).all()
    except Exception:
        db.session.rollback()
        # Fallback caso unaccent não esteja habilitado no banco
        query_fallback = Artigo.query.filter(Artigo.situacao.is_(True))

        if tema_id and str(tema_id).isdigit():
            query_fallback = query_fallback.filter(Artigo.tema_id == int(tema_id))

        if destaque is not None and destaque != '':
            if str(destaque).lower() in ['true', '1', 't']:
                query_fallback = query_fallback.filter(
                    Artigo.tema_id.in_(
                        db.session.query(Tema.id).filter(
                            Tema.tema_destaque.is_(True),
                            Tema.situacao.is_(True)
                        )
                    )
                )

        if palavras_chave_ids and palavras_chave_ids.strip():
            ids = [int(i.strip()) for i in palavras_chave_ids.split(',') if i.strip().isdigit()]
            if ids:
                query_fallback = query_fallback.filter(
                    Artigo.id.in_(
                        db.session.query(ArtigoPalavraChave.artigo_id).filter(
                            ArtigoPalavraChave.palavra_chave_id.in_(ids)
                        )
                    )
                )

        todos_artigos = query_fallback.order_by(Artigo.data_cadastro.desc(), Artigo.id.desc()).all()
        if titulo and titulo.strip():
            termo_norm = remover_acentos(titulo.strip()).lower()
            artigos = [a for a in todos_artigos if termo_norm in remover_acentos(a.titulo or '').lower()]
        else:
            artigos = todos_artigos

    # Identificar artigos favoritados pelo usuário autenticado
    artigos_favoritos_ids = set(
        r[0] for r in db.session.query(ArtigoFavorito.artigo_id)
        .filter_by(usuario_id=usuario_id)
        .all()
    )

    resultado = [
        serializar_artigo(artigo, curtido=(artigo.id in artigos_favoritos_ids))
        for artigo in artigos
    ]

    return jsonify({"artigos": resultado}), 200


def listar_artigos_favoritos():
    usuario_id = get_jwt_identity()

    artigos = (
        Artigo.query
        .join(ArtigoFavorito, Artigo.id == ArtigoFavorito.artigo_id)
        .filter(
            ArtigoFavorito.usuario_id == usuario_id,
            Artigo.situacao.is_(True)
        )
        .order_by(ArtigoFavorito.data_cadastro.desc(), Artigo.id.desc())
        .all()
    )

    resultado = [
        serializar_artigo(artigo, curtido=None)
        for artigo in artigos
    ]

    return jsonify({"artigos": resultado}), 200


def obter_artigo(id):
    usuario_id = get_jwt_identity()

    artigo = Artigo.query.filter_by(id=id, situacao=True).first()
    if not artigo:
        return jsonify({"mensagem": "Artigo não encontrado"}), 404

    curtido = False
    if usuario_id:
        favorito = ArtigoFavorito.query.filter_by(
            usuario_id=usuario_id,
            artigo_id=id
        ).first()
        curtido = bool(favorito)

    return jsonify({"artigo": serializar_artigo(artigo, curtido=curtido)}), 200


def alternar_favorito_artigo(id):
    usuario_id = get_jwt_identity()

    artigo = Artigo.query.filter_by(id=id, situacao=True).first()
    if not artigo:
        return jsonify({"mensagem": "Artigo não encontrado"}), 404

    favorito = ArtigoFavorito.query.filter_by(usuario_id=usuario_id, artigo_id=id).first()

    if favorito:
        db.session.delete(favorito)
        db.session.commit()
        return jsonify({
            "mensagem": "Artigo removido dos favoritos",
            "curtido": False
        }), 200
    else:
        novo_favorito = ArtigoFavorito(usuario_id=usuario_id, artigo_id=id)
        db.session.add(novo_favorito)
        db.session.commit()
        return jsonify({
            "mensagem": "Artigo adicionado aos favoritos",
            "curtido": True
        }), 200

