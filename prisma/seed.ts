import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// <<< ajuste estes números para os JIDs reais do seu time >>>
const FORWARD_COMMERCIAL = "5581999990000@s.whatsapp.net";
const FORWARD_SUPPORT    = "5581988880000@s.whatsapp.net";

async function upsertUser() {
  // Usuário admin inicial (ajuste a senha conforme sua estratégia de hash)
  await prisma.user.upsert({
    where: { email: "admin@master.com" },
    update: {},
    create: {
      email: "admin@master.com",
      password: "admin123", // em produção, usar senha já com hash!
      name: "Administrador",
    },
  });
}

type OptionInput = {
  label: string;
  trigger: number;
  action: "auto_reply" | "redirect_queue" | "forward";
  reply_text?: string | null;
  finish_text?: string | null;
  forward_to?: string | null;
};

async function upsertMenuWithOptions(args: {
  name: string;
  message: string;
  keywords: string[];
  options: OptionInput[];
}) {
  const { name, message, keywords, options } = args;

  // Sobe/atualiza o MENU (por nome, que é único)
  const menu = await prisma.menu.upsert({
    where: { name },
    update: {
      message,
      keywords,
      active: true,
    },
    create: {
      name,
      message,
      keywords,
      active: true,
    },
    select: { id: true },
  });

  // Mantém o seed idempotente: zera as opções desse menu e recria
  await prisma.menuOption.deleteMany({ where: { menu_id: menu.id } });

  // Cria todas as opções
  if (options.length > 0) {
    await prisma.menuOption.createMany({
      data: options.map((opt) => ({
        menu_id: menu.id,
        label: opt.label,
        trigger: opt.trigger,
        action: opt.action,
        reply_text: opt.reply_text ?? null,
        finish_text: opt.finish_text ?? null,
        forward_to: opt.forward_to ?? null,
      })),
      skipDuplicates: true,
    });
  }
}

async function main() {
  // 1) Usuário admin
  await upsertUser();

  // 2) MENU com AUTO_REPLY
  await upsertMenuWithOptions({
    name: "Informações Rápidas",
    message:
      "📋 *Informações Rápidas*\n" +
      "1) Endereço\n" +
      "2) Horários de atendimento\n" +
      "3) Site oficial\n\n" +
      "Digite o número da opção.",
    keywords: ["oi", "olá", "informacao", "informações", "menu", "info", "start", "iniciar"],
    options: [
      {
        label: "Endereço",
        trigger: 1,
        action: "auto_reply",
        reply_text:
          "🏥 *Endereço*: Rua das Flores, 123 - Centro, Sua Cidade/UF\nUse 'menu' para voltar.",
      },
      {
        label: "Horários",
        trigger: 2,
        action: "auto_reply",
        reply_text:
          "🕐 *Horários*: Seg-Sex 08:00–18:00, Sáb 08:00–12:00\nUse 'menu' para voltar.",
      },
      {
        label: "Site",
        trigger: 3,
        action: "auto_reply",
        reply_text:
          "🌐 *Site*: https://www.seusite.com.br\nUse 'menu' para voltar.",
      },
    ],
  });

  // 3) MENU com REDIRECT_QUEUE
  await upsertMenuWithOptions({
    name: "Atendimento Humano",
    message:
      "🙋 *Atendimento Humano*\n" +
      "1) Entrar na fila de atendimento\n\n" +
      "Digite 1 para entrar na fila.",
    keywords: ["atendente", "humano", "fila", "atendimento", "falar com atendente"],
    options: [
      {
        label: "Entrar na fila",
        trigger: 1,
        action: "redirect_queue",
        // reply_text opcional aqui; teu fluxo já envia a mensagem padrão de fila
      },
    ],
  });

  // 4) MENU com FORWARD (encaminha a PRÓXIMA mensagem para um destino)
  await upsertMenuWithOptions({
    name: "Triagem / Encaminhamento",
    message:
      "📤 *Triagem / Encaminhamento*\n" +
      "1) Comercial\n" +
      "2) Suporte Técnico\n\n" +
      "Escolha o setor digitando o número e *depois* envie sua mensagem.",
    keywords: ["vendas", "comercial", "suporte", "tecnico", "técnico", "encaminhar", "transferir"],
    options: [
      {
        label: "Comercial",
        trigger: 1,
        action: "forward",
        reply_text: "✍️ Escreva sua mensagem para o *Comercial* e enviarei para o setor.",
        finish_text:
          "✅ Mensagem encaminhada ao *Comercial*. Aguarde nosso retorno.",
        forward_to: FORWARD_COMMERCIAL,
      },
      {
        label: "Suporte Técnico",
        trigger: 2,
        action: "forward",
        reply_text:
          "✍️ Escreva sua mensagem para o *Suporte Técnico* e enviarei para o setor.",
        finish_text:
          "✅ Mensagem encaminhada ao *Suporte Técnico*. Aguarde nosso retorno.",
        forward_to: FORWARD_SUPPORT,
      },
    ],
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Seed com erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
