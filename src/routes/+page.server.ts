import prisma from '$prisma';

export async function load() {
  const projects = await prisma.project.findMany({
    include: {
      setupSheets: true,
    },
  });
  return {
    projects,
  };
}
