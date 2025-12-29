# AgencyFlow CRM

## 1. Stack Tecnológica Sugerida (Resposta à Solicitação)

Para criar essa ferramenta de forma rápida, escalável e com excelente UX, a stack recomendada é:

*   **Frontend:** React (Vite) com TypeScript.
    *   *Por que?* O ecossistema de componentes é vasto. Permite criar interfaces interativas (como o card de WhatsApp) muito mais facilmente que ferramentas Low-Code puras. TypeScript garante que o sistema não quebre à medida que cresce.
*   **Estilização:** Tailwind CSS.
    *   *Por que?* Desenvolvimento extremamente rápido, responsivo e bonito por padrão.
*   **Backend (Futuro):** Firebase ou Supabase.
    *   *Por que?* Para um MVP, ambos oferecem Banco de Dados, Autenticação e Funções Serverless com custo zero inicial. O código atual simula isso usando `localStorage`, mas a estrutura de `services/mockDb.ts` foi feita para ser facilmente substituída por chamadas ao Supabase.
*   **Gráficos:** Recharts.
    *   *Por que?* Biblioteca padrão de mercado para React, leve e bonita.

## 2. Funcionalidades Implementadas

1.  **Dashboard Geral:** Visão macro para o dono da agência.
2.  **Controle de Acesso (Simulado):**
    *   Troque de usuário no canto inferior esquerdo da Sidebar.
    *   **Admin:** Vê tudo.
    *   **Gestor:** Só pode editar campos técnicos (Gasto, Leads, etc).
    *   **CS:** Só pode editar campos comerciais (Vendas, Feedback).
3.  **Card WhatsApp:**
    *   Ao entrar no detalhe de um cliente, o sistema gera automaticamente um card visual com as métricas da última semana, pronto para ser printado e enviado.
4.  **Cálculo Automático de CPL:**
    *   O sistema calcula `Gasto / Leads` em tempo real.

## Como Rodar

1.  Instale as dependências (se fosse um projeto Node real): `npm install react react-dom lucide-react recharts`
2.  O código fornecido neste prompt é auto-contido e funciona em ambientes de playground React modernos.