/*
  # Adicionar campo de foto para funcionários

  1. Alterações
    - Adicionar coluna `photo_url` na tabela `employees`
      - Campo para armazenar URL da foto do funcionário
      - Permite valores nulos (opcional)

  2. Notas
    - A foto será armazenada como URL (pode ser base64 ou link externo)
    - Campo opcional para manter compatibilidade com funcionários existentes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE employees ADD COLUMN photo_url text;
  END IF;
END $$;
