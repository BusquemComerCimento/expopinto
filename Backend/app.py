from pathlib import Path
import os
import sqlite3
from functools import wraps

from flask import Flask, jsonify, request, send_from_directory, session
from dotenv import load_dotenv
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
DB_PATH = Path(os.getenv("DATABASE_PATH", ROOT / "bd" / "expopinto.db"))
FRONTEND = ROOT / "frontend"

app = Flask(__name__, static_folder=str(ROOT / "src"), static_url_path="/src")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-only-change-me")
app.config["JSON_SORT_KEYS"] = False
CORS(app, supports_credentials=True)

# Abre uma conexão com o banco SQLite e configura o retorno das consultas como linhas nomeadas.
def db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

# Cria/atualiza as tabelas usando database.sql e popula dados iniciais quando necessário.
def init_db():
    schema = (ROOT / "database.sql").read_text(encoding="utf-8")
    with db() as conn:
        conn.executescript(schema)
        count = conn.execute("SELECT COUNT(*) FROM categorias").fetchone()[0]
        if count == 0:
            seed(conn)

# Insere categorias e produtos iniciais para o catálogo funcionar na primeira execução.
def seed(conn):
    categories = [
        ("Camisetas", "Oversized, regular e peças gráficas."),
        ("Calças", "Cargos e cortes largos para o dia a dia."),
        ("Moletons", "Peças pesadas para quando o tempo fecha."),
        ("Acessórios", "Bonés, bolsas e detalhes da coleção."),
    ]
    conn.executemany("INSERT INTO categorias (nome, descricao) VALUES (?, ?)", categories)
    ids = {r["nome"]: r["id"] for r in conn.execute("SELECT id,nome FROM categorias")}
    products = [
        ("Static Tee", "Camiseta oversized 240g, algodão, estampa frontal discreta.", 8990, ids["Camisetas"], 18, "/assets/product-tee.svg", 1),
        ("Concrete Cargo", "Cargo de corte largo, bolsos utilitários e regulagem na barra.", 18990, ids["Calças"], 9, "/assets/product-cargo.svg", 1),
        ("No Signal Hoodie", "Moletom pesado com capuz duplo e aplicação nas costas.", 22990, ids["Moletons"], 7, "/assets/product-hoodie.svg", 1),
        ("404 Cap", "Boné de aba curva com bordado 404 e fecho regulável.", 6990, ids["Acessórios"], 22, "/assets/product-cap.svg", 1),
        ("After Dark Tee", "Camiseta preta oversized com gráfica em vermelho.", 9490, ids["Camisetas"], 14, "/assets/product-tee.svg", 0),
        ("Utility Pant", "Calça reta com bolsos laterais e tecido encorpado.", 17990, ids["Calças"], 6, "/assets/product-cargo.svg", 0),
        ("Late Shift Crew", "Moletom careca de gramatura alta para os dias frios.", 19990, ids["Moletons"], 11, "/assets/product-hoodie.svg", 0),
        ("Side Bag", "Shoulder bag compacta com dois compartimentos.", 10990, ids["Acessórios"], 15, "/assets/product-bag.svg", 0),
    ]
    conn.executemany(
        "INSERT INTO produtos (nome,descricao,preco,id_categoria,estoque,imagem,destaque) VALUES (?,?,?,?,?,?,?)",
        products,
    )

# Padroniza respostas de erro da API em JSON.
def json_error(message, status=400):
    return jsonify({"erro": message}), status

# Decorador que protege rotas que exigem um usuário autenticado.
def user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return json_error("Faça login para continuar.", 401)
        return fn(*args, **kwargs)
    return wrapper

# Decorador que restringe rotas a usuários com perfil administrativo.
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id") or session.get("user_type") != "adm":
            return json_error("Acesso restrito.", 403)
        return fn(*args, **kwargs)
    return wrapper

# Converte uma linha do banco em um dicionário de produto pronto para a API.
def product_dict(row):
    item = dict(row)
    item["preco"] = item["preco"] / 100
    item["disponivel"] = bool(item["estoque"] > 0 and item["ativo"])
    item["destaque"] = bool(item["destaque"])
    return item

@app.after_request
# Impede cache das respostas da API para que os dados exibidos estejam atualizados.
def no_store_api(response):
    if request.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response

@app.get("/api/status")
# Endpoint usado para verificar se a API está funcionando.
def status():
    return jsonify({"status": "ok", "servico": "CLS Enlatados API"})

