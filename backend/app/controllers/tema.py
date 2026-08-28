from flask import jsonify
from app.models.tema import Tema


def listar_temas():
    temas = (
        Tema.query
        .filter(Tema.situacao.is_(True))
        .order_by(Tema.nome.asc())
        .all()
    )

    return jsonify({
        "temas": [
            {
                "id": t.id,
                "nome": t.nome,
                "descricao": t.descricao,
                "destaque": bool(t.tema_destaque)
            }
            for t in temas
        ]
    }), 200

