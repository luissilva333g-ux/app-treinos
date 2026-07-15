# 🏋️‍♂️ Registo de Treinos — App Mobile (Estilo Apple 2026)

Esta é uma **aplicação web mobile-first** de alta precisão desenhada especificamente para utilização no **iPhone 15 Pro** durante treinos de musculação, seguindo estritamente a **Especificação Funcional e Técnica**.

O design visual incorpora as tendências e diretrizes de interface **Apple 2026**:
- **Dark Mode Puro OLED (`#000000`)** com alto contraste e economia energética.
- **Glassmorphism / Superfícies Translucentes (`backdrop-blur-xl`)** com bordas ultra-suaves (`border-white/10`).
- **Pills e Botões em Cápsula (`rounded-full` / `rounded-2xl`)** com feedback tátil de clique (`active:scale-98`).
- **Cores Funcionais por Categoria**:
  - 🟢 **Esmeralda / Verde**: Ações de treino ativo, cronómetro, conclusão e sucesso.
  - 🔵 **Azul Ciano Apple**: Navegação principal, rotinas e ações primárias.
  - 🟡 **Âmbar / Dourado**: Melhor desempenho histórico e modo inspeção de Administrador.
  - 🔴 **Rosa / Vermelho**: Descarte de treinos ou eliminação permanente.

---

## 🚀 Como Executar Localmente

O projeto está totalmente configurado com **Vite + React 18 + TypeScript + Tailwind CSS** e possui um **Modo Híbrido Automático (Offline/Local ou Supabase Cloud)**.

### 1. Iniciar o Servidor de Desenvolvimento
No terminal, dentro da pasta `APP TREINOS`, execute:

```powershell
npm run dev
```

Abra o seu navegador no endereço indicado (por exemplo `http://localhost:5173`) ou teste diretamente no modo responsivo simulando o **iPhone 15 Pro (393px × 852px)**.

---

## 🔐 Credenciais e Utilizadores Disponíveis

Conforme os requisitos, a aplicação possui **apenas** os utilizadores reais do sistema e **nenhum dado fictício desnecessário**:

### 👑 Luís (Administrador Total)
- **Username:** `Admin`
- **Palavra-passe:** `Admin`
- **Funcionalidades Especiais:** 
  - Acesso à **Secção de Administração** no **Perfil**.
  - Capacidade de **Inspecionar/Consultar** as rotinas, biblioteca e histórico da **Sofia** (ou de qualquer outro utilizador criado) com 1 clique, **sem nunca misturar dados** com o seu histórico pessoal de administrador.

### 👤 Sofia Rodrigues (Utilizadora Normal)
- **Username:** `sofia`
- **Palavra-passe:** `sofia123`
- **Funcionalidades:** Acesso isolado aos seus treinos ativos, rotinas personalizadas e histórico privado.

---

## 📋 Resumo das Funcionalidades Implementadas

