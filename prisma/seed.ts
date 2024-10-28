import prisma from './client';
import { DATA } from './data';

async function main() {
  for (const toolName in DATA) {
    await prisma.tool.upsert({
      where: {
        name: toolName,
      },
      update: {
        name: toolName,
        diameter: DATA[toolName].diameter,
        durability: {
          create: {
            rough: DATA[toolName].durability.ROUGH,
            drilling: DATA[toolName].durability.DRILLING,
            faceMilling: DATA[toolName].durability.FACE_MILLING,
            semiFinish: DATA[toolName].durability.SEMI_FINISH,
            finish: DATA[toolName].durability.FINISH,
          },
        },
        price: DATA[toolName].price,
      },
      create: {
        name: toolName,
        diameter: DATA[toolName].diameter,
        durability: {
          create: {
            rough: DATA[toolName].durability.ROUGH,
            drilling: DATA[toolName].durability.DRILLING,
            faceMilling: DATA[toolName].durability.FACE_MILLING,
            semiFinish: DATA[toolName].durability.SEMI_FINISH,
            finish: DATA[toolName].durability.FINISH,
          },
        },
        price: DATA[toolName].price,
      },
    });
  }
}
await main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
