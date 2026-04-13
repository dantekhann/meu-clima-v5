ClimaHub v5: Dashboard Multi-Localidade & Inteligência Geográfica

O ClimaHub (evolução do Meu Clima) é uma aplicação front-end de monitoramento meteorológico em tempo real. A versão 5 marca a transição de uma ferramenta de busca simples para um painel de comparação persistente, capaz de gerenciar múltiplas localidades simultaneamente com tratamento avançado de dados geográficos.

🚀 O que há de novo na v5?
Diferente das versões anteriores que exibiam apenas um resultado por vez, a v5 foi reconstruída para ser um Hub.

1. Sistema de Comparação e Grid Dinâmico
   Multi-Cards: Agora é possível adicionar várias cidades ao mesmo tempo, permitindo a comparação direta de temperaturas e condições entre diferentes regiões.

Gerenciamento de Cards: Cada card possui independência, com a função de remoção individual (botão ✕) que atualiza o layout e a memória instantaneamente.

2. Memória Inteligente (Cache de 1 Hora)
   Persistência com LocalStorage: As cidades adicionadas não somem ao atualizar a página (F5). Elas ficam salvas no navegador do usuário.

Auto-Faxina (TTL - Time to Live): Implementamos uma lógica de expiração. Se uma cidade foi adicionada há mais de 1 hora, o sistema a remove automaticamente do cache no próximo carregamento para garantir que o painel permaneça limpo e relevante.

3. Resolução de Ambiguidades (Homônimos)
   Seleção de Localidade: Ao buscar cidades com nomes comuns (ex: Rio de Janeiro), o sistema agora apresenta uma lista de escolha detalhando Estado/Província e País, evitando que o usuário visualize os dados do local errado.

4. Robustez Visual e UX
   Tratamento de Nomes Gigantes: Implementação de word-wrap e limite de linhas (line-clamp) para nomes de cidades extremamente longos, garantindo que o design nunca quebre.

Identificação Global: Cada card agora exibe a hierarquia geográfica completa: Cidade, Estado e País.

Modo Dia/Noite: Detecção automática via parâmetro is_day da API para exibição de ícones contextuais (☀️/🌙).

🧠 Lógica Técnica
Sanitização de Input: Uso de Regex avançado para ignorar emojis e caracteres especiais, evitando erros de requisição na API.

Arquitetura de Dados: O sistema salva apenas as coordenadas e nomes (metadados). A temperatura é sempre buscada do zero ao carregar o card, garantindo precisão absoluta.

Design: Estética Glassmorphism sobre fundo escuro (#0b0b0c) para reduzir a fadiga visual.

📂 Estrutura do Projeto
index.html: Dashboard com containers separados para notificações de busca e grid de exibição.

style.css: Grid flexível, tratamento de overflow de texto e estilização de cards responsivos.

script.js: Engine principal gerenciando Fetch API (Open-Meteo), LocalStorage e lógica de expiração por timestamp.

🔧 Como utilizar
Busque por uma cidade no campo de pesquisa.

Se houver mais de um resultado, selecione o correto na lista exibida.

O card será fixado no painel. Você pode adicionar quantos desejar.

Para limpar tudo, utilize o botão "Limpar Histórico" que surge ao final do grid.

👤 Desenvolvedor: Paulo Dante Coelho Neto

GitHub: dantekhann
