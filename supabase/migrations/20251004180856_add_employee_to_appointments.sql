/*
  # Adicionar funcionário aos agendamentos

  1. Alterações
    - Adicionar coluna `employee_id` na tabela `appointments`
      - Referência para a tabela `employees`
      - Campo opcional (permite valores nulos)
    - Adicionar coluna `employee_name` na tabela `appointments`
      - Nome do funcionário no momento do agendamento
      - Campo opcional

  2. Índices
    - Adicionar índice para `employee_id` para melhor performance em filtros

  3. Notas
    - Campo opcional para manter compatibilidade com agendamentos existentes
    - Permite filtrar agendamentos por funcionário
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'employee_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN employee_id uuid REFERENCES employees(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'employee_name'
  ) THEN
    ALTER TABLE appointments ADD COLUMN employee_name text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON appointments(employee_id);
