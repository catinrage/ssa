#!/bin/sh

# Run Prisma migrations
echo "Running Prisma migrations..."
bun prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
bun prisma generate

# Seed the database
echo "Seeding the database..."
bun prisma db seed

# Indicate that Prisma setup is complete
echo "Prisma setup complete."
