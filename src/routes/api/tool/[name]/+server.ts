import prisma from '$prisma';
import { json } from '@sveltejs/kit';

export async function GET({ url, params }) {
  const toolName = params.name;
  const tool = await prisma.tool.findUnique({
    where: {
      name: toolName,
    },
    include: {
      durability: true,
    },
  });

  return json(tool);
}