@app.post("/api/auth/register")
# Valida os dados e cria uma nova conta de cliente.
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return json_error("Envie um JSON válido.")
    name = str(data.get("nome", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("senha", ""))
    if len(name) < 2 or "@" not in email:
        return json_error("Nome e e-mail são obrigatórios.")
    if len(password) < 6:
        return json_error("A senha precisa ter pelo menos 6 caracteres.")
    with db() as conn:
        if conn.execute("SELECT 1 FROM usuarios WHERE email=?", (email,)).fetchone():
            return json_error("Este e-mail já está cadastrado.", 409)
        cur = conn.execute(
            "INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)",
            (name, email, password),
        )
        session["user_id"] = cur.lastrowid
        session["user_type"] = "cliente"
    return jsonify({"usuario": {"id": cur.lastrowid, "nome": name, "email": email}}), 201

@app.post("/api/auth/login")
# Valida e-mail e senha e cria a sessão do usuário.
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return json_error("Envie um JSON válido.")
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("senha", ""))
    with db() as conn:
        row = conn.execute("SELECT id,nome,email,senha,tipo FROM usuarios WHERE email=?", (email,)).fetchone()
    if not row or not check_password_hash(row["senha"], password):
        return json_error("E-mail ou senha incorretos.", 401)
    session["user_id"] = row["id"]
    session["user_type"] = row["tipo"]
    return jsonify({"usuario": {"id": row["id"], "nome": row["nome"], "email": row["email"]}})

@app.post("/api/auth/logout")
# Encerra a sessão atual do usuário.
def logout():
    session.clear()
    return jsonify({"ok": True})

@app.get("/api/auth/me")
@user_required
# Retorna os dados do usuário autenticado.
def me():
    with db() as conn:
        row = conn.execute("SELECT id,nome,email,tipo,data_cadastro FROM usuarios WHERE id=?", (session["user_id"],)).fetchone()
    if not row:
        session.clear()
        return json_error("Usuário não encontrado.", 401)
    return jsonify({"usuario": dict(row)})

@app.get("/api/categorias")
# Retorna as categorias ativas do catálogo.
def categories():
    with db() as conn:
        rows = conn.execute("SELECT id,nome,descricao FROM categorias WHERE ativo=1 ORDER BY nome").fetchall()
    return jsonify([dict(r) for r in rows])

@app.get("/api/produtos")
# Consulta produtos aplicando busca, categoria e ordenação.
def products():
    category = request.args.get("categoria", "").strip()
    query = request.args.get("busca", "").strip()
    order = request.args.get("ordem", "recentes")
    sql = """SELECT p.id,p.nome,p.descricao,p.preco,p.estoque,p.imagem,p.destaque,p.ativo,c.nome AS categoria
         FROM produtos p JOIN categorias c ON c.id=p.id_categoria
         WHERE p.ativo=1 AND c.ativo=1"""
    params = []
    if category:
        sql += " AND c.nome=?"
        params.append(category)
    if query:
        sql += " AND (p.nome LIKE ? OR p.descricao LIKE ?)"
        params += [f"%{query}%", f"%{query}%"]
    sql += {"menor": " ORDER BY p.preco ASC", "maior": " ORDER BY p.preco DESC", "nome": " ORDER BY p.nome", "recentes": " ORDER BY p.id DESC"}.get(order, " ORDER BY p.id DESC")
    with db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return jsonify([product_dict(r) for r in rows])

@app.get("/api/produtos/<int:product_id>")
# Retorna os dados de um produto específico.
def product(product_id):
    with db() as conn:
        row = conn.execute("""SELECT p.*, c.nome AS categoria FROM produtos p
                              JOIN categorias c ON c.id=p.id_categoria
                              WHERE p.id=? AND p.ativo=1 AND c.ativo=1""", (product_id,)).fetchone()
    if not row:
        return json_error("Produto não encontrado.", 404)
    return jsonify(product_dict(row))

@app.post("/api/suporte")
# Recebe e salva um chamado enviado pelo formulário de suporte.
def support():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return json_error("Envie um JSON válido.")
    required = ["nome", "email", "assunto", "mensagem", "categoria"]
    if any(not str(data.get(k, "")).strip() for k in required):
        return json_error("Preencha todos os campos.")
    with db() as conn:
        conn.execute(
            "INSERT INTO tickets (id_usuario,nome,email,assunto,mensagem,categoria) VALUES (?,?,?,?,?,?)",
            (session.get("user_id"), str(data["nome"]).strip(), str(data["email"]).strip(), str(data["assunto"]).strip(), str(data["mensagem"]).strip(), str(data["categoria"]).strip()),
        )
    return jsonify({"mensagem": "Mensagem recebida. A equipe vai responder por e-mail."}), 201

