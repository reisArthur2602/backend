import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    await prisma.menu.createMany({
        data: [
            {
                name: "alergologia",
                keywords: ["alergologia"],
                message: `O valor da consulta da especialidade de *alergologia* custa *R$ 150,00*, para pagamentos no dinheiro ou pix.

✨ Possuímos condições especiais para *Clientes Flex*.

➡️ Flex Família: *R$ 75,00*
➡️ Flex Multi: *R$ 30,00*

🗓️ Nosso atendimento para essa especialidade ocorre às *sextas-feiras*, no período da tarde.

*Digite 1 para verificar a disponibilidade?*`,
            },
            {
                name: "angiologia",
                keywords: ["angiologia"],
                message: `O valor da consulta da especialidade de *angiologia* custa *R$ 150,00*, para pagamentos no dinheiro ou pix.

✨ Possuímos condições especiais para *Clientes Flex*.

➡️ Flex Família: *R$ 75,00*
➡️ Flex Multi: *R$ 30,00*

🗓️ Nosso atendimento para essa especialidade ocorre às segundas-feiras, nos períodos da manhã e tarde.

💉 Caso deseje realizar aplicações para varizes, elas são feitas somente no período da manhã.

*Digite 1 para verificar a disponibilidade?`,
            },
            {
                name: "cardiologia",
                keywords: ["cardiologia"],
                message: `O valor da consulta da especialidade de *cardiologia* custa *R$ 130,00*, para pagamentos no dinheiro ou pix.

✨ Possuímos condições especiais para *Clientes Flex*.

➡️ Flex Família: *R$ 65,00*
➡️ Flex Multi: *R$ 26,00*

🗓️ Nosso atendimento para essa especialidade ocorre às *quintas e sextas-feiras*, no período da manhã, e às *terças-feiras*, nos períodos da manhã e da tarde.

*Digite 1 para verificar a disponibilidade?`,
            },
            // ... repete para todas as outras especialidades
            {
                name: "psiquiatria",
                keywords: ["psiquiatria"],
                message: `O valor da consulta da especialidade de *psiquiatria* custa *R$ 180,00*, para pagamentos no dinheiro ou pix.

✨ Possuímos condições especiais para *Clientes Flex*.

➡️ Flex Família: *R$ 90,00*
➡️ Flex Multi: *R$ 36,00*

🗓️ Nosso atendimento para essa especialidade ocorre às *terças-feiras*, no período da manhã.

*Digite 1 para verificar a disponibilidade?`,
            },
            {
                name: "avaliacao_neuropsicologica",
                keywords: ["avaliacao neuropsicologica"],
                message: `A sessão individual da *Avaliação Neuropsicológica* custa *R$ 150,00*, para pagamentos no dinheiro ou pix.

📦 *Pacote completo (avaliação + laudo)*:
- *À vista:* R$ 1.050,00
- *Parcelado em até 6x sem juros:* R$ 1.260,00

🧠 As sessões são realizadas no *Núcleo de Terapias do Centro Clínico Master*, localizado na Rua Laureano Rosa, 100 – Alcântara (ao lado da Drogaria Master).

*Digite 1 para verificar a disponibilidade?`,
            },
            {
                name: "psicopedagogia",
                keywords: ["psicopedagogia"],
                message: `O valor da sessão individual para a especialidade de *psicopedagogia* custa *R$ 130,00*, para pagamentos no dinheiro ou pix.

✨ Possuímos condições especiais para *Clientes Flex*.

➡️ Flex Família: *R$ 65,00*
➡️ Flex Multi: *R$ 26,00*

🗓️ Nosso atendimento para essa especialidade ocorre às *segundas, terças e quintas-feiras*, nos períodos da manhã e da tarde.

*Digite 1 para verificar a disponibilidade?`,
            },
            {
                name: "terapia_cognitivo_comportamental",
                keywords: ["terapia cognitivo comportamental"],
                message: `O valor da sessão individual para a *terapia cognitivo-comportamental* custa *R$ 150,00*, para pagamentos no dinheiro ou pix.

✨ Possuímos condições especiais para *Clientes Flex*.

➡️ Flex Família: *R$ 110,00*
➡️ Flex Multi: *R$ 90,00*

🗓️ Nosso atendimento para essa especialidade ocorre às *segundas, terças e quintas-feiras*, nos períodos da manhã e da tarde.

*Digite 1 para verificar a disponibilidade?`,
            },
        ],
        skipDuplicates: true,
    });
}
main()
    .then(() => console.log("✅ Seed finalizado"))
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map