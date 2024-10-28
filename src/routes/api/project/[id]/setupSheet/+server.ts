import prisma from '$prisma';
import { json } from '@sveltejs/kit';

export async function POST({ params, request }) {
  const body = (await request.json()) as {
    name: string;
    fileName: string;
    content: string;
  };
  const setupSheet = await prisma.setupSheet.create({
    data: {
      projectId: params.id,
      name: body.name,
      fileName: body.fileName,
      content: body.content,
    },
  });
  return json({ success: true, id: setupSheet.id });
}
