# Use the official Nginx lightweight image
FROM nginx:alpine

# Remove the default Nginx site configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the complete Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for Nginx temp files and set ownership
RUN mkdir -p /tmp/nginx && \
    chown -R 100:1000 /tmp/nginx

# Copy the static website files to Nginx's root directory
COPY html /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
