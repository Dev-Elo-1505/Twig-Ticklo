### Multi-stage Dockerfile for Render
FROM composer:2 AS builder
WORKDIR /app

# Copy composer files and install dependencies
COPY composer.json composer.lock /app/
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-progress

# Copy app files
COPY . /app

# Runtime image
FROM php:8.2-cli
WORKDIR /app

# Copy application (including vendor) from builder
COPY --from=builder /app /app

ENV PORT=8080
EXPOSE 8080

# Start built-in PHP server binding to the Render provided $PORT
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public"]
