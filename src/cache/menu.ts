export const MENU = [
  {
    name: "Suporte Técnico",
    message: `📡 Bem-vindo ao suporte técnico! Escolha uma opção:\n 1️⃣ - Verificar Conexão\n 2️⃣ - Falar com atendente.`,
    keywords: ["suporte", "internet", "ajuda"],
    active: true,
    config: {
      id: "config-2",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      menu_id: "menu-2",
      timeStart: "08:00",
      timeEnd: "20:00",
      default_Message_Out_Of_Time:
        "⏰ Nosso suporte funciona das 08h às 20h. Tente novamente nesse horário.",
      default_Message_Out_Of_Date:
        "⚠️ O suporte funciona apenas em dias úteis.",
    },
    options: [
      {
        id: "opt-1",
        label: "Verificar Conexão",
        trigger: 1,
        action: "AUTO_REPLY",
        reply_text:
          "🔍 Estamos verificando sua conexão. Aguarde alguns instantes...",
        menu_id: "menu-2",
      },

      {
        id: "opt-3",
        label: "Falar com Suporte Humano",
        trigger: 2,
        action: "REDIRECT_QUEUE",
        finish_text: "👨‍💻 Transferindo você para um atendente...",
        menu_id: "menu-2",
      },
    ],
  },
];
