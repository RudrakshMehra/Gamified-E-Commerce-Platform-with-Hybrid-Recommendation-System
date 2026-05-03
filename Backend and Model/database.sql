CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  email    TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  xp       INTEGER DEFAULT 0,
  level    INTEGER DEFAULT 1,
  coins    INTEGER DEFAULT 0
);

CREATE TABLE products (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL,
  price    NUMERIC NOT NULL,
  category TEXT,
  image    TEXT
);

CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id),
  status     TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL
);

CREATE TABLE cart (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL
);







CREATE TABLE contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);






CREATE TABLE claimed_rewards (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id),
  level      INTEGER NOT NULL,
  claimed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, level)
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';















