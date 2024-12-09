# Use the official Apache image with PHP support (slim version)
FROM php:8.0-apache-slim

# Enable Apache's rewrite module
RUN a2enmod rewrite

# Remove default Apache content
RUN rm -rf /var/www/html/*

# Copy the static website files to Apache's root directory
COPY ./html /var/www/html

# Expose port 80
EXPOSE 80

# Start Apache when the container launches
CMD ["apache2-foreground"]
