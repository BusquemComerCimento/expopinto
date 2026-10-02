import sqlite3
from contextlib import closing
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / 'bd' / 'banco.db'
SCHEMA_PATH = DB_PATH.parent / 'script.sql'


def get_db_connection(path=DB_PATH):
    conn = sqlite3.connect(path, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn


def initialize_database(path=DB_PATH):
    """Preserva bancos existentes; cria tabelas somente em bancos vazios."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with closing(get_db_connection(path)) as conn:
        tables = {row['name'] for row in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
        if not tables:
            conn.executescript(SCHEMA_PATH.read_text(encoding='utf-8'))
        required = {
            'produtos': {'id_produto', 'id_categoria', 'nome', 'descricao', 'preco', 'estoque', 'imagem', 'ativo'},
            'categorias': {'id_categoria', 'nome', 'descricao', 'ativo'},
        }
        for table, columns in required.items():
            actual = {row['name'] for row in conn.execute(f'PRAGMA table_info({table})')}
            if not columns <= actual:
                raise RuntimeError('Banco incompatível. Preserve uma cópia e use o script.sql da Etapa 1 em um banco novo.')
