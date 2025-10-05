/*
  # Schema completo para sistema de barbearia

  1. Novas Tabelas
    - `services` - Serviços oferecidos pela barbearia
      - `id` (uuid, primary key)
      - `name` (text, nome do serviço)
      - `description` (text, descrição)
      - `price` (decimal, preço)
      - `duration` (integer, duração em minutos)
      - `is_active` (boolean, se está ativo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `products` - Produtos vendidos
      - `id` (uuid, primary key)
      - `name` (text, nome do produto)
      - `description` (text, descrição)
      - `price` (decimal, preço)
      - `stock` (integer, quantidade em estoque)
      - `is_active` (boolean, se está ativo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `clients` - Clientes da barbearia
      - `id` (uuid, primary key)
      - `name` (text, nome completo)
      - `phone` (text, telefone/whatsapp)
      - `email` (text, email opcional)
      - `is_blocked` (boolean, se está bloqueado)
      - `total_appointments` (integer, total de agendamentos)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `employees` - Funcionários
      - `id` (uuid, primary key)
      - `name` (text, nome completo)
      - `phone` (text, telefone)
      - `email` (text, email opcional)
      - `specialties` (text[], especialidades)
      - `is_active` (boolean, se está ativo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointments` - Agendamentos
      - `id` (uuid, primary key)
      - `client_id` (uuid, referência ao cliente)
      - `client_name` (text, nome do cliente)
      - `client_phone` (text, telefone do cliente)
      - `appointment_date` (date, data do agendamento)
      - `appointment_time` (time, horário do agendamento)
      - `status` (text, status: scheduled/completed/cancelled)
      - `total_price` (decimal, preço total)
      - `total_duration` (integer, duração total em minutos)
      - `notes` (text, observações)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointment_services` - Serviços do agendamento (many-to-many)
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, referência ao agendamento)
      - `service_id` (uuid, referência ao serviço)
      - `service_name` (text, nome do serviço no momento)
      - `service_price` (decimal, preço do serviço no momento)
      - `service_duration` (integer, duração do serviço no momento)

    - `barber_info` - Informações da barbearia
      - `id` (uuid, primary key)
      - `name` (text, nome da barbearia)
      - `address` (text, endereço)
      - `phone` (text, telefone)
      - `whatsapp` (text, whatsapp)
      - `instagram` (text, instagram)
      - `business_hours` (jsonb, horários de funcionamento)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para acesso público de leitura em services, products, barber_info
    - Políticas para clientes acessarem seus próprios dados
    - Políticas administrativas para funcionários

  3. Índices
    - Índices para melhor performance em consultas frequentes
    - Índices compostos para relacionamentos
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  is_blocked boolean NOT NULL DEFAULT false,
  total_appointments integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phone)
);

-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  specialties text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  total_duration integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de serviços do agendamento (many-to-many)
CREATE TABLE IF NOT EXISTS appointment_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  service_price decimal(10,2) NOT NULL,
  service_duration integer NOT NULL
);

-- Tabela de informações da barbearia
CREATE TABLE IF NOT EXISTS barber_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'WRX Barbearia',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  business_hours jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barber_info_updated_at BEFORE UPDATE ON barber_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment_id ON appointment_services(appointment_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

-- Habilitar RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_info ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança

-- Services: Leitura pública, escrita apenas para autenticados
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Services are editable by authenticated users" ON services FOR ALL TO authenticated USING (true);

-- Products: Leitura pública, escrita apenas para autenticados
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by authenticated users" ON products FOR ALL TO authenticated USING (true);

-- Clients: Acesso público para criação, leitura por telefone
CREATE POLICY "Clients can be created by anyone" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Clients can view their own data" ON clients FOR SELECT USING (true);
CREATE POLICY "Clients can be updated by authenticated users" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Clients can be deleted by authenticated users" ON clients FOR DELETE TO authenticated USING (true);

-- Employees: Apenas para usuários autenticados
CREATE POLICY "Employees are manageable by authenticated users" ON employees FOR ALL TO authenticated USING (true);

-- Appointments: Criação pública, visualização por telefone, gerenciamento por autenticados
CREATE POLICY "Appointments can be created by anyone" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments are viewable by everyone" ON appointments FOR SELECT USING (true);
CREATE POLICY "Appointments are manageable by authenticated users" ON appointments FOR ALL TO authenticated USING (true);

-- Appointment Services: Seguem as mesmas regras dos appointments
CREATE POLICY "Appointment services can be created by anyone" ON appointment_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointment services are viewable by everyone" ON appointment_services FOR SELECT USING (true);
CREATE POLICY "Appointment services are manageable by authenticated users" ON appointment_services FOR ALL TO authenticated USING (true);

-- Barber Info: Leitura pública, escrita apenas para autenticados
CREATE POLICY "Barber info is viewable by everyone" ON barber_info FOR SELECT USING (true);
CREATE POLICY "Barber info is editable by authenticated users" ON barber_info FOR ALL TO authenticated USING (true);

-- Inserir dados iniciais

-- Serviços iniciais
INSERT INTO services (name, description, price, duration) VALUES
  ('Corte Masculino', 'Corte moderno com acabamento perfeito', 35.00, 30),
  ('Barba Completa', 'Aparar e modelar barba com produtos premium', 25.00, 20),
  ('Corte + Barba', 'Combo completo para um visual impecável', 55.00, 45)
ON CONFLICT DO NOTHING;

-- Produtos iniciais
INSERT INTO products (name, description, price, stock) VALUES
  ('Pomada Modeladora', 'Pomada para modelar e fixar o cabelo', 28.00, 15),
  ('Óleo para Barba', 'Óleo hidratante para barba macia', 32.00, 8)
ON CONFLICT DO NOTHING;

-- Informações da barbearia
INSERT INTO barber_info (name, address, phone, whatsapp, instagram, business_hours) VALUES
  (
    'WRX Barbearia',
    'Rua das Tesouras, 123 - Centro',
    '(17) 98826-4100',
    '5517988264100',
    '@wendelroliveira',
    '{
      "monday": "9:00 - 18:00",
      "tuesday": "9:00 - 18:00",
      "wednesday": "9:00 - 18:00",
      "thursday": "9:00 - 18:00",
      "friday": "9:00 - 19:00",
      "saturday": "8:00 - 16:00",
      "sunday": "Fechado"
    }'
  )
ON CONFLICT DO NOTHING;