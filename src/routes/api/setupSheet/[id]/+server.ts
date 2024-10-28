import prisma from '$prisma';
import { json } from '@sveltejs/kit';

export async function PATCH({ params, request }) {
  const { ignored, scale } = (await request.json()) as {
    ignored?: boolean;
    scale?: number;
  };
  try {
    await prisma.setupSheet.update({
      where: {
        id: params.id,
      },
      data: {
        ignored,
        scale,
      },
    });
    return json({ success: true });
  } catch {
    return json({ success: false });
  }
}
export async function DELETE({ params }) {
  try {
    await prisma.setupSheet.delete({
      where: {
        id: params.id,
      },
    });
    return json({ success: true });
  } catch {
    return json({ success: false });
  }
}
