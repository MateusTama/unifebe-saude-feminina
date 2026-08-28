from flask import jsonify
from app.models.palavra_chave import PalavraChave


def listar_palavras_chave():
    palavras = (
        PalavraChave.query
        .filter(PalavraChave.situacao.is_(True))
        .order_by(PalavraChave.nome.asc())
        .all()
    )

    return jsonify({
        "palavras_chave": [
            {
                "id": p.id,
                "nome": p.nome
            }
            for p in palavras
        ]
    }), 200

