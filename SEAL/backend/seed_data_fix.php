<?php
require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\ORMSetup;

$config = ORMSetup::createAttributeMetadataConfiguration(
    paths: [__DIR__ . '/src/Infrastructure/Model'], 
    isDevMode: true
);

$connectionParams = [
    'dbname'   => 'CleanDb',
    'user'     => 'clean_user',
    'password' => 'user_secret_password',
    'host'     => 'db', // Dùng tên container db
    'port'     => 3306, 
    'driver'   => 'pdo_mysql',
    'charset'  => 'utf8mb4',
];

$connection = DriverManager::getConnection($connectionParams, $config);

// Truncate bảng
$connection->executeStatement("SET FOREIGN_KEY_CHECKS = 0;");
$connection->executeStatement("TRUNCATE TABLE organizations;");
$connection->executeStatement("TRUNCATE TABLE blog_posts;");
$connection->executeStatement("SET FOREIGN_KEY_CHECKS = 1;");

$orgs = [
    ['Google Vietnam', 'Tập đoàn công nghệ đa quốc gia của Mỹ, chuyên về các dịch vụ và sản phẩm liên quan đến Internet.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png', 'https://google.com'],
    ['FPT Software', 'Công ty công nghệ hàng đầu Việt Nam, chuyên cung cấp các dịch vụ gia công phần mềm.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/256px-FPT_logo_2010.svg.png', 'https://fpt-software.com'],
    ['VNG Corporation', 'Kỳ lân công nghệ đầu tiên của Việt Nam với các sản phẩm như Zalo, Zing MP3.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/VNG_Corporation_logo.svg/256px-VNG_Corporation_logo.svg.png', 'https://vng.com.vn'],
    ['Shopee Engineering', 'Đội ngũ kỹ sư công nghệ đứng sau nền tảng thương mại điện tử lớn nhất Đông Nam Á.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/256px-Shopee.svg.png', 'https://shopee.sg'],
    ['MoMo', 'Siêu ứng dụng thanh toán số 1 tại Việt Nam, liên tục tổ chức các cuộc thi công nghệ.', 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/fe/MoMo_Logo.png/256px-MoMo_Logo.png', 'https://momo.vn']
];

foreach ($orgs as $org) {
    // Wikipedia links are failing, let's use UI-Avatars or simpler image links
    $logo = "https://ui-avatars.com/api/?name=" . urlencode($org[0]) . "&background=random&size=256";
    // For Google Vietnam, keep the working logo
    if ($org[0] === 'Google Vietnam') {
        $logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png';
    }
    
    $connection->executeStatement(
        "INSERT INTO organizations (name, description, logo_url, website_url) VALUES (?, ?, ?, ?)",
        [$org[0], $org[1], $logo, $org[3]]
    );
}

$blogs = [
    ['Bí quyết tối ưu hóa hiệu suất React App', 'Tìm hiểu cách sử dụng useMemo, useCallback và React.memo để cải thiện tốc độ ứng dụng của bạn.', '<p>Bài viết này hướng dẫn chi tiết cách tối ưu hiệu suất...</p>', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop', 'Trần Hữu Nam', 'React,Frontend,Performance'],
    ['Tổng hợp 10 API hữu ích cho dự án Hackathon', 'Khám phá danh sách các API miễn phí giúp bạn hoàn thành sản phẩm nhanh chóng trong 48 giờ.', '<p>Trong các kỳ Hackathon, việc tích hợp API có sẵn là cực kỳ quan trọng...</p>', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=600&auto=format&fit=crop', 'Lê Quỳnh', 'API,Tips,Hackathon'],
    ['Kiến trúc Microservices trong thực tế', 'Chia sẻ kinh nghiệm chuyển đổi từ Monolith sang Microservices với các case study thực tế.', '<p>Kiến trúc Microservices đang là xu hướng tất yếu...</p>', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop', 'Nguyễn Văn Đạt', 'Architecture,Backend,Microservices'],
    ['AI trong kỹ nghệ phần mềm', 'Trí tuệ nhân tạo đang thay đổi cách chúng ta viết code như thế nào?', '<p>Github Copilot và ChatGPT đã mở ra một kỷ nguyên mới...</p>', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&auto=format&fit=crop', 'Hứa Văn Cường', 'AI,Software Engineering,Future'],
    ['Làm thế nào để Pitching ý tưởng thành công?', 'Kỹ năng thuyết trình (pitching) quyết định 50% khả năng chiến thắng của đội bạn.', '<p>Đừng chỉ tập trung vào code, hãy học cách trình bày ý tưởng...</p>', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=600&auto=format&fit=crop', 'Phạm Minh', 'Soft Skills,Pitching,Hackathon']
];

foreach ($blogs as $blog) {
    $connection->executeStatement(
        "INSERT INTO blog_posts (title, summary, content, thumbnail_url, author, tags) VALUES (?, ?, ?, ?, ?, ?)",
        $blog
    );
}

echo "Successfully seeded mock data via PHP with utf8mb4.";
