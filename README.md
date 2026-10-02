# ExpoPinto

Loja streetwear reconstruída como aplicação Flask + SQLite com frontend responsivo.

## Stack
Python / Flask, SQLite, HTML/CSS/JavaScript e Werkzeug para hash de senhas.

## Rodar
1. `python -m venv .venv`
2. Ative o ambiente virtual.
3. `pip install -r Backend/requirements.txt`
4. Copie `.env.example` para `.env` e ajuste a chave.
5. `python Backend/app.py`
6. Abra `http://localhost:5000`.

O banco é criado automaticamente em `bd/expopinto.db`; o schema completo está em `database.sql`.

## Funcionalidades
Home com carrossel, catálogo via API, busca/filtros/ordenação, página de produto, cadastro/login com hash seguro, sessão, conta, carrinho, pedidos, estoque e suporte com tickets persistidos.

O pagamento não é cobrado de verdade nesta versão: o checkout apenas cria o pedido.