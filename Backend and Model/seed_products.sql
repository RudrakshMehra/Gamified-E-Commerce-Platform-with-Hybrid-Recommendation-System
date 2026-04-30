-- ShopXP product seed — matches actual files in Backend and Model/uploads/
-- Run this in psql after creating tables:
--   psql -U postgres -d shopxp -f seed_products.sql

INSERT INTO products (name, price, category, image) VALUES
  -- Mobiles
  ('Smartphone A',   15000, 'mobiles',    'smartphoneA.jpg'),
  ('Smartphone B',   20000, 'mobiles',    'SmartphoneB.jpg'),
  ('Smartphone C',   25000, 'mobiles',    'smartphoneC.png'),
  ('Smartphone D',   30000, 'mobiles',    'SmartphoneD.jpg'),

  -- Electronics
  ('Laptop',         55000, 'electronics','Laptop.jpg'),
  ('Smart Watch',     5000, 'electronics','Smart Watch.png'),
  ('Bluetooth Speaker', 2500, 'electronics','Bluetooth Speaker.png'),
  ('Speaker',         3000, 'electronics','Speaker.png'),
  ('Camera',         18000, 'electronics','camera.jpg'),
  ('Camera B',       22000, 'electronics','cameraB.jpg'),

  -- Fashion
  ('T-Shirt',          800, 'fashion',    'Tshirt.png'),
  ('Jeans',           1500, 'fashion',    'jeans.png'),
  ('Jacket',          2500, 'fashion',    'jacket.png'),
  ('Shoes',           2000, 'fashion',    'shoes.png'),

  -- Beauty
  ('Face Cream',       500, 'beauty',     'facecream.png'),
  ('Lipstick',         700, 'beauty',     'lipstick.png'),
  ('Perfume',         1200, 'beauty',     'perfume.png'),
  ('Face Wash',        300, 'beauty',     'facewash.png'),

  -- Appliances
  ('Microwave',       7000, 'appliances', 'microwave.png'),
  ('Refrigerator',   25000, 'appliances', 'refrigrator.png'),
  ('Washing Machine',18000, 'appliances', 'washingmachine.png'),
  ('Air Conditioner',35000, 'appliances', 'airconnditioner.png');
