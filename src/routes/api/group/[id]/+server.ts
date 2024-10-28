import prisma from '$prisma';
import { json } from '@sveltejs/kit';

export async function GET({ url, params }) {
  const tool = await prisma.group.findUnique({
    where: {
      id: params.id,
    },
    include: {
      durability: true,
    },
  });

  return json(tool);
}

export async function DELETE({ params }) {
  try {
    await prisma.group.delete({
      where: {
        id: params.id,
      },
    });
    return json({ success: true });
  } catch (error) {
    return json({ error: 'Group not found or could not be deleted' }, { status: 404 });
  }
}
