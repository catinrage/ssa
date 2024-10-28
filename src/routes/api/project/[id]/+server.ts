import prisma from '$prisma';
import { json } from '@sveltejs/kit';

export async function PATCH({ params, request }) {
  const { name, description, scale } = (await request.json()) as {
    name?: string;
    description?: string;
    scale?: number;
  };
  await prisma.project.update({
    where: {
      id: params.id,
    },
    data: {
      name,
      description,
      scale,
    },
  });
  return json({ success: true });
}

export async function DELETE({ params }) {
  await prisma.project.delete({
    where: {
      id: params.id,
    },
  });
  return json({ success: true });
}