@app.post("/api/pedidos")
@user_required
# Impede a criação direta: o pedido só nasce depois do pagamento demonstrativo.
def create_order():
    return json_error("O pedido só pode ser criado após a aprovação do pagamento.", 409)

@app.post("/api/pagamentos")
@user_required
# Simula o pagamento, cria o pedido, registra os itens e atualiza o estoque.
def fake_payment():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return json_error("Envie um JSON válido.")

    method = str(data.get("metodo", "")).strip().lower()
    items = data.get("itens")
    if method not in {"pix", "cartao"}:
        return json_error("Escolha uma forma de pagamento válida.")
    if not isinstance(items, list) or not items:
        return json_error("A sacola está vazia.")

    with db() as conn:
        total = 0
        normalized = []
        for item in items:
            try:
                pid, qty = int(item["produto_id"]), int(item["quantidade"])
            except (KeyError, TypeError, ValueError):
                return json_error("Item de pagamento inválido.")
            if qty < 1:
                return json_error("Quantidade inválida.")

            row = conn.execute(
                "SELECT id,nome,preco,estoque FROM produtos WHERE id=? AND ativo=1",
                (pid,),
            ).fetchone()
            if not row:
                return json_error("Produto não encontrado.", 404)
            if row["estoque"] < qty:
                return json_error(f"Estoque insuficiente para {row['nome']}.", 409)

            total += row["preco"] * qty
            normalized.append((row["id"], qty, row["preco"]))

        # Pagamento 100% fictício: nenhum dado financeiro é armazenado.
        cur = conn.execute(
            "INSERT INTO pedidos (id_usuario,valor_total,status) VALUES (?,?,?)",
            (session["user_id"], total, "pago"),
        )
        order_id = cur.lastrowid

        for pid, qty, price in normalized:
            conn.execute(
                "INSERT INTO itens_pedido (id_pedido,id_produto,quantidade,preco_unitario) VALUES (?,?,?,?)",
                (order_id, pid, qty, price),
            )
            conn.execute(
                "UPDATE produtos SET estoque=estoque-? WHERE id=?",
                (qty, pid),
            )

    return jsonify({
        "id": order_id,
        "total": total / 100,
        "status": "pago",
        "pagamento": "aprovado",
    }), 201

@app.get("/api/pedidos")
@user_required
# Lista os pedidos pertencentes ao usuário autenticado.
def orders():
    with db() as conn:
        rows = conn.execute("SELECT id,valor_total,status,data_pedido FROM pedidos WHERE id_usuario=? ORDER BY id DESC", (session["user_id"],)).fetchall()
    return jsonify([{**dict(r), "valor_total": r["valor_total"] / 100} for r in rows])

@app.get("/api/pedidos/<int:order_id>")
@user_required
# Retorna os dados e itens de um pedido específico do usuário.
def order_detail(order_id):
    with db() as conn:
        row = conn.execute(
            "SELECT id,valor_total,status,data_pedido FROM pedidos WHERE id=? AND id_usuario=?",
            (order_id, session["user_id"]),
        ).fetchone()
        if not row:
            return json_error("Pedido não encontrado.", 404)

        items = conn.execute(
            """SELECT i.quantidade, i.preco_unitario, p.nome, p.imagem
               FROM itens_pedido i
               JOIN produtos p ON p.id=i.id_produto
               WHERE i.id_pedido=?
               ORDER BY i.id""",
            (order_id,),
        ).fetchall()

    return jsonify({
        "id": row["id"],
        "valor_total": row["valor_total"] / 100,
        "status": row["status"],
        "data_pedido": row["data_pedido"],
        "itens": [
            {
                **dict(item),
                "preco_unitario": item["preco_unitario"] / 100,
            }
            for item in items
        ],
    })

@app.get("/")
# Entrega a página inicial da loja.
def home():
    return send_from_directory(FRONTEND, "index.html")

@app.get("/<page>")
# Entrega uma das páginas HTML permitidas pelo backend.
def pages(page):
    if page in {"catalogo", "sobre", "suporte", "login", "cadastro", "conta", "pagamento", "pedido"}:
        return send_from_directory(FRONTEND, f"{page}.html")
    return json_error("Página não encontrada.", 404)

@app.get("/produto/<int:product_id>")
# Entrega o template da página de produto; os dados são carregados pelo JavaScript.
def product_page(product_id):
    return send_from_directory(FRONTEND, "produto.html")

@app.get("/assets/<path:filename>")
# Serve imagens e outros arquivos estáticos da pasta de assets.
def assets(filename):
    return send_from_directory(FRONTEND / "assets", filename)

init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=os.getenv("FLASK_DEBUG", "0") == "1")
