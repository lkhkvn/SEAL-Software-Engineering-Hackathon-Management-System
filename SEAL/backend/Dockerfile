FROM php:8.2-apache

# 1. Cài đặt các công cụ hệ thống và Extension pdo_mysql để kết nối SQL
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql

# 2. Cài đặt Composer vào trong container (Dùng để chạy autoload tầng DTO, Service)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Kích hoạt mod_rewrite của Apache để xử lý file .htaccess (URL Rewrite)
RUN a2enmod rewrite

# 4. Sửa đổi cấu hình Apache để cho phép file .htaccess ghi đè (AllowOverride All)
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# 5. Đổi thư mục gốc (DocumentRoot) của Apache trỏ thẳng vào thư mục public/ để bảo mật
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# 6. Thiết lập thư mục làm việc mặc định
WORKDIR /var/www/html

# 7. Cài Composer dependencies ngay trong image (tránh lỗi symlink Windows)
# Copy composer files trước để tận dụng Docker layer cache
COPY composer.json composer.lock* ./
RUN composer install --no-interaction --no-scripts --prefer-dist

# 8. Cấp quyền sở hữu thư mục cho user www-data của Apache
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80