PRAGMA foreign_keys = ON;

CREATE TABLE
  IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    senha TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'adm')),
    data_cadastro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
  );

CREATE TABLE
  IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco INTEGER NOT NULL CHECK (preco >= 0),
    id_categoria INTEGER NOT NULL REFERENCES categorias (id),
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    imagem TEXT,
    destaque INTEGER NOT NULL DEFAULT 0 CHECK (destaque IN (0, 1)),
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
  );

CREATE TABLE
  IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios (id),
    valor_total INTEGER NOT NULL CHECK (valor_total >= 0),
    status TEXT NOT NULL DEFAULT 'pendente',
    data_pedido TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
    id_produto INTEGER NOT NULL REFERENCES produtos (id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario INTEGER NOT NULL CHECK (preco_unitario >= 0)
  );

CREATE TABLE
  IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER REFERENCES usuarios (id),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    assunto TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    categoria TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'aberto',
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos (id_categoria);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos (id_usuario);

-- Catálogo oficial da CLS Enlatados.
INSERT
OR IGNORE INTO categorias (nome, descricao)
VALUES
  (
    'Camisetas',
    'Camisetas e peças gráficas da coleção.'
  ),
  ('Calças', 'Calças e modelagens urbanas.'),
  (
    'Peças',
    'Peças da coleção ainda sem categoria específica.'
  ),
  ('Acessórios', 'Acessórios da CLS Enlatados.');

UPDATE categorias
SET
  ativo = 0
WHERE
  nome IN ('Moletons');

UPDATE produtos
SET
  ativo = 0
WHERE
  nome IN (
    'Static Tee',
    'Concrete Cargo',
    'No Signal Hoodie',
    '404 Cap',
    'After Dark Tee',
    'Utility Pant',
    'Late Shift Crew',
    'Side Bag'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS 22601',
  'Peça da coleção CLS Enlatados.',
  11990,
  id,
  10,
  '/assets/22601_2.webp',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS 22601'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS 22602',
  'Peça da coleção CLS Enlatados.',
  11990,
  id,
  10,
  '/assets/22602_2.webp',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS 22602'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS 22616',
  'Peça da coleção CLS Enlatados.',
  12990,
  id,
  10,
  '/assets/22616_2.webp',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS 22616'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS 22620',
  'Peça da coleção CLS Enlatados.',
  12990,
  id,
  10,
  '/assets/22620_2.webp',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS 22620'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS 22644',
  'Peça da coleção CLS Enlatados.',
  13990,
  id,
  10,
  '/assets/22644_6.jpg',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS 22644'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS 22655',
  'Peça da coleção CLS Enlatados.',
  13990,
  id,
  10,
  '/assets/22655_1.jpg',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS 22655'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'Camiseta Raízes Preta',
  'Camiseta preta da coleção CLS Enlatados.',
  11990,
  id,
  10,
  '/assets/22_52_17_868_camiseta-20rai-cc-81zes-20preta-22087340.avif',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Camisetas'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'Camiseta Raízes Preta'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'Calça High x Barra',
  'Calça da coleção CLS Enlatados.',
  17990,
  id,
  10,
  '/assets/JP081.01_Calca_HIGH_x_Barra_1.webp',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Calças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'Calça High x Barra'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS MG-9241',
  'Peça da coleção CLS Enlatados.',
  14990,
  id,
  10,
  '/assets/MG_9241copiar.webp',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS MG-9241'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS MG-9252',
  'Peça da coleção CLS Enlatados.',
  14990,
  id,
  10,
  '/assets/MG_9252copiar.webp',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS MG-9252'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS LOOK 01',
  'Peça da coleção CLS Enlatados.',
  12990,
  id,
  10,
  '/assets/image1.jpg',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS LOOK 01'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS LOOK 02',
  'Peça da coleção CLS Enlatados.',
  12990,
  id,
  10,
  '/assets/image2.jpg',
  1,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS LOOK 02'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS LOOK 04',
  'Peça da coleção CLS Enlatados.',
  13990,
  id,
  10,
  '/assets/image4.jpg',
  0,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS LOOK 04'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS LOOK 05',
  'Peça da coleção CLS Enlatados.',
  13990,
  id,
  10,
  '/assets/image5.jpg',
  0,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS LOOK 05'
  );

INSERT INTO
  produtos (
    nome,
    descricao,
    preco,
    id_categoria,
    estoque,
    imagem,
    destaque,
    ativo
  )
SELECT
  'CLS LOOK 06',
  'Peça da coleção CLS Enlatados.',
  13990,
  id,
  10,
  '/assets/image6.jpg',
  0,
  1
FROM
  categorias
WHERE
  nome = 'Peças'
  AND NOT EXISTS (
    SELECT
      1
    FROM
      produtos
    WHERE
      nome = 'CLS LOOK 06'
  );