<?php
require_once __DIR__ . '/../vendor/autoload.php';
$em = require __DIR__ . '/../cli-config.php';
$conn = $em->getConnection();

try {
    $conn->executeStatement("
        CREATE TABLE IF NOT EXISTS organizations (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            logo_url VARCHAR(255) DEFAULT NULL,
            website_url VARCHAR(255) DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
    ");

    $conn->executeStatement("
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT NOT NULL,
            title VARCHAR(255) NOT NULL,
            summary LONGTEXT NOT NULL,
            content LONGTEXT NOT NULL,
            thumbnail_url VARCHAR(255) DEFAULT NULL,
            author VARCHAR(100) NOT NULL,
            tags VARCHAR(255) DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
    ");
    
    // Seed some data
    $countOrg = $conn->executeQuery("SELECT COUNT(*) FROM organizations")->fetchOne();
    if ($countOrg == 0) {
        $conn->executeStatement("INSERT INTO organizations (name, description, logo_url, website_url) VALUES 
            ('TechCorp', 'Công ty công nghệ hàng đầu', 'https://ui-avatars.com/api/?name=TC&background=random', 'https://techcorp.com'),
            ('DevCommunity', 'Cộng đồng lập trình viên Việt Nam', 'https://ui-avatars.com/api/?name=DC&background=random', 'https://devcommunity.vn')
        ");
    }

    $countBlog = $conn->executeQuery("SELECT COUNT(*) FROM blog_posts")->fetchOne();
    if ($countBlog == 0) {
        $conn->executeStatement("INSERT INTO blog_posts (title, summary, content, thumbnail_url, author, tags) VALUES 
            ('Làm gì sau một cuộc thi Hackathon', 'Cách biến ý tưởng thành kết quả thực tế sau cuộc thi.', 'Nội dung chi tiết bài viết...', 'https://ui-avatars.com/api/?name=Blog+1&background=random', 'TAIKAI Team', 'for builders, ai & automation'),
            ('Giới thiệu Hackathon Management System', 'Nền tảng giúp bạn quản lý cuộc thi dễ dàng hơn.', 'Nội dung chi tiết bài viết 2...', 'https://ui-avatars.com/api/?name=Blog+2&background=random', 'Admin', 'product & partners')
        ");
    }

    echo json_encode(["status" => "success", "message" => "Tables created and seeded."]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
