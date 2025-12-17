#!/bin/sh

# Run Prisma migrations
echo "Running Prisma migrations..."
bun prisma migrate deploy

# Seed the database
echo "Seeding the database..."
bun prisma db seed

# Indicate that Prisma setup is complete
echo "Prisma setup complete."
