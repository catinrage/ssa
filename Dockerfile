# syntax=docker/dockerfile:1

################################################################################
# Use Bun & Node image as the base image for all stages.
FROM imbios/bun-node:22-slim AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app

################################################################################
# Create a stage for installing all dependencies (prod and dev).
FROM base AS deps

# Copy package.json and bun.lockb to the container.
COPY package.json . 
COPY bun.lockb . 

# Install dependencies using Bun's built-in package manager.
RUN bun install --frozen-lockfile

################################################################################
# Create a stage for building the application.
FROM deps AS build

# Copy the rest of the source files into the image.
COPY . .

# Generate the Prisma client before running the build.
RUN bun prisma generate --no-engine

# Run the build script.
RUN bun run build

################################################################################
# Create the final runtime image.
FROM base AS final

# Use production environment by default.
ENV NODE_ENV=production

# Copy package.json and bun.lockb for reference.
COPY package.json . 
COPY bun.lockb . 

# Copy prisma folder.
COPY prisma ./prisma

# Copy all dependencies from the deps stage and built application from the build stage.
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build

# Make the prisma database deploy script executable.
RUN chmod +x /usr/src/app/prisma/deploy.sh

# Expose the port that the application listens on.
EXPOSE 3000

# Migrate the database, seed the database, and start the application.
CMD ["/bin/sh", "-c", "/usr/src/app/prisma/deploy.sh && bun start"]
