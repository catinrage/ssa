import prisma from '$prisma';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const body = (await request.json()) as {
    name: string;
  };
  await prisma.project.create({
    data: {
      name: body.name,
      description: '',
    },
  });
  return json({ success: true });
}
