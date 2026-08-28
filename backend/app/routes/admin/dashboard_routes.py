from flask import Blueprint, render_template
from app.models import Artigo, Tema, Sintoma, FaseVida, Usuario, PalavraChave
from app.models.enums import PerfilUsuarioEnum

dashboard_bp = Blueprint('admin_dashboard', __name__, url_prefix='/admin')


@dashboard_bp.route('', methods=['GET'])
@dashboard_bp.route('/dashboard', methods=['GET'])
def index():
    total_artigos = Artigo.query.count()
    total_temas = Tema.query.count()
    total_sintomas = Sintoma.query.count()
    total_fases = FaseVida.query.count()
    total_palavras = PalavraChave.query.count()
    total_usuarias = Usuario.query.filter(Usuario.perfil == PerfilUsuarioEnum.USUARIO).count()
    total_admins = Usuario.query.filter(Usuario.perfil == PerfilUsuarioEnum.ADMINISTRADOR).count()

    ultimos_artigos = Artigo.query.order_by(Artigo.data_cadastro.desc()).limit(5).all()

    return render_template(
        'admin/dashboard/index.html',
        total_artigos=total_artigos,
        total_temas=total_temas,
        total_sintomas=total_sintomas,
        total_fases=total_fases,
        total_palavras=total_palavras,
        total_usuarias=total_usuarias,
        total_admins=total_admins,
        ultimos_artigos=ultimos_artigos,
        active_page='dashboard'
    )
