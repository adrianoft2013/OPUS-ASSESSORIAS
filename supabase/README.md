# Migração do Banco de Dados para Supabase - OpusAssessorias

Este diretório contém a estrutura de tabelas, relacionamentos, políticas de segurança e índices necessários para configurar e rodar o aplicativo **OpusAssessorias** no **Supabase**.

---

## 🚀 Como Aplicar as Migrações

Você tem duas maneiras simples de rodar esta migração no seu projeto do Supabase:

### Método 1: Pelo Editor SQL do Painel do Supabase (Mais Rápido)

1. Acesse o [Painel do Supabase](https://supabase.com/dashboard) e entre no seu projeto **OpusAssessorias**.
2. No menu lateral esquerdo, clique em **SQL Editor** (Editor SQL).
3. Clique em **New Query** (Nova Consulta).
4. Abra o arquivo localizado em `/supabase/migrations/20260629000000_init_schema.sql` deste repositório, copie todo o seu conteúdo e cole no editor SQL do Supabase.
5. Clique no botão **Run** (Executar) no canto inferior direito.
6. Pronto! Todas as tabelas, índices, relacionamentos e regras de segurança (RLS) estarão criados com sucesso.

### Método 2: Pela CLI do Supabase (Para Desenvolvedores)

Se você utiliza a CLI local do Supabase, você pode aplicar as migrações diretamente:

```bash
# Vincule seu projeto local ao projeto do Supabase na nuvem (se ainda não fez)
supabase link --project-ref seu-id-do-projeto

# Aplique as migrações pendentes ao seu banco de dados de produção
supabase db push
```

---

## 📂 Visão Geral da Estrutura das Tabelas

As tabelas criadas no banco de dados correspondem exatamente às interfaces TypeScript utilizadas no aplicativo:

1. **`companies` (Empresas)**:
   - Armazena dados de CNPJ, nome da empresa, contatos, telefones e cidade/UF.
2. **`works` (Obras)**:
   - Vinculada a uma empresa específica (`company_id`). Armazena informações do responsável, contato e localidade.
3. **`inspections` (Inspeções / Fiscalizações)**:
   - Registra as inspeções realizadas para uma obra específica.
   - Contém um campo do tipo `JSONB` chamado `evidences` (evidências), estruturado como uma lista contendo a foto, descrição e nome do arquivo de forma dinâmica.
4. **`employees` (Funcionários)**:
   - Armazena dados do trabalhador (CPF, Cargo, Status, etc.).
   - Vinculado opcionalmente a uma empresa (`company_id`) e obra (`work_id`).
   - Contém o campo `documents` (documentos) em formato `JSONB`, ideal para guardar listas de documentos com data de vencimento (ex: ASO, EPI, NR06, NR10, NR12, NR18, NR35).
5. **`company_data` (Dados Corporativos)**:
   - Guarda a logo e o nome global da empresa que são exibidos nos cabeçalhos e relatórios.

---

## 🔒 Segurança (Row Level Security - RLS)

Todas as tabelas foram configuradas por padrão com **Row Level Security (RLS)** ativado. Isso garante que:
- Os usuários do seu app apenas visualizem e manipulem os registros vinculados ao seu próprio ID de usuário (`user_id` em referência a `auth.users`).
- Os dados sejam completamente isolados de forma segura e em conformidade com as melhores práticas de privacidade.

---

## 📦 Armazenamento de Arquivos (Storage Buckets)

Para salvar e servir os arquivos de documentos dos funcionários e fotos das inspeções, sugerimos que você crie dois Buckets de Armazenamento (Storage Buckets) no painel do Supabase:

1. No painel do Supabase, vá em **Storage** no menu lateral.
2. Clique em **New Bucket** (Novo Bucket):
   - Crie um bucket com o nome **`employee-documents`** (para guardar arquivos como PDFs/imagens de ASO, NR12, etc.). Configure-o como público ou privado de acordo com a sua preferência de privacidade.
   - Crie outro bucket com o nome **`inspection-evidences`** (para as fotos das inspeções/evidências).
3. Crie as políticas de acesso no painel do Storage se decidir mantê-los privados, permitindo que apenas usuários autenticados façam upload e leitura dos arquivos.
