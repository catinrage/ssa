import prisma from '$prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const body = (await request.json()) as {
    projectId: string;
    name: string;
    tools: string[];
  };

  const firstTool = await prisma.tool.findFirstOrThrow({
    where: {
      name: body.tools[0],
    },
    include: {
      durability: true,
    },
  });

  await prisma.group.create({
    data: {
      name: body.name,
      diameter: firstTool.diameter,
      price: firstTool.price,
      durability: {
        create: {
          rough: firstTool.durability?.rough,
          drilling: firstTool.durability?.drilling,
          faceMilling: firstTool.durability?.faceMilling,
          semiFinish: firstTool.durability?.semiFinish,
          finish: firstTool.durability?.finish,
        },
      },
      tools: {
        connect: body.tools.map((name) => ({
          name,
        })),
      },
      project: {
        connect: {
          id: body.projectId,
        },
      },
    },
  });
  return json({ success: true });
}
