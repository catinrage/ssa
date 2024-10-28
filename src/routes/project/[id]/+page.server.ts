import prisma from '$prisma';
import { updateGroupSchema } from '$lib/schemas/group/update.js';
import { registerToolSchema } from '$lib/schemas/tool/register.js';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export async function load({ params }) {
  const { id } = params;
  const project = await prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      setupSheets: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      groups: {
        include: {
          tools: true,
          durability: true,
        },
      },
    },
  });
  return {
    project,
  };
}

export const actions = {
  registerTool: async (event) => {
    const form = await superValidate(event, zod(registerToolSchema));

    if (!form.valid) return fail(400, { form });
    try {
      await prisma.tool.upsert({
        where: {
          name: form.data.name,
        },
        create: {
          name: form.data.name,
          diameter: form.data.diameter,
          price: form.data.price,
          durability: {
            create: {
              ...form.data.durability,
            },
          },
        },
        update: {
          diameter: form.data.diameter,
          price: form.data.price,
          durability: {
            update: {
              ...form.data.durability,
            },
          },
        },
      });

      return {
        form,
      };
    } catch (error) {
      return fail(500, {
        message: 'خطایی در ثبت رخ داد',
        form,
      });
    }
  },
  updateGroup: async (event) => {
    const form = await superValidate(event, zod(updateGroupSchema));
    if (!form.valid) return fail(400, { form });
    try {
      await prisma.group.update({
        where: {
          id: form.data.id,
        },
        data: {
          price: form.data.price,
          durability: {
            update: {
              ...form.data.durability,
            },
          },
        },
      });
      return {
        form,
      };
    } catch {
      return fail(500, {
        message: 'خطایی در ثبت رخ داد',
        form,
      });
    }
  },
};
