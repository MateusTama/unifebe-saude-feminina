from flask import request, jsonify
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity
from app.models import db
from app.models.usuario import Usuario
from app.models.fase_vida import FaseVida
from app.models.usuario_fase_vida import UsuarioFaseVida

def cadastrar_usuario():
    dados = request.get_json()
    
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    try:
        novo_usuario = Usuario(
            nome=dados.get('nome'),
            email=dados.get('email'),
            senha=dados.get('senha'),
            telefone=dados.get('telefone'),
            situacao=dados.get('situacao', True),
            data_nascimento=dados.get('data_nascimento'),
            perfil=dados.get('perfil', 'Usuario'),
            permite_notificacao=dados.get('permite_notificacao', True),
            permite_compartilhar_dados=dados.get('permite_compartilhar_dados', False),
            sexo=dados.get('sexo', 'F')
        )
        
        db.session.add(novo_usuario)
        db.session.commit()
        
    except ValueError as e:
        return jsonify({"mensagem": str(e)}), 400
        
    return jsonify({"mensagem": "Usuario cadastrado com sucesso"}), 201

def login_usuario():
    dados = request.get_json()
    
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    email = dados.get('email')
    senha = dados.get('senha')
    
    if not email or not senha:
        return jsonify({"mensagem": "Email e senha sao obrigatorios"}), 400
        
    usuario = Usuario.query.filter_by(email=email.strip().lower()).first()
    
    if not usuario or not check_password_hash(usuario.senha, senha):
        return jsonify({"mensagem": "Credenciais invalidas"}), 401
        
    if not usuario.situacao:
        return jsonify({"mensagem": "Usuario inativo"}), 403
        
    access_token = create_access_token(identity=str(usuario.id))
    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "token": access_token,
        "usuario": {
            "id": usuario.id,       
            "nome": usuario.nome,
            "perfil": usuario.perfil
        }
    }), 200

def editar_usuario():
    usuario_id = get_jwt_identity()
    usuario = db.session.get(Usuario, usuario_id)
    
    if not usuario:
        return jsonify({"mensagem": "Usuario nao encontrado"}), 404
        
    dados = request.get_json()
    if not dados:
        return jsonify({"mensagem": "Corpo da requisicao vazio"}), 400
        
    try:
        if 'nome' in dados:
            usuario.nome = dados['nome']
        if 'telefone' in dados:
            usuario.telefone = dados['telefone']
        if 'sexo' in dados:
            usuario.sexo = dados['sexo']
        if 'data_nascimento' in dados:
            usuario.data_nascimento = dados['data_nascimento']
        if 'permite_notificacao' in dados:
            usuario.permite_notificacao = dados['permite_notificacao']
        if 'permite_compartilhar_dados' in dados:
            usuario.permite_compartilhar_dados = dados['permite_compartilhar_dados']
            
        # Atualização das Fases da Vida (se informadas)
        fases_ids = dados.get('fases_vida_ids')
        if fases_ids is None and 'fase_vida_id' in dados:
            fases_ids = [dados['fase_vida_id']] if dados['fase_vida_id'] else []
            
        if fases_ids is not None:
            novos_ids = set(f for f in fases_ids if f is not None)
            vinculos_existentes = UsuarioFaseVida.query.filter_by(usuario_id=usuario.id).all()
            ids_ja_registrados = set()
            
            for vinculo in vinculos_existentes:
                ids_ja_registrados.add(vinculo.fase_vida_id)
                if vinculo.fase_vida_id in novos_ids:
                    if not vinculo.situacao:
                        vinculo.situacao = True
                        vinculo.data_alteracao = db.func.current_timestamp()
                else:
                    if vinculo.situacao:
                        vinculo.situacao = False
                        vinculo.data_alteracao = db.func.current_timestamp()
                        
            for fid in novos_ids - ids_ja_registrados:
                db.session.add(UsuarioFaseVida(
                    usuario_id=usuario.id,
                    fase_vida_id=fid,
                    situacao=True
                ))
            
        usuario.data_alteracao = db.func.current_timestamp()
        db.session.commit()
    except ValueError as e:
        return jsonify({"mensagem": str(e)}), 400
        
    return jsonify({"mensagem": "Usuario atualizado com sucesso"}), 200

def obter_perfil_usuario():
    usuario_id = get_jwt_identity()
    usuario = db.session.get(Usuario, usuario_id)
    
    if not usuario:
        return jsonify({"mensagem": "Usuario nao encontrado"}), 404
        
    # Busca as fases da vida associadas ao usuário
    fases_vida = (
        db.session.query(FaseVida)
        .join(UsuarioFaseVida, FaseVida.id == UsuarioFaseVida.fase_vida_id)
        .filter(UsuarioFaseVida.usuario_id == usuario.id, UsuarioFaseVida.situacao == True)
        .all()
    )
    
    return jsonify({
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "telefone": usuario.telefone,
        "sexo": usuario.sexo,
        "data_nascimento": usuario.data_nascimento.isoformat() if usuario.data_nascimento else None,
        "perfil": usuario.perfil.value if hasattr(usuario.perfil, 'value') else usuario.perfil,
        "permite_notificacao": usuario.permite_notificacao,
        "permite_compartilhar_dados": usuario.permite_compartilhar_dados,
        "fases_vida": [
            {
                "id": f.id,
                "nome": f.nome,
                "descricao": f.descricao
            }
            for f in fases_vida
        ]
    }), 200

def listar_usuarios():
    usuario_id = get_jwt_identity()
    usuario_autenticado = db.session.get(Usuario, usuario_id)
    
    if not usuario_autenticado:
        return jsonify({"mensagem": "Usuario autenticado nao encontrado"}), 404
        
    perfil_valor = usuario_autenticado.perfil.value if hasattr(usuario_autenticado.perfil, 'value') else str(usuario_autenticado.perfil)
    if perfil_valor != "Administrador":
        return jsonify({"mensagem": "Acesso negado: apenas administradores podem listar usuarios"}), 403
        
    query = Usuario.query
    
    nome_filtro = request.args.get('nome')
    if nome_filtro:
        query = query.filter(Usuario.nome.ilike(f"%{nome_filtro.strip()}%"))
        
    situacao_filtro = request.args.get('situacao')
    if situacao_filtro is not None and situacao_filtro.strip() != "":
        if situacao_filtro.strip().lower() in ['true', '1']:
            query = query.filter(Usuario.situacao == True)
        elif situacao_filtro.strip().lower() in ['false', '0']:
            query = query.filter(Usuario.situacao == False)
            
    usuarios = query.order_by(Usuario.id).all()
    
    resultado = []
    for u in usuarios:
        fases = (
            db.session.query(FaseVida.nome)
            .join(UsuarioFaseVida, FaseVida.id == UsuarioFaseVida.fase_vida_id)
            .filter(UsuarioFaseVida.usuario_id == u.id, UsuarioFaseVida.situacao == True)
            .all()
        )
        nomes_fases = [f[0] for f in fases]
        
        resultado.append({
            "id": u.id,
            "nome": u.nome,
            "email": u.email,
            "fases_da_vida": nomes_fases,
            "data_cadastro": u.data_cadastro.isoformat() if u.data_cadastro else None,
            "situacao": u.situacao
        })
        
    return jsonify({"usuarios": resultado}), 200