### 1️⃣ Autenticação e Segurança (RLS e Isolamento)
- Todos os acessos a rotinas, sessões, exercícios de treino e históricos são filtrados rigorosamente por `user_id`.
- Se o **Supabase** estiver configurado (através das variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env`), a aplicação comunica em tempo real com a cloud utilizando o `schema.sql` fornecido.
- Se o Supabase **não** estiver configurado (modo dev/local imediato), a aplicação recorre ao motor de persistência local `LocalStorageDB`, garantindo funcionamento **100% autônomo** e com **suporte a falhas de internet/offline**.

### 2️⃣ Treino Ativo e Autosave Obrigatório
- **Autosave Instantâneo:** Sempre que uma série é adicionada, um peso alterado ou o visto `✓` tocado, o estado do treino é gravado imediatamente e a barra inferior exibe o indicador dinâmico `• a guardar... -> • guardado`.
- **Recuperação Automática:** Se o Safari/Chrome no telemóvel for fechado ou recarregado acidentalmente, ao reabrir a app, a sessão em curso e todas as séries são **restauradas exatamente no ponto onde ficaram**.
- **Cronómetro Real (`started_at`):** O tempo de treino é calculado pela diferença entre o momento em que a sessão começou e a hora atual (`nowMs - startMs`), garantindo exatidão total ao segundo, mesmo com o ecrã bloqueado.

### 3️⃣ Biblioteca Global vs. Histórico Pessoal
- **Biblioteca Partilhada:** Os modelos de exercício (ex: *Supino com barra*, *Leg Press 45º*) são globais. Quando qualquer utilizador cria um novo exercício na biblioteca ou durante o treino, este passa a estar disponível no catálogo global sem duplicados.
- **Histórico Estritamente Privado:** Cada vez que abre *O meu histórico* de um exercício, apenas o registo cronológico das sessões e o **Melhor Desempenho** da sua própria conta são exibidos.
- **Preenchimento Automático Inteligente:** Ao adicionar um exercício ao treino, as séries e pesos iniciais são pré-preenchidos automaticamente com os valores do seu **melhor desempenho histórico anterior** para maximizar o fluxo durante o treino.

### 4️⃣ Criação de Rotinas Pós-Treino
- No final do treino, ao clicar em **Terminar Treino -> Guardar Treino**, a aplicação oferece o prompt opcional: **"Guardar como Rotina?"**, permitindo transformar imediatamente a sessão concluída num novo modelo para treinos futuros.

---

## 📁 Estrutura de Diretórios

```text
APP TREINOS/
├── schema.sql                     # Schema SQL integral compatível com Supabase & RLS
├── index.html                     # Otimizado para PWA Apple iPhone 15 Pro
├── package.json
├── src/
│   ├── types/index.ts             # Interfaces rigorosas de dados (Profile, Exercise, Routine, etc.)
│   ├── lib/
│   │   ├── supabase.ts            # Cliente Supabase e deteção de configuração
│   │   └── db.ts                  # Camada universal de acesso a dados (Supabase / LocalStorage offline)
│   ├── context/
│   │   ├── AuthContext.tsx        # Autenticação, gestão de sessão e modo inspeção de Admin
│   │   └── WorkoutContext.tsx     # Treino em curso, cronómetro real e autosave em 2 fases
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Cabeçalho Apple com indicador de modo inspeção
│   │   │   └── BottomNav.tsx      # Barra de navegação com banner flutuante de treino em curso
│   │   ├── auth/
│   │   │   └── LoginPage.tsx      # Ecrã de login OLED Apple 2026
│   │   ├── home/
│   │   │   └── HomePage.tsx       # Início com destaque imediato para o treino em curso e rotinas
│   │   ├── workout/
│   │   │   ├── ActiveWorkoutPage.tsx    # Ecrã de sessão ativa otimizado para toque no ginásio
│   │   │   ├── ExerciseSelectorModal.tsx # Catálogo global com pesquisa ao vivo e criação imediata
│   │   │   └── FinishWorkoutModal.tsx    # Resumo final e conversão de treino em rotina
│   │   ├── routines/
│   │   │   ├── RoutinesPage.tsx         # Gestão completa de rotinas
│   │   │   └── RoutineEditorModal.tsx   # Criar/editar rotinas e reordenar exercícios
│   │   ├── exercises/
│   │   │   ├── ExercisesPage.tsx        # Biblioteca global partilhada
│   │   │   └── ExerciseHistoryModal.tsx # Histórico pessoal cronológico e melhor desempenho
│   │   ├── history/
│   │   │   ├── HistoryPage.tsx          # Histórico de todas as sessões concluídas
│   │   │   └── WorkoutDetailModal.tsx   # Detalhe read-only das séries realizadas em cada data
│   │   └── profile/
│   │       └── ProfilePage.tsx          # Dados pessoais e secção de Administração do Luís
│   ├── App.tsx                    # Contentor iPhone 15 Pro e router de separadores
│   ├── main.tsx
│   └── index.css                  # Design system Apple 2026 (tokens CSS, utilitários de vidro)
```
