# TaskFlow: sistema de gerenciamento de tarefas

## 1. Introdução

O TaskFlow é uma aplicação web para cadastro e organização de tarefas pessoais. O sistema permite criar, editar, excluir, filtrar e ordenar tarefas. Também possui cadastro e login de usuários.

O projeto foi desenvolvido como uma aplicação full-stack. No frontend foi utilizado React e, no backend, FastAPI. O Supabase é responsável pelo banco PostgreSQL e pela autenticação.

## 2. Tecnologias utilizadas

- **Frontend:** React 18, React Router e Vite
- **Backend:** Python, FastAPI, Uvicorn e Pydantic
- **Banco e autenticação:** Supabase, PostgreSQL e JWT
- **Testes:** pytest, httpx e TestClient do FastAPI

O frontend também possui um modo mock. Quando essa opção está ativada, os dados são salvos no `localStorage`, o que permite testar a interface sem configurar o Supabase.

## 3. Organização do projeto

O projeto está dividido em duas partes principais:

```text
taskflow/
├── client/        # Interface em React
├── server/        # API em FastAPI
├── docs/          # Instruções de configuração
└── README.md
```

No frontend, as páginas ficam separadas dos componentes reutilizáveis. Os serviços fazem a comunicação com a API, enquanto o hook `useTasks` concentra o estado e as operações relacionadas às tarefas.

No backend, as rotas recebem as requisições e chamam os serviços responsáveis pela autenticação e pelo CRUD de tarefas. Os schemas do Pydantic verificam os dados antes que eles sejam processados.

## 4. Funcionamento do frontend

As principais rotas da aplicação são:

| Rota | Função |
|---|---|
| `/login` | Entrada do usuário |
| `/cadastro` | Criação de uma conta |
| `/tarefas` | Lista e gerenciamento das tarefas |

A rota de tarefas é protegida. Ao abrir a aplicação, o `AuthContext` verifica se existe um token salvo. Se o token for válido, o usuário continua conectado; caso contrário, ele é enviado para a tela de login.

A página de tarefas usa o hook `useTasks`, que controla o carregamento, a criação, a edição e a exclusão dos registros. Os filtros são aplicados no próprio frontend por meio da busca, da prioridade, do status e da ordenação.

Foram criados componentes próprios para botões, campos de formulário, selects, mensagens, modais, avisos e cartões de tarefas. O CSS usa variáveis para cores, espaçamentos e tamanhos, além de regras para telas menores.

## 5. Funcionamento do backend

A API possui dois grupos de rotas:

### Autenticação

- `POST /auth/register`: cadastra um usuário;
- `POST /auth/login`: verifica os dados e retorna um token;
- `GET /auth/me`: retorna os dados do usuário autenticado.

### Tarefas

- `GET /tasks`: lista as tarefas do usuário;
- `POST /tasks`: cria uma tarefa;
- `PATCH /tasks/{id}`: atualiza uma tarefa;
- `DELETE /tasks/{id}`: exclui uma tarefa.

O token é enviado no cabeçalho `Authorization` como Bearer token. O backend valida esse token antes de liberar as rotas de tarefas. Os dados recebidos são validados pelos schemas, incluindo email, tamanho dos textos, prioridade, status e data limite.

## 6. Banco de dados e segurança

A tabela `tasks` possui os campos principais da tarefa, além do identificador do usuário e da data de criação. Os valores de prioridade e status também possuem restrições no banco.

O Supabase utiliza Row Level Security (RLS) para garantir que cada usuário veja apenas as próprias tarefas. O backend também filtra as consultas pelo `user_id`, criando uma segunda camada de proteção.

As principais medidas adotadas foram:

- autenticação por JWT;
- validação no frontend e no backend;
- restrições de valores no banco;
- isolamento das tarefas por usuário;
- CORS limitado às origens usadas no desenvolvimento.

Em uma versão de produção, as origens permitidas no CORS e o armazenamento do token deveriam ser revisados de acordo com a infraestrutura utilizada.

## 7. Testes

Foram escritos 23 testes automatizados para a API. Dez verificam a autenticação e treze verificam o gerenciamento de tarefas.

Entre os cenários testados estão:

- cadastro e login;
- email inválido e senha curta;
- credenciais incorretas;
- acesso sem token;
- criação, edição e exclusão de tarefas;
- dados obrigatórios ausentes;
- tarefa inexistente;
- isolamento entre usuários.

Os testes usam um banco falso em memória e substituem as dependências do Supabase. Assim, é possível testar as rotas sem depender de uma conexão externa.

## 8. Classificação do sistema distribuído

### Componentes

O sistema tem três partes principais: o frontend, feito em React; o backend, feito em FastAPI; e o Supabase, que reúne o banco PostgreSQL e o serviço de autenticação. Essas partes funcionam separadamente e trocam informações por meio de requisições HTTP.

### Compartilhamento

O banco de dados é compartilhado pelos usuários, mas cada usuário acessa somente as próprias tarefas. Esse controle é feito pelo RLS do Supabase e também pelo filtro aplicado no backend. A API também é compartilhada, pois atende todos os clientes da aplicação.

### Tipo de sistema distribuído

O TaskFlow pode ser classificado principalmente como um sistema distribuído de informação. Sua função principal é armazenar, consultar e atualizar dados. Ele não depende de processamento distribuído pesado nem de sensores ou dispositivos físicos.

### Transparência

O usuário não precisa saber que o frontend passa pelo backend antes de acessar o Supabase. Também não precisa conhecer a localização física do banco ou acompanhar a validação do token JWT. Esses detalhes ficam escondidos pela própria arquitetura do sistema.

### Escalabilidade

Uma possibilidade de crescimento seria executar várias instâncias do backend atrás de um load balancer. Como a sessão é mantida pelo token e não na memória do servidor, o backend pode funcionar de forma stateless. O banco e a autenticação ficam sob responsabilidade do Supabase, que oferece os recursos de escalabilidade do serviço.

### Falhas

Se o backend ficar indisponível, o frontend não conseguirá acessar a API no modo de produção. Ainda assim, o modo mock pode continuar funcionando com os dados salvos no `localStorage`. Se o Supabase parar, o login e o acesso às tarefas também ficarão indisponíveis. Atualmente, essa é uma dependência central do sistema e não existe uma redundância própria para esse serviço.

## 9. Como executar

### Backend

Na pasta `server`, instale as dependências e configure as variáveis do Supabase:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

Na pasta `client`, configure a URL da API e execute:

```bash
npm install
npm run dev
```

Com o modo mock ativado, o frontend pode ser executado sem configurar o backend. Para usar o Supabase, é necessário criar o banco a partir do arquivo `schema.sql` e preencher as variáveis de ambiente indicadas na documentação.

## 10. Considerações finais

O projeto atende às funções básicas de um gerenciador de tarefas e separa a interface, a API e o banco de dados em partes independentes. A criação do modo mock facilitou os testes da interface, enquanto os testes do backend ajudaram a verificar as regras de autenticação e de acesso aos dados.

Como melhorias futuras, seria possível adicionar recuperação de senha, paginação, categorias e testes de interface. Também seria importante configurar o deploy e revisar as medidas de segurança antes de disponibilizar o sistema em produção.
