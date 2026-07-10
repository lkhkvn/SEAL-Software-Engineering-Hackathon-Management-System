-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: CleanDb
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `summary` longtext NOT NULL,
  `content` longtext NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `author` varchar(100) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` VALUES (1,'Làm gì sau một cuộc thi Hackathon','Cách biến ý tưởng thành kết quả thực tế sau cuộc thi.','Nội dung chi tiết bài viết...','https://ui-avatars.com/api/?name=Blog+1&background=random','TAIKAI Team','for builders, ai & automation','2026-07-03 10:54:53'),(2,'Giới thiệu Hackathon Management System','Nền tảng giúp bạn quản lý cuộc thi dễ dàng hơn.','Nội dung chi tiết bài viết 2...','https://ui-avatars.com/api/?name=Blog+2&background=random','Admin','product & partners','2026-07-03 10:54:53');
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configurations`
--

DROP TABLE IF EXISTS `configurations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configurations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) NOT NULL,
  `config_value` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_31C6AD995D1CAA6` (`config_key`),
  KEY `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configurations`
--

LOCK TABLES `configurations` WRITE;
/*!40000 ALTER TABLE `configurations` DISABLE KEYS */;
/*!40000 ALTER TABLE `configurations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contest_problems`
--

DROP TABLE IF EXISTS `contest_problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contest_problems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contest_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `resources` longtext COLLATE utf8mb4_unicode_ci,
  `constraints` longtext COLLATE utf8mb4_unicode_ci,
  `criteria_json` longtext COLLATE utf8mb4_unicode_ci,
  `released_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submission_deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest_problems`
--

LOCK TABLES `contest_problems` WRITE;
/*!40000 ALTER TABLE `contest_problems` DISABLE KEYS */;
INSERT INTO `contest_problems` VALUES (1,9,'Hệ thông y tế chăm sóc sức khẻo','Thí sinh cần thiết kế và phát triển một Hệ thống Web Chăm sóc Sức khỏe (Healthcare Web System) thông minh, giải quyết được ít nhất một hoặc kết hợp các bài toán cốt lõi sau:\n\nQuản lý & Theo dõi: Giúp người dùng theo dõi chỉ số sức khỏe cá nhân (nhịp tim, cân nặng, giấc ngủ, lịch sử bệnh lý) bằng biểu đồ trực quan.\n\nKết nối y tế: Hệ thống đặt lịch khám bệnh trực tuyến, tư vấn từ xa (Telehealth) giữa bác sĩ và bệnh nhân.\n\nỨng dụng AI/Thông minh (Khuyến khích): Tích hợp chatbot AI hỗ trợ sàng lọc triệu chứng ban đầu, gợi ý thực đơn dinh dưỡng hoặc nhắc nhở uống thuốc tự động.','https://www.google.com/search?q=w3schools&oq=w3&gs_lcrp=EgZjaHJvbWUqCggBEAAYsQMYgAQyBggAEEUYOTIKCAEQABixAxiABDIKCAIQABixAxiABDINCAMQLhjHARjRAxiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDIHCAkQABiABNIBCDI5NzNqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8','Sử dụng docker, React, springbot','[{\"name\":\"Sáng Tạo \",\"weight\":35}]','2026-06-09 14:10:54','2026-06-09 14:10:39',NULL,NULL,NULL),(2,11,'Xây dựng hệ thống sáng tạo trong công nghệ thông tin','Xây dựng hệ thống kết hợp AI',NULL,NULL,'[{\"name\":\"tiêu chí sáng tao\",\"weight\":30},{\"name\":\"đầy đủ nội dung\",\"weight\":30},{\"name\":\"kiến trúc phù hợp\",\"weight\":40}]','2026-06-21 18:08:23','2026-06-21 17:55:51','/api/challenges/file/11/IEHM01_-_Reading_Practice_1782065179.docx','IEHM01 - Reading Practice.docx',NULL);
/*!40000 ALTER TABLE `contest_problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contest_registrations`
--

DROP TABLE IF EXISTS `contest_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contest_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contest_id` int NOT NULL,
  `team_id` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `registered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_contest_id` (`contest_id`),
  KEY `IDX_team_id` (`team_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest_registrations`
--

LOCK TABLES `contest_registrations` WRITE;
/*!40000 ALTER TABLE `contest_registrations` DISABLE KEYS */;
INSERT INTO `contest_registrations` VALUES (1,9,1,'PENDING','2026-07-03 11:05:38'),(2,9,2,'PENDING','2026-07-03 11:05:38'),(3,9,5,'PENDING','2026-07-03 11:05:38');
/*!40000 ALTER TABLE `contest_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contests`
--

DROP TABLE IF EXISTS `contests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `max_teams` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPCOMING',
  `rules` longtext COLLATE utf8mb4_unicode_ci,
  `registration_deadline` datetime DEFAULT NULL,
  `submission_deadline` datetime DEFAULT NULL,
  `prize` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prize_details` longtext COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schedule` longtext COLLATE utf8mb4_unicode_ci,
  `organizer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criteria` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_dates` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contests`
--

LOCK TABLES `contests` WRITE;
/*!40000 ALTER TABLE `contests` DISABLE KEYS */;
INSERT INTO `contests` VALUES (9,'SEAL Innovat 2026','Education','Sân chơi công nghệ kịch tính dành cho các lập trình viên và nhà đổi mới tại TP.HCM. Hãy cùng 50 đội thi tài, bứt phá giới hạn và chinh phục giải thưởng hấp dẫn từ ngày 06/06 đến 26/06/2026!','TP. Hồ Chí Minh','2026-06-06 00:00:00','2026-06-26 00:00:00',50,'COMPLETED','Đối tượng: Tất cả các bạn trẻ, lập trình viên tại TP.HCM; tham gia theo đội từ 3 - 5 thành viên (Giới hạn tối đa 50 đội).\n\nYêu cầu sản phẩm: Sản phẩm phải được phát triển mới hoàn toàn trong thời gian thi (06/06 - 26/06/2026). Không sao chép, đạo nhái.\n\nThời hạn nộp bài: Trước ngày 25/06/2026 (Gồm mã nguồn sản phẩm và slide thuyết trình).\n\nTiêu chí chấm điểm:\n\nTính sáng tạo & thực tế (50%)\n\nHoàn thiện kỹ thuật & UI/UX (30%)\n\nKỹ năng thuyết trình chung kết (20%)\n\nQuy định chung: Quyết định của Ban giám khảo là quyết định cuối cùng. BTC có quyền sử dụng hình ảnh cuộc thi để truyền thông.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-03 11:08:01'),(10,'Mega Demo Hackathon (Realtime Demo)','Software Engineering','Cuộc thi \"Mega Demo Hackathon (Realtime Demo)\" là sân chơi thử nghiệm công nghệ nhằm kiểm tra khả năng phát triển giải pháp AI & ML trong thời gian giới hạn. Đây là cơ hội để các đội thi trình diễn tư duy giải quyết vấn đề bằng dữ liệu, tối ưu hóa thuật toán và xây dựng mô hình Realtime Demo (trình diễn trực tiếp) dưới áp lực thời gian. Cuộc thi tập trung vào việc tìm kiếm các ý tưởng đột phá và có tính khả thi cao trong thực tế.','TP. Hồ Chí Minh','2026-06-19 07:25:00','2026-06-19 08:25:00',50,'COMPLETED','1. Đối tượng tham gia\n\nCuộc thi mở rộng cho tất cả các cá nhân đam mê công nghệ, lập trình viên, học sinh, sinh viên và những người nghiên cứu trong lĩnh vực AI & ML.\n\nThí sinh tham gia theo đội, mỗi đội gồm từ 2 đến 5 thành viên. Cá nhân chưa có đội sẽ được Ban tổ chức hỗ trợ ghép đội trước giờ thi.\n\n2. Quy định về sản phẩm và công nghệ\n\nCác đội thi phải tự phát triển sản phẩm của mình trong khoảng thời gian quy định của cuộc thi. Không được sử dụng các sản phẩm hoặc mã nguồn đã được hoàn thiện từ trước.\n\nSản phẩm bắt buộc phải áp dụng các công nghệ, mô hình hoặc thuật toán liên quan đến Trí tuệ nhân tạo (AI) và Học máy (ML).\n\nTại vòng chung kết, sản phẩm phải chạy được phiên bản thử nghiệm trực tiếp (Realtime Demo) để Ban giám khảo đánh giá.\n\n3. Quy tắc ứng xử và bảo mật\n\nNghiêm cấm mọi hành vi gian lận, sao chép mã nguồn của đội khác hoặc sử dụng các hình thức tấn công mạng gây ảnh hưởng đến hệ thống thi đấu.\n\nCác đội tự chịu trách nhiệm về tính bản quyền đối với các thư viện mã nguồn mở hoặc dữ liệu bên ngoài được sử dụng trong bài thi.\n\nBan tổ chức có quyền sử dụng hình ảnh, thông tin sản phẩm của các đội thi cho mục đích truyền thông mà không cần trả thêm chi phí.\n\n4. Quyết định của Ban giám khảo\n\nKết quả chấm điểm dựa trên thang tiêu chí đã công bố và điểm số từ Ban giám khảo là quyết định cuối cùng.\n\nMọi khiếu nại phải được gửi tới Ban tổ chức trong vòng 10 phút sau khi công bố điểm thi của vòng Demo trực tiếp.','2026-06-24 23:59:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-03 11:08:01'),(11,'Inovation Technology','Education','SEAL AI Innovation Challenge 2026 là cuộc thi lập trình chuyên sâu kéo dài 48 giờ do FPT Software phối hợp cùng mạng lưới SEAL tổ chức. Cuộc thi hướng tới mục tiêu tìm kiếm các giải pháp đột phá ứng dụng Trí tuệ nhân tạo (AI) và Học máy (Machine Learning) để giải quyết các bài toán nhức nhối trong 3 lĩnh vực trọng điểm: Y tế thông minh, Giáo dục cá nhân hoá và Bảo vệ môi trường.\n\nĐến với sự kiện, các đội thi sẽ có cơ hội được hướng dẫn trực tiếp (mentor) từ các chuyên gia AI hàng đầu trong ngành, tiếp cận với các API nội bộ và có cơ hội nhận được quỹ ươm tạo dự án lên tới 500 triệu đồng.','TP. Hồ Chí Minh','2026-06-25 00:10:00','2026-06-30 00:10:00',50,'COMPLETED','1. ĐỐI TƯỢNG THAM GIA: \n- Là công dân Việt Nam hoặc sinh viên quốc tế đang học tập tại Việt Nam, độ tuổi từ 18 - 25.\n- Hình thức thi đấu theo đội, mỗi đội tối thiểu 3 thành viên và tối đa 5 thành viên (Bắt buộc có ít nhất 1 lập trình viên).\n\n2. QUY ĐỊNH VỀ SẢN PHẨM DỰ THI:\n- Các sản phẩm/dự án đem đến cuộc thi phải là ý tưởng mới hoặc sản phẩm chưa từng đạt giải tại các cuộc thi Hackathon/Techfest tương tự trước đây.\n- Mã nguồn (Source code) phải được viết trong khung thời gian 48h của chương trình, không sử dụng lại mã nguồn có sẵn trái phép hoặc vi phạm bản quyền (Cho phép dùng Open-source, APIs công khai và thư viện thư viện hỗ trợ).\n- Bắt buộc phải tích hợp ít nhất một thuật toán AI/Machine Learning vào sản phẩm cốt lõi.\n\n3. QUY ĐỊNH BẢO MẬT & BẢN QUYỀN:\n- Toàn bộ bản quyền tài sản trí tuệ của sản phẩm thuộc về Đội thi. Tuy nhiên Ban Tổ chức được quyền sử dụng hình ảnh/thông tin ý tưởng cho mục đích truyền thông.\n- Quyết định cuối cùng về việc chấm điểm và trao giải thuộc về Hội đồng Giám khảo.','2026-06-24 00:10:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-03 11:08:01'),(12,'Design Arichecture Inovation','Blockchain','Chào mừng các bạn đến với \"Design Architecture Innovation\" – cuộc thi Hackathon đột phá do Bộ Khoa học và Công nghệ tổ chức, tập trung vào việc ứng dụng công nghệ Blockchain vào kiến trúc và thiết kế đô thị bền vững.\n\nCuộc thi nhằm tìm kiếm các giải pháp, nền tảng hoặc ý tưởng sáng tạo giải quyết các bài toán thực tế như: quản lý chuỗi cung ứng vật liệu xây dựng, số hóa quyền sở hữu bất động sản (NFT định danh tài sản), và tối ưu hóa quy trình thiết kế thông minh dựa trên dữ liệu phi tập trung.\n\nĐối tượng tham gia: Sinh viên, lập trình viên, kiến trúc sư, và những người đam mê công nghệ Blockchain trên toàn quốc (tối đa 50 đội thi).','TP. Hồ Chí Minh','2026-07-03 06:01:00','2026-07-08 06:03:00',50,'ACTIVE','1. Thể lệ chung:\n- Mỗi đội thi có số lượng thành viên từ 2 đến 5 người.\n- Tất cả mã nguồn và ý tưởng thiết kế phải được phát triển trong thời gian diễn ra Hackathon (không sử dụng dự án có sẵn đã hoàn thiện).\n- Cam kết không vi phạm bản quyền hoặc sao chép ý tưởng của bên thứ ba.','2026-06-30 06:03:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-03 11:08:01'),(13,'AI GenZ Innovation Challenge 2026','AI & ML','Cuộc thi AI GenZ Innovation Challenge 2026 là sân chơi công nghệ quy mô lớn dành cho các bạn trẻ đam mê Trí tuệ nhân tạo (AI) và Học máy (ML). Với mục tiêu tìm kiếm và thúc đẩy các giải pháp đột phá ứng dụng AI vào cuộc sống thông minh, cuộc thi khuyến khích các đội thi phát triển ứng dụng thực tiễn trong các lĩnh vực: Y tế, Giáo dục, Đô thị thông minh và Môi trường. Các đội thi sẽ có 48 giờ thử thách code liên tục, nhận được sự cố vấn từ các chuyên gia đầu ngành để hoàn thiện sản phẩm từ ý tưởng đến bản thử nghiệm (Prototype).','TP. Hồ Chí Minh','2026-07-03 03:30:00','2026-07-12 03:30:00',50,'ACTIVE','Quy tắc Tham gia (Regras)\n1. Quy định chung\nTất cả các đội thi phải tuân thủ nghiêm ngặt các quy định do Ban tổ chức (BTC) đề ra. Bất kỳ hành vi gian lận, sao chép code không ghi nguồn, hoặc sử dụng các sản phẩm đã hoàn thiện trước khi cuộc thi bắt đầu đều sẽ bị loại lập tức.\n\n2. Đội thi và Thành viên\nMỗi đội thi có tối thiểu 3 thành viên và tối đa 5 thành viên.\nMột người chỉ được phép tham gia vào duy nhất 01 đội thi trong khuôn khổ chương trình.\nMọi sự thay đổi về nhân sự (thêm, bớt thành viên) phải được thông báo và nhận được sự chấp thuận từ BTC trước khi Vòng sơ loại kết thúc.\n3. Quyền sở hữu trí tuệ\nToàn bộ mã nguồn, tài liệu, và sản phẩm được tạo ra trong quá trình diễn ra Hackathon đều thuộc quyền sở hữu của các thành viên trong đội. Tuy nhiên, BTC có quyền sử dụng hình ảnh, tên dự án và mô tả dự án cho các mục đích truyền thông phi lợi nhuận mà không cần xin phép trước.\n\n4. Tiêu chí Đánh giá\nCác dự án sẽ được Ban Giám khảo chấm điểm dựa trên các tiêu chí chính sau:\n\nTính sáng tạo (30%): Giải pháp độc đáo, chưa từng có trên thị trường hoặc có cách tiếp cận mới \nKỹ Thuật (40%): Giải pháp có khả năng giải quyết vấn đề thực tế, quy mô thị trường tiềm năng lớn.\nTrình bày (30%): Kỹ năng giao tiếp, trình bày rõ ràng, trả lời câu hỏi phản biện từ Ban Giám khảo.','2026-06-30 21:06:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-03 11:08:01'),(14,'Shift APPens 2026','AI & ML','O Shift APPens là một chương trình cạnh tranh và quản lý kinh doanh trên trang bị 2 và 4 yếu tố bao gồm 48 giờ để phát triển một dự án đổi mới công nghệ thế giới.\n\n\n\nKhông có sự kiện cuối cùng nào xảy ra, bạn có thể trang bị cho dự án của mình một cách đau đớn về pháp lý để đổi mới, bạn có thể có được cơ sở dựa trên các tiêu chí sau: hình dung, thực hiện, thiết kế và trình bày cuối cùng.\n\n\n\nTrong 48 giờ thi đấu, trang trí của học viện Shift — một trong những điều tuyệt vời nhất được cống hiến cho một đồng nghiệp của Ensino Secundário, người giả vờ tuyệt vọng hoặc quan tâm đến công nghệ  và cảm hứng kinh doanh  sau này.\n\n\n\nTrong một thời gian dài, bạn có thể tham gia vào các cuộc nói chuyện, hội thảo thực tế, các buổi hướng dẫn, giải pháp cho các công ty, dự án, trò chơi, mạng điện tử, rõ ràng, nhiều convívio và đa dạng.\n\n\n\nMột ấn bản 12ª do Shift APPens cung cấp vào ngày 1, 2 và 3 tháng 5 năm 2026 , không có Pavilhão do CF União de Coimbra , và là tổ chức của Núcleo de Estudantes de Informática da Associação Académica de Coimbra và pela jeKnowledge , Junior Empresa da Faculdade de Ciências e Tecnologia da Universidade de Coimbra.\n\n\n\nTrong thời gian dài, hoặc Shift APPens đã tập hợp nhiều hơn 1700 người chuyển đổi , đã biến đổi một số lượng lớn và nhiều lần bảo vệ hackathons ở các trường đại học nhiều năm nay. Bạn không nên trốn thoát khỏi cơ hội này để bắt đầu, bắt đầu và trở thành một phần của một cuộc giao lưu sôi động với những người đam mê công nghệ . Marca já na lịch trình, hãy quay lại trang bị và bảo đảm của bạn trên https://shiftappens.com !\n\n\n\n---\n\n\n\nDesafios e Temas\n\n\n\nHiệu trưởng cạnh tranh của Shift APPens là một chủ đề sống động, mang lại sự tự do hoàn toàn để khám phá sự phê bình và phát triển một dự án ở khu vực mà bạn truyền cảm hứng nhiều nhất.\n\n\n\nNgoài ra, có những điều đặc biệt về những người bảo trợ cho các công ty đã làm sự kiện, có thể có những chủ đề đặc biệt. Vì trang bị cho cuộc sống của cô ấy trở nên tuyệt vời hơn khi bạn tham gia, nên có vẻ như giới hạn ghi chú của người tham gia.','TP. Hồ Chí Minh','2026-07-02 20:50:00','2026-07-30 20:50:00',50,'ACTIVE','Quy định\n1. Ứng dụng Shift và Học viện Shift\n\n1.1 Giới thiệu\n\nO Shift APPens là một chương trình cạnh tranh tập trung vào tiêu chí của một dự án công nghệ với tổng cộng 48 giờ, được trang bị bởi 2 và 4 yếu tố.\n\nSong song với Shift APPens, hoặc là Shift Academy, một cuộc cạnh tranh khiến bạn cảm thấy chán nản hoặc quan tâm đến những người bạn đồng hành trong lĩnh vực công nghệ và kinh doanh của Ensino Secundário.\n\n\n\n1.2 Tổ chức\n\nO Shift APPens là một trong những tổ chức sự kiện của Núcleo de Estudantes de Informática da Associação Académica de Coimbra (NEI/AAC) và pela jeKnowledge, Junior Empresa da Faculdade de Ciências e Tecnologias da Universidade de Coimbra.\n\nO Núcleo de Estudantes de Informática da Associação Académica de Coimbra là một trong những nhóm đại diện thị thực cho những người nghiên cứu phương pháp rèn luyện và cải tiến trải nghiệm và học tập của mình.\n\nKiến thức của tôi là một Empresa trẻ của FCTUC, được tài trợ vào năm 2008 với mục tiêu là tỷ lệ sinh viên có cơ hội ứng dụng cho sự tập trung của các học giả tìm kiếm các dự án bên ngoài quốc tế.\n\n\n\n1.3 Mục tiêu\n\nSự kiện này giống như một quảng cáo cuối cùng hoặc kết nối mạng lưới các sinh viên, chuyên gia và doanh nhân cấp quốc gia mới, có khả năng là một môi trường độc quyền để khám phá một cách phê bình và tinh thần đổi mới, đóng góp cho sự phát triển của các đối thủ cạnh tranh.\n\n\n\n1.4 Dữ liệu cục bộ\n\nPhiên bản 12ª của Shift APPens giúp trang trí ngày 1 đến 3 ngày mai, không có Pavilhão do CF União de Coimbra, tình huống ở thời điểm tiếp theo:\n\nPavilhão CFUC, R. Infanta Dona Maria, Fonte da Cheira, 3030-207 Coimbra\n\n\n\n2. Informações Gerais\n\n2.1 Đăng ký\n\nSự kiện này là một trong những việc cần làm của những người đam mê công nghệ và thiết kế và quản lý 11€ và 22€ bởi yếu tố, người học và không phải người học, sự tôn trọng. Hướng dẫn cách sử dụng một loại giấy phép tự động hỗ trợ các chương trình giáo dục được cung cấp, không có sẵn trong phần ghi chú. \n\nMột câu hỏi về một sự kiện đảm bảo cho tất cả những người tham gia được hưởng lợi từ việc tổ chức. Những người tham gia có thể được đảm bảo rằng họ có thể sử dụng https://shiftappens.com, có xu hướng nhận được sự chấp nhận vì những hạn chế của họ.\n\n\n\n2.2 Equipas\n\nSau khi ghi lại những điều cá nhân đó, bạn có thể làm tất cả những gì ứng cử viên có thể được trang bị trước. Trên đây là những ghi chú được ghi trong nhóm tất cả các ghi chú của các thành viên, đây là cách bạn có thể tự mình thực hiện một số điều mà bạn có thể trang bị cho bạn để mua một cái gì đó. Là trang bị đầy đủ cấu thành từ 2 đến 4 yếu tố. Tôi được khuyến nghị rằng các yếu tố có thể đa dạng hóa kỹ năng, cách thức để bạn có thể phản hồi một số việc cần làm hoặc những điều không mong muốn mà không gặp phải sự kiện nào. \n\nNgười tham gia có thể tích hợp một thiết bị, do đó, người tham gia có thể tham gia vào các dự án được thiết kế bởi essa mesma thiết bị. Sau đó, tất cả đều được trang bị như một cơ hội để trabalhar trong nhiều công việc mà dự án đó, bao gồm cả yếu tố cạnh tranh chính và những nhược điểm cá nhân hóa.\n\n\n\n2.3 Alimentação\n\nA Organização assegura todas as refeições, desde o jantar de sexta-feira até ao almoço de domingo(refeições incluem pequenos-almoços, almoços e jantares).       \n\nNhững người tham gia sẽ được phép nghỉ giải lao thường xuyên, kể cả trong thời gian mới bắt đầu, và họ có thể được phép trazer mantimentos de fora. Uống rượu không được phép.\n\nVì vậy, bạn có thể cung cấp thông tin về cách tổ chức trong thời gian hoặc chuẩn bị công thức ghi chép, để bạn có thể mua các sản phẩm thay thế và đảm bảo khi cần thiết.\n\n\n\n2.4 Lắp đặt\n\nO Shift APPens 2025 sẽ thực hiện CF Pavilhão của União de Coimbra, tổ chức địa phương và các khu vực cơ bản khác nhau: \n\nkhu vực trabalho, địa phương mà người tham gia tập trung;\n\nbaneários, những gì quais todos os những người tham gia, NHÂN VIÊN và các thành viên của các công ty có thể sử dụng, bao gồm cả công tước và người quản lý roupa;\n\nkhu vực nghỉ giải lao và uống cà phê;\n\nphòng chờ zona, que servirá para que todos possam descontrair, realizar algumas atividades lúdicas và ký túc xá caso desejem; \n\nhiệu trưởng palco, các cuộc nói chuyện về cách trang trí, hội thảo, thuyết trình về trận chung kết, các bài thuyết trình và thông báo quan trọng;\n\nkhu vực trợ giúp, khu vực tập trung vào NHÂN VIÊN. Onde os những người tham gia có thể phát triển những điều cần thiết nếu có một số mẹo phụ trợ;\n\nzona de dormir.\n\nMột tổ chức tư vấn cho người tham gia về một trong những công ty bạn đang có, một công ty, một số sản phẩm, sản phẩm có giá trị và mức độ thoải mái, hoặc bạn có thể gặp khó khăn hơn khi làm cho một sân vận động thoải mái hơn, nhưng không phải là bạn đang lo lắng về những điều kiện cần thiết trong sự kiện (tư vấn các điều kiện và điều kiện).\n\n\n\n3. Sự kiện\n\n3.1 Thủ tục nhận phòng\n\nO Shift APPens được bắt đầu vào ngày 1 tháng 5 vào lúc 12h30. Vào đầu, người tham gia có thể được cung cấp bởi trang bị của NHÂN VIÊN tại thời điểm họ muốn và được cấp một chứng chỉ đáng tin cậy cho tên và bộ công cụ của người tham gia. \n\n\n\n3.2 Cerimónia de abertura\n\nMột phiên đột phá được bắt đầu từ sự kiện này, lúc 14 giờ. Trong thời gian này, nó đã được trình bày hoặc đưa ra đề xuất cho các đối tượng. Sự tham gia có thể tạo ra các lựa chọn cá nhân hóa tùy chọn, vì nó giúp bạn quyết định đồng thời một cơ hội để có được những ưu đãi bổ sung. Đây là một sự kiện được tổ chức để bắt đầu cuộc thi hackathon và trang bị cho bạn thời gian dài 48 giờ để phát triển các dự án của bạn.\n\n\n\n3.3 Nền tảng\n\nDiscord\n\nTrang web chính thức của Shift APPens (https://shiftappens.com/)\n\nTAIKAI\n\n\n\n3.4 Cuộc thi Hackathon\n\n3.4.1 Chủ đề\n\nO Shift APP không quan tâm đến chủ đề dành cho người tham gia, đặc biệt là khi thiết bị phát triển, thậm chí còn làm sự kiện, một dự án đổi mới, phần mềm hoặc phần cứng.\n\nĐưa ra ý tưởng, tự phụ và tổ chức có thể chuẩn bị trước, hoặc phát triển dự án để có thể độc quyền trong 48 giờ thi đấu. Trang bị cho bạn không bị vướng mắc vì quy định đó là một hình phạt và cuối cùng bị loại.\n\n\n\n3.4.2 Giao hàng ban đầu\n\nSự tham gia vào cuộc thi là một kỹ năng và trang bị cho 2 và 4 yếu tố thành thạo.\n\nMột sự cố lần đầu tiên xảy ra ở cuộc thi hackathon đầu tiên và sau đó bị phản đối vì trang bị cho dự án của bạn.\n\nVới tư cách là người quyết định đồng ý, hãy phát triển dự án của bạn để công khai trên nền tảng của TAIKAI, tại thời điểm hiện tại, với:\n\no nome da equipa;\n\nTrong phần \"Mô tả\", một liên kết được chuyển hướng sang một nền tảng hỗ trợ hoặc có liên quan đến việc phát sóng cho dự án, đây là nền tảng phát triển công khai để nhận được bằng sáng chế EPL. Có một số người được bổ sung trong kho lưu trữ của tất cả các nhân viên đang tham gia vào các thử thách cá nhân hóa mà một ứng cử viên được trang bị và một ứng dụng Shift;\n\ntùy chọn, trong phần \"Mô tả\", một liên kết mà bạn có thể tìm thấy trong các tài liệu đầu tiên về đồ họa/mô hình nhận dạng;\n\nnếu bạn muốn tham gia vào tất cả các lựa chọn cá nhân hóa, người tham gia sẽ có thể chọn (các) mesmo trong \"Categorias/Desafios\".\n\nNếu không phải là lần đầu tiên đệ trình, một thiết bị không có khả năng tham gia vào việc không được đảm bảo sau này. \n\nVì vậy, tôi có thể tạo ra các dự án cho những điều không mong muốn được cá nhân hóa mà bạn có thể sử dụng dưới dạng thẻ cho các bản ghi nhớ.\n\n\n\n3.4.3 Giao hàng trung gian\n\nViệc đệ trình giữa các trang web không được thực hiện trước đây và bị cản trở bởi một trong những dự án có sẵn mà bạn muốn thiết lập cho các thiết bị của mình. \n\nVới tư cách là người quyết định đồng ý, hãy phát triển dự án của bạn ở TAIKAI, tại thời điểm hiện tại, với:\n\ntrong phần \"Mô tả\", một liên kết được chuyển hướng đến một nền tảng hỗ trợ hoặc đã thực hiện tại thời điểm này và tùy chọn liên kết bên ngoài được chuyển hướng đến các dữ liệu nhận dạng đồ họa/mô hình;\n\ntrong phần \"Mô tả\", một nhận dạng vấn đề về chất lượng của người phản hồi dự án và giả vờ là người giải quyết.\n\nNếu không, bạn có thể nộp đơn này, một thiết bị không có khả năng tham gia vào việc không được đảm bảo sau này.  \n\n\n\n3.4.4. Entreg final\n\nTrận chung kết được tổ chức như một sự phản đối để có được các dự án cuối cùng và trang trí cuối cùng trong cuộc thi hackathon. Với tư cách là người quyết định đồng ý, hãy phát triển dự án của bạn được công bố trên nền tảng TAIKAI, tại thời điểm bạn ước tính với các yêu cầu sau:\n\nmột phần trình bày, nếu bạn muốn trình bày, bạn có thể bắt đầu quảng cáo chiêu hàng và có thể bao gồm một bản demo cho dự án, bạn sẽ có thể bắt đầu ở định dạng ngang 4:3;\n\nmột mô tả về dự án mà nội dung:\n\nliên kết đến kho lưu trữ của dự án và tùy chọn liên kết bên ngoài được chuyển hướng đến đồ họa/mô hình nhận dạng;\n\nxác định vấn đề về chất lượng của người phản hồi dự án;\n\ngiả vờ là người giải quyết vấn đề;\n\ntecnologias utilizadas;\n\noutros aspetos que coi những điều thích hợp;\n\ncác tài liệu bên ngoài được coi là có liên quan (với phần \"Tài sản\").\n\nSau đó, bạn có thể sử dụng cơ hội để có được trang bị, phương thức cải cách và sẵn sàng.\n\nVới tư cách là người trình bày, những người tham gia đã sớm bắt đầu phản hồi để có thể yên tâm về dự án của mình, báo cáo sự kiện đã xảy ra trong quá trình thực hiện. Quá trình này được coi như một sự đảm bảo có sẵn, đảm bảo rằng bạn có thể trang bị cho sự phát triển của dự án trong thời gian hoặc sự kiện.\n\n\n\n3.4.5. Các phương pháp sẵn có\n\nTất cả các dự án phụ trong khoảng thời gian 48 giờ do Shift APPens có sẵn với các thông số cơ bản sau: conceito, triển khai, thiết kế và quảng cáo chiêu hàng cuối cùng. \n\nTiêu chí này cho rằng bạn có thể đưa ra một giải pháp/nghiên cứu dựa trên cơ sở về sự đổi mới phải đối mặt với các lựa chọn thay thế hiện có hoặc một giải pháp được hỗ trợ trong thời gian ngắn.\n\nTiêu chí Thiết kế xem xét khía cạnh hình ảnh của ứng dụng và trình bày, coi như một đồ họa nhận dạng. Ngoài ra, phần còn lại của phân tích UI/UX được coi là một phần của tính khả dụng.\n\nTiêu chí Triển khai và Kỹ thuật tập trung vào một phần của dự án được phát triển trong thời gian hoặc sự kiện và không có chức năng nào của nó. Không cần phải giả vờ có sẵn hoặc có sẵn, nhưng bạn cũng có thể phải đối mặt với số lượng và chất lượng để đạt được điều đó trong khoảng thời gian dài 48 giờ.\n\nVì lý do này, quảng cáo chiêu hàng cuối cùng sẽ được đưa ra để đánh giá trình độ của dự án như một hình thức được đưa ra trong khuôn khổ pháp luật. Để biết thêm thông tin, hãy tham khảo ý kiến ​​của phóng viên tiểu mục (3.4.7.).\n\n\n\n3.4.6. Pré-seleção\n\nCách tốt nhất là bạn phải chọn một trong những lựa chọn đầu tiên, có một trong những lựa chọn trước, sau đó là một trận chung kết. Vào thời điểm này, những người tham gia đã trình bày dự án của bạn trong 8 phút và gây ra một số khó khăn trong pháp lý, gửi nó đến mức khó khăn trong 3 giây mà bạn có thể xem xét các tiêu chí sau – conceito, triển khai/kỹ thuật và thiết kế. Sau tất cả các dự án đã được trình bày, bạn có thể trình bày danh sách các dự án, bạn sẽ phải vượt qua Vòng chung kết quảng cáo chiêu hàng và do đó là Trận chung kết có sẵn. Apenas 15 trang bị cho trận chung kết.\n\n\n\n3.4.7. Trận chung kết và trận đấu có sẵn\n\nTôi đã nhận ra rằng không có cuộc thi hackathon cuối cùng nào được tổ chức và nó sẽ trở thành nhà cung cấp sản phẩm được bán trong vòng 48 giờ. Bạn có thể trang bị cho mình 3 phút để trình bày dự án của mình, với nhịp độ nhanh chóng, để trình bày một cách nhanh chóng. Apenas as 15 trang bị được lựa chọn ở Pre-seleção subirão ao palco para fazer o pitch. Sau khi chào sân, bạn sẽ có một khoảng thời gian ngắn (dài 4 phút) để thực hiện các nhiệm vụ và phản hồi trước đó.\n\n\n\n3.5 Học viện chuyển đổi cạnh tranh\n\n3.5.1 Chủ đề\n\n    Bạn có thể bỏ qua Shift Academy với tư cách là cơ sở để đưa ra nhiều thông tin khác nhau:\n\ndesenvolvimento de um jogo;\n\nphát triển một trang web/ứng dụng web;\n\nphát triển mô hình trí tuệ nhân tạo;\n\ndự án tự do.\n\n\n\n3.5.2 Giao hàng\n\nSự tham gia của các cá nhân là một chuyên gia và người có nhiều cá nhân tham gia nhất hoặc được trang bị 2 yếu tố.\n\nMột dự án có thể được thực hiện gần đây nhất trong cuộc thi hackathon và bị cản trở bởi các dự án có sẵn trên thiết bị của bạn.\n\nVới tư cách là người quyết định đồng ý, hãy phát triển dự án của bạn thông qua Discord, bạn cần phải có ước tính như vậy với các yêu cầu sau:\n\ncódigo desenvolvido;\n\nmột mô tả về dự án mà nội dung:\n\nliên kết đến kho lưu trữ của dự án và liên kết bên ngoài được chuyển hướng đến đồ họa/mô hình nhận dạng;\n\nxác định vấn đề về chất lượng của người phản hồi dự án;\n\ngiả vờ là người giải quyết vấn đề;\n\ntecnologias utilizadas;\n\noutros aspetos que coi những điều thích hợp;\n\nMVP chung kết;\n\ntrình bày ủng hộ trận chung kết sân cỏ.\n\n\n\n3.5.4. Các phương pháp sẵn có\n\nTất cả các dự án phụ được cung cấp bởi Shift Academy với các thông số cơ bản sau: ý tưởng, triển khai, thiết kế và quảng cáo chiêu hàng cuối cùng. \n\nTiêu chí Conceito đã đưa ra một khả năng về khả năng của người tham gia/nhóm viết lách số một giải pháp để đưa ra lời khuyên ban đầu. \n\nTiêu chí Thiết kế xem xét khía cạnh hình ảnh của ứng dụng và trình bày, coi như một đồ họa nhận dạng. Ngoài ra, phần còn lại của phân tích UI/UX được coi là một phần của tính khả dụng.\n\nTiêu chí Triển khai và Kỹ thuật tập trung vào một phần của dự án được phát triển trong thời gian hoặc sự kiện và không có chức năng nào của nó. Không cần phải giả vờ có sẵn hoặc có sẵn, nhưng bạn cũng có thể phải đối mặt với số lượng và chất lượng để đạt được điều đó trong khoảng thời gian dài 48 giờ.\n\nVì lý do này, quảng cáo chiêu hàng cuối cùng sẽ được đưa ra để đánh giá trình độ của dự án như một hình thức được đưa ra trong khuôn khổ pháp luật. Để biết thêm thông tin, hãy tham khảo ý kiến ​​của phóng viên tiểu mục (3.5.5.).\n\n\n\n3.5.5. Trận chung kết và trận đấu có sẵn\n\nTrong trận chung kết chào sân, tham gia Shift Academy, bạn sẽ không thể tham gia hackathon nữa. Bạn có thể trang bị cho mình 2 phút để trình bày dự án của mình, với nhịp độ nhanh chóng, để trình bày một cách liên tục.\n\nSau khi chào sân, bạn đã có một khoảnh khắc (dự kiến ​​trong 3 phút) để thực hiện các nhiệm vụ và phản hồi trước đó. \n\n\n\n3.6. Ngân hàng đối tác\n\nLà những người chủ doanh nghiệp thực hiện sự kiện ở một nơi đặc biệt, có thể giúp người tham gia tham gia vào các dự án của bạn, một môi trường xung quanh được phê bình, đổi mới và không chính thức. \n\nNhững người tham gia có thể đưa ra ý kiến ​​và đánh giá về nghề nghiệp của họ trong mối quan hệ với các dự án mà họ mong muốn trở thành người tham gia vào cuộc thi và cho những thất bại.\n\n\n\n3.7. Thử thách cá nhân\n\nSự tồn tại vượt xa những thất bại trong cuộc thi hackathon. Bạn có thể không có mối quan hệ tương đối với các dự án cá nhân, cá nhân hoặc trang bị và trình bày không có sự khởi đầu nào cho sự kiện của các doanh nghiệp thuộc tổ chức. \n\nTất cả các trang bị có chứa sự tự do để tham gia hoặc không có điều kiện bất lợi, đều có khả năng giúp bạn có được nhiều lợi ích hơn nếu bạn có thể tôn trọng những người muốn tham gia.\n\n\n\n3.8. Các buổi nói chuyện và hội thảo\n\nĐây là một trong những cách trang trí không có hiệu trưởng, theo phương thức quảng cáo để tương tác với những người yêu thích. \n\nKhi các cuộc nói chuyện và hội thảo được định dạng theo thời điểm mà Shift APPens mang lại cơ hội chia sẻ dịch vụ của bạn và một phần sự thoải mái với những người tham gia.\n\nBạn có thể xem tin nhắn này trên Instagram của Shift APPens, không có thông tin nào về một thông điệp dành cho kênh Discord mà bạn có thể bắt đầu.\n\nKhi phiên này được phân phối trong ba ngày qua, người tham gia sẽ có được cuộc sống thoải mái hơn khi họ tham gia. Bây giờ, có thể bạn sẽ tạm dừng không tham gia vào các dự án của bạn và tìm kiếm những điều thú vị mà bạn có thể có được trong thời gian đó.\n\n\n\n3.9. Hoạt động\n\nTrong thời gian có các sự kiện được chứng nhận, trang trí của các hoạt động sẽ được khuyến khích để tương tác với người tham gia, dưới dạng: trò chơi, câu đố, trò chơi mạo hiểm, trò chơi thể thao điện tử, trò chơi ngoài trời.\n\n\n\n3.10. Cerimónia de encerramento\n\nSau một thời gian phản xạ của một phần của pháp luật, những người bán hàng đã được thông báo về một sự kiện được xác nhận. \n\nKhi trang bị cho bạn một chiếc palco cao cấp, bạn có thể nhận được số tiền đầu tư và một chiếc palvra, nếu bạn có thể chấp nhận được. \n\nĐây cũng là khoảnh khắc được thông báo về những điều không mong muốn được cá nhân hóa.\n\n\n\n3.11 Giải thưởng\n\nNhư một khoản đầu tư ban đầu, bạn có thể trang bị cho mình một giải pháp hàng đầu với tư cách là người phát ngôn cho các sự kiện xã hội. Đó là mức cao nhất của cá nhân và không có khả năng thay thế hoặc thay thế bằng giá trị tương đương.\n\nHãy xem xét việc khôi phục số tiền trả trước một khoản, có thể số tiền trả trước đó sẽ là của cá nhân và không có khả năng biến chúng thành trocados vì giá trị tương đương. Quanto để bảo đảm số tiền trả trước, không có trường hợp điện tử nào được đưa ra trong các sự kiện có nhiều biến thể, nó đã phát triển thành một tổ chức để tổ chức cho quá trình bảo đảm hành động của bạn. Giả sử, không có nghĩa là bạn phải đảm bảo rằng người tham gia sẽ không có thời điểm nhận được tiền thưởng.\n\nTất cả những gì về hiệu trưởng cạnh tranh, là một nền tảng, queremos là thiết bị tiên tiến mà bạn có thể bị loại khỏi một trong các danh mục. Là thiết bị được phân loại nhiều nhất trong số các tiêu chí (Conceito, Técnica và Triển khai, Thiết kế và Quảng cáo chiêu hàng) được đưa ra trước. Vì trang bị cho bạn khả năng cạnh tranh hiệu quả không phải là kỹ năng để có được tiền thưởng.\n\nVì động lực của tất cả các tổ chức, không thể có được khoản đầu tư trong thời gian của một chứng chỉ khởi nghiệp, một tổ chức có thể thỏa hiệp với việc làm cho doanh thu của bạn bị thu thập dữ liệu sau đó, bởi doanh nghiệp hoặc bên ngoài tôi.\n\n\n\n3.12 Desafio de pontos\n\nTrong sự kiện này, sau đó đã triển khai một hệ thống trò chơi dựa trên Shift Coins. Những người tham gia có thể có nhiều cầu nối tích lũy để tham gia vào các hoạt động đa dạng, như khi đến thăm bancas de empresas, hỗ trợ các hình thức, và người tham gia sẽ tham gia vào các hoạt động và giải pháp đề xuất. Os Shift Coins có thể tích lũy được nhiều tiền từ các sự kiện kéo dài.\n\n\n\n4. Termos e condições\n\n4.1 An toàn\n\n4.1.1. Công thức và conduta\n\nO Sự kiện giả vờ không chính thức và quen thuộc, đặc biệt là bạn có thể cạnh tranh sau đó. \n\nMột tổ chức không cho phép bạn vượt qua khó khăn, gây khó chịu hoặc phạm tội trong một sự kiện, trong thời gian hoặc sự kiện, và bảo lưu hoặc trực tiếp đưa một người tham gia bị trục xuất mà bạn cho rằng đó là một hành vi không phù hợp.\n\n\n\n4.1.2. Itens proibidos\n\nĐể có được sự đảm bảo về tất cả các việc cần làm, nó không được phép cho phép cạnh tranh địa phương:\n\nalcool adquirido diễn đàn địa phương;\n\nnhững điều đáng tiếc hoặc những điều đáng tiếc;\n\nanimais (ngoại trừ animais de serviço: như cães-guia);\n\nvũ khí sương mù và vật cản có thể được sử dụng như vũ khí;\n\nfogo de artifício;\n\nthiết bị khuếch đại âm thanh, hỗ trợ cho các điện thoại di động lớn;\n\ncác nghệ thuật quảng cáo, thương mại, chính trị, tôn giáo hoặc hành động không phải là quyền tự quyết của bản chất, bao gồm các roupas, faixas, sinais, biểu tượng và folhetos hoặc panfletos;\n\nkhó khăn ngoài mục tiêu mà bạn có thể xem xét khả năng và khả năng gây ra sự kiện công khai và bạn có thể sử dụng để làm phiền, cản trở hoặc can thiệp vào sự kiện của bạn hoặc với một số người tham gia.\n\nNếu người tham gia có thể là một trong những người đề nghị, một Tổ chức xác định hoặc chỉ đạo trục xuất ngay lập tức là thành viên, nếu cần thiết, bạn phải tố cáo những người có thẩm quyền tự động. \n\n\n\n4.1.3. Trách nhiệm cá nhân\n\nNgười tham gia sẽ được đáp ứng bởi những gì họ thích hợp để làm điều đó, bạn sẽ thấy thoải mái và thú vị. Một tổ chức đề xuất bạn nên làm gì để tạo sự thoải mái và phù hợp cho một ngày nào đó, một phương pháp điều trị y tế và vượt xa những gì bạn cần xem xét thích hợp cho một nơi thoải mái. \n\nTổ chức không chịu trách nhiệm cho người tham gia vì không có sản phẩm nào được cung cấp cho những gì được mô tả làm tài liệu. \n\nMột tổ chức không có khả năng chịu trách nhiệm về những hành vi phạm tội hoặc vi phạm. Sau đó, NHÂN VIÊN đã trình bày nhiều bộ phận trong thời gian làm việc hoặc sự kiện và tồn tại cũng như một số tài liệu bảo vệ tại địa phương, bạn có thể tham khảo ý kiến ​​​​của mình về khả năng có thể làm được trong tầm nhìn. \n\n\n\n4.1.4. Sự hợp pháp của các dự án được trình bày\n\nTất cả các dự án đã thực hiện được đã trang bị cho người tham gia trên cơ sở tự động độc quyền của các tháng.\n\nTất cả các dự án được trình bày đã được phát triển để đổi mới và tôn trọng tất cả các quy tắc tự động. Não serão aceites projetos đạo văn.  \n\nBạn phải buộc tất cả các dự án phát triển âm thanh của Shift APPens để cung cấp như một phần mềm có giấy phép công cộng Eclipse.\n\n\n\n4.2. Direitos de imagem\n\nKhi không tham gia sự kiện tại địa phương, hoặc người tham gia đồng ý không hủy bỏ, một danh hiệu miễn phí, à:\n\ntrọng lực của hình ảnh của bạn đối với hình ảnh của bạn (bao gồm không giới hạn độ hấp dẫn của âm thanh và hình ảnh hấp dẫn của hình ảnh trên máy ảnh truyền hình và hình ảnh);\n\ntham gia vào việc phát ra trong cơ thể và truyền đi; \n\nmột cuộc khám phá thương mại về hình ảnh của Tổ chức hoặc các liên kết của bạn với các cơ quan tự động và Công ty Thương mại. \n\nTrong trường hợp này, hãy cân nhắc việc đăng ký giáo dục hoặc gia sư tự động thể hiện pháp lý hoặc sử dụng hình ảnh để phù hợp với những người trước đây.\n\nTôi không thể chấp nhận việc chụp ảnh mà bạn muốn gửi qua e-mail cho người tham gia@shiftappens.com để gửi nhanh.\n\n\n\n4.3. Hủy bỏ và tái tắc mạch\n\nHủy bỏ việc sử dụng dữ liệu được ghi trên trang web trực tiếp để ghi lại toàn bộ dữ liệu trước khi thực hiện. Após dữ liệu này không chắc chắn sẽ mang lại hiệu quả cho việc đánh giá lại.\n\n\n\n4.4. Tổ chức Soberania \n\n4.4.1. Sửa đổi các Điều khoản và Điều kiện\n\nTổ chức trực tiếp sửa đổi này có các điều kiện và điều kiện khó khăn ngay lập tức. \n\nNếu một trong những cláusula này đưa ra các Điều khoản và Điều kiện mà bạn đã khai báo, nó sẽ không được chấp nhận để xác thực các cláusulas còn lại. \n\n\n\n4.4.2. Hậu quả của việc vi phạm các điều kiện và điều kiện\n\nNgười tham gia tìm hiểu lại và đồng ý rằng điều đó có thể vi phạm điều kiện và điều kiện của bạn, có thể:\n\nser recusada a sua entrada no local;\n\nser expulso do local;\n\nver a sua encrição no Shift APPens/Shift Academy đã hủy bỏ việc được đền bù hoặc được đền bù;\n\nser denunciado às entidades có thẩm quyền.\n\nViệc trình bày những người tham gia không có sự kiện nào giống như sự tiếp xúc và mạo hiểm. Trách nhiệm của Tổ chức phải đối mặt với một số hạn chế về số lượng người tham gia và không có khả năng vượt quá, gây khó khăn cho người tham gia, hoặc giá trị ghi chép cho người tham gia được giới thiệu.\n\n\n\n4.5. Các tình huống không có sẵn trong các Điều khoản và Điều kiện\n\nĐối với các tình huống không được ghi trước trong tài liệu, các Điều khoản và Điều kiện không được thiết lập để hạn chế chỉ đạo của Tổ chức về việc ban hành luật pháp có hiệu lực.\n\n\n\n5. Liên hệ\n\nĐối với các câu hỏi hoặc yêu cầu bổ sung về quy định hiện tại, những người tham gia cần phải tham gia liên hệ với thiết bị để thực hiện sự kiện qua e-mail: người tham gia@shiftappens.com.','2026-07-10 23:38:00',NULL,'','','','','{\"registrationStart\":\"2026-07-02 20:49:00\",\"registrationEnd\":\"2026-07-10 23:38:00\",\"submissionDeadline\":null,\"items\":[]}','','{\"items\":[{\"name\":\"Sáng tạo\",\"weight\":30},{\"name\":\"Kỹ thuật lập trình \",\"weight\":40},{\"name\":\"Trình bày\",\"weight\":30}],\"judgeCount\":3}','2026-07-03 11:08:01');
/*!40000 ALTER TABLE `contests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `criteria`
--

DROP TABLE IF EXISTS `criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `criteria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `weight` decimal(3,2) NOT NULL,
  `max_score` int NOT NULL DEFAULT '10',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `criteria`
--

LOCK TABLES `criteria` WRITE;
/*!40000 ALTER TABLE `criteria` DISABLE KEYS */;
INSERT INTO `criteria` VALUES (1,'Tính sáng tạo & thực tế',0.50,10),(2,'Hoàn thiện kỹ thuật & UI/UX',0.30,10),(3,'Kỹ năng thuyết trình chung kết',0.20,10),(4,'Sáng tạo',0.30,10),(5,'Kỹ thuật lập trình',0.40,10),(6,'Trình bày',0.30,10);
/*!40000 ALTER TABLE `criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `hackathons`
--

DROP TABLE IF EXISTS `hackathons`;
/*!50001 DROP VIEW IF EXISTS `hackathons`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `hackathons` AS SELECT 
 1 AS `id`,
 1 AS `name`,
 1 AS `category`,
 1 AS `description`,
 1 AS `location`,
 1 AS `start_date`,
 1 AS `end_date`,
 1 AS `max_teams`,
 1 AS `prize`,
 1 AS `image`,
 1 AS `status`,
 1 AS `created_at`,
 1 AS `schedule`,
 1 AS `prize_details`,
 1 AS `rules`,
 1 AS `organizer`,
 1 AS `registration_deadline`,
 1 AS `criteria`,
 1 AS `submission_deadline`,
 1 AS `registered_teams_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `judging_assignments`
--

DROP TABLE IF EXISTS `judging_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `judging_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assigned_at` datetime NOT NULL,
  `judge_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_judge_team` (`judge_id`,`team_id`),
  KEY `IDX_303EC8D4B7D66194` (`judge_id`),
  KEY `IDX_303EC8D4296CD8AE` (`team_id`),
  CONSTRAINT `FK_303EC8D4296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_303EC8D4B7D66194` FOREIGN KEY (`judge_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `judging_assignments`
--

LOCK TABLES `judging_assignments` WRITE;
/*!40000 ALTER TABLE `judging_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `judging_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentor_tickets`
--

DROP TABLE IF EXISTS `mentor_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentor_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `mentor_id` int DEFAULT NULL,
  `topic` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'OPEN',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentor_tickets`
--

LOCK TABLES `mentor_tickets` WRITE;
/*!40000 ALTER TABLE `mentor_tickets` DISABLE KEYS */;
INSERT INTO `mentor_tickets` VALUES (1,4,13,'nhóm em dang bị kẹt ở phần cấu hình docker cấu hình lại giúp em','RESOLVED','2026-06-19 10:19:19'),(2,4,13,'nhóm em dang mi mac loi phan docker sua loi giup em','RESOLVED','2026-06-19 10:37:13');
/*!40000 ALTER TABLE `mentor_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestones`
--

DROP TABLE IF EXISTS `milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `milestones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hackathon_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `due_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestones`
--

LOCK TABLES `milestones` WRITE;
/*!40000 ALTER TABLE `milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `contest_id` int DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,16,NULL,'PROJECT_SCORED','✅ Dự án đã được chấm điểm!','Dự án của đội Chung Sức vừa được Giám khảo hoàn tất việc chấm điểm. Bạn có thể kiểm tra lại trên Bảng xếp hạng!',0,'2026-07-03 14:09:10'),(2,17,NULL,'PROJECT_SCORED','✅ Dự án đã được chấm điểm!','Dự án của đội huy vừa được Giám khảo hoàn tất việc chấm điểm. Bạn có thể kiểm tra lại trên Bảng xếp hạng!',0,'2026-07-03 14:09:33'),(3,18,NULL,'PROJECT_SCORED','✅ Dự án đã được chấm điểm!','Dự án của đội huy vừa được Giám khảo hoàn tất việc chấm điểm. Bạn có thể kiểm tra lại trên Bảng xếp hạng!',0,'2026-07-03 14:09:33');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext,
  `logo_url` varchar(255) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'TechCorp','Công ty công nghệ hàng đầu','https://ui-avatars.com/api/?name=TC&background=random','https://techcorp.com','2026-07-03 10:54:53'),(2,'DevCommunity','Cộng đồng lập trình viên Việt Nam','https://ui-avatars.com/api/?name=DC&background=random','https://devcommunity.vn','2026-07-03 10:54:53');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hackathon_id` int DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scores`
--

DROP TABLE IF EXISTS `scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `score` decimal(4,2) NOT NULL,
  `feedback` longtext,
  `judge_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `criteria_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_score_entry` (`judge_id`,`team_id`,`criteria_id`),
  KEY `IDX_750375EB7D66194` (`judge_id`),
  KEY `IDX_750375E990BEA15` (`criteria_id`),
  KEY `idx_score_team` (`team_id`),
  CONSTRAINT `FK_750375E296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_750375E990BEA15` FOREIGN KEY (`criteria_id`) REFERENCES `criteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_750375EB7D66194` FOREIGN KEY (`judge_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores`
--

LOCK TABLES `scores` WRITE;
/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
INSERT INTO `scores` VALUES (1,10.00,NULL,10,3,1),(2,8.00,NULL,10,3,2),(3,9.00,NULL,10,3,3),(4,10.00,NULL,10,4,1),(5,10.00,NULL,10,4,2),(6,10.00,NULL,10,4,3),(7,6.00,NULL,10,5,1),(8,6.00,NULL,10,5,2),(9,6.00,NULL,10,5,3),(10,8.00,NULL,8,11,4),(11,8.00,NULL,8,11,5),(12,7.00,NULL,8,11,6),(13,6.00,NULL,8,12,4),(14,6.00,NULL,8,12,5),(15,7.00,NULL,8,12,6);
/*!40000 ALTER TABLE `scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_name` varchar(150) DEFAULT NULL,
  `description` longtext,
  `notes` longtext,
  `submitted_at` datetime DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `demo_video_url` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `contest_id` int NOT NULL DEFAULT '1',
  `project_avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_team_contest` (`team_id`,`contest_id`),
  CONSTRAINT `FK_3F6169F7296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,'MedAI - Hệ thống chẩn đoán hình ảnh và tiên lượng bệnh lý bằng Trí tuệ nhân tạo.','1. Vấn đề giải quyết:\r\nHiện nay, [nêu vấn đề thực tế, ví dụ: các bệnh viện đang quá tải trong việc chẩn đoán hình ảnh / nông dân gặp khó khăn trong việc kiểm soát dịch bệnh cây trồng]. Điều này dẫn đến [hậu quả: mất nhiều thời gian, chi phí cao, sai sót]. Dự án của chúng tôi giải quyết vấn đề này bằng cách tối ưu hóa quy trình và nâng cao độ chính xác.\r\n\r\n2. Giải pháp:\r\nChúng tôi phát triển một hệ thống [tên hệ thống/ứng dụng] cho phép [nêu tính năng chính, ví dụ: tự động phân tích ảnh X-quang và đưa ra cảnh báo sớm / tự động cập nhật độ ẩm đất và kích hoạt tưới tiêu]. Giải pháp giúp người dùng [lợi ích: tiết kiệm 50% thời gian, giảm thiểu rủi ro].\r\n\r\n3. Công nghệ sử dụng:\r\n\r\nFrontend: React Native / Flutter (Mobile), ReactJS / VueJS (Web).\r\n\r\nBackend: Python (FastAPI/Django) / Node.js.\r\n\r\nCông nghệ lõi / AI / IoT: TensorFlow, PyTorch, OpenCV, MQTT Protocol, phần cứng Arduino/ESP32.\r\n\r\nDatabase: PostgreSQL, MongoDB.',NULL,'2026-06-12 18:31:01',3,'https://github.com/ten-nhom-cua-ban/ten-du-an-seal2026','https://youtube.com/watch?v=abc123xyz',NULL,9,NULL),(2,'MedAI - Hệ thống chẩn đoán hình ảnh và tiên lượng bệnh lý bằng Trí tuệ nhân tạo.','nộp dự án',NULL,'2026-06-16 18:41:08',4,'https://github.com/ten-nhom-cua-ban/ten-du-an-seal2026','https://youtube.com/watch?v=abc123xyz','/uploads/submissions/9/team_4_Tu_______o____ng_nghi__a_trong_sa__ch_Cam_-_IELTS_To_____Linh_-_12_2_2025_1781635604.pdf',9,NULL),(3,'MedAI - Hệ thống chẩn đoán hình ảnh và tiên lượng bệnh lý bằng Trí tuệ nhân tạo.','uth3',NULL,'2026-06-16 19:46:56',5,'https://github.com/ten-nhom-cua-ban/ten-du-an-seal2026','https://youtube.com/watch?v=abc123xyz',NULL,9,NULL),(4,'Hệ thống Y tế AI (MediCare)','Giải pháp ứng dụng trí tuệ nhân tạo để chẩn đoán bệnh lý thông qua hình ảnh X-quang với độ chính xác trên 95%.',NULL,'2026-06-28 18:43:22',6,'https://github.com/teamalpha','https://youtube.com/medicare',NULL,11,NULL),(5,'EduChain - Bằng cấp điện tử','Nền tảng lưu trữ và xác thực văn bằng đại học sử dụng công nghệ Blockchain, chống làm giả tuyệt đối.',NULL,'2026-06-28 18:43:22',7,'https://github.com/blocktitans','',NULL,11,NULL),(6,'LearnSync - Học tập kết nối','Ứng dụng ghép cặp gia sư và học sinh dựa trên thói quen học tập và định hướng nghề nghiệp tương lai.',NULL,'2026-06-28 18:43:22',8,'https://github.com/innovators','https://youtube.com/learnsync',NULL,11,NULL),(7,'Hệ thống y tế','giải quyết các vấn đề y tế',NULL,'2026-07-02 16:58:01',11,'https://github.com/TrongPhucX5/BizFlowProject','https://www.youtube.com/watch?v=gR-WO1mvqtk&list=RDISAKquo_whg&index=6','/api/submissions/file/14/team_11_Tu_______o____ng_nghi__a_trong_sa__ch_Cam_-_IELTS_To_____Linh_-_12_2_2025_1783011481.pdf',14,NULL),(8,'Hệ thống chuẩn đoán hình ảnh AI','giúp chuẩn đoán hình ảnh bằng AI phân tích sức khẻo',NULL,'2026-07-03 08:39:11',12,'https://github.com/vanhieu251206/mobile-shop/blob/main/index.php','https://www.youtube.com/watch?v=ISAKquo_whg','/api/submissions/file/14/team_12_huong_dan_login_php_mysql_docker_code_1783067948.pdf',14,'/api/projects/avatar/project_14_12_1783074575.png');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_join_requests`
--

DROP TABLE IF EXISTS `team_join_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_join_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_tjr_team` (`team_id`),
  KEY `fk_tjr_user` (`user_id`),
  CONSTRAINT `fk_tjr_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tjr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_join_requests`
--

LOCK TABLES `team_join_requests` WRITE;
/*!40000 ALTER TABLE `team_join_requests` DISABLE KEYS */;
INSERT INTO `team_join_requests` VALUES (1,1,9,NULL,'PENDING','2026-06-16 18:39:31');
/*!40000 ALTER TABLE `team_join_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role_in_team` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_team_user` (`team_id`,`user_id`),
  KEY `idx_team_members_team_id` (`team_id`),
  KEY `idx_team_members_user_id` (`user_id`),
  CONSTRAINT `fk_team_members_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_team_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,1,4,'LEAD','2026-07-03 14:04:52'),(2,1,5,'MEMBER','2026-07-03 14:04:52'),(3,2,6,'LEAD','2026-07-03 14:04:52'),(4,3,7,'LEAD','2026-07-03 14:04:52'),(5,4,9,'LEAD','2026-07-03 14:04:52'),(6,5,11,'LEAD','2026-07-03 14:04:52'),(7,9,14,'LEAD','2026-07-03 14:04:52'),(8,10,15,'LEAD','2026-07-03 14:04:52'),(9,11,16,'LEAD','2026-07-03 14:04:52'),(10,12,17,'LEAD','2026-07-03 14:04:52'),(11,12,18,'MEMBER','2026-07-03 14:04:52');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `join_code` varchar(10) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'APPROVED',
  `max_members` int NOT NULL DEFAULT '5',
  `leader_id` int DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_96C22258E64D7D01` (`join_code`),
  UNIQUE KEY `UNIQ_96C222588FC28A7D` (`team_name`),
  KEY `IDX_96C2225873154ED4` (`leader_id`),
  KEY `idx_team_code` (`join_code`),
  CONSTRAINT `FK_96C2225873154ED4` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'UEF','AI & ML','UE2383','APPROVED',5,4,NULL),(2,'BKU','AI & ML','BK1346','APPROVED',5,6,NULL),(3,'UIT','Web Development','UI6189','APPROVED',5,7,NULL),(4,'UTH2','AI & ML','UT3768','APPROVED',5,9,NULL),(5,'UTH3','AI & ML','UT3579','APPROVED',5,11,NULL),(6,'Team Alpha','AI & ML','ALPHA123','active',5,1,NULL),(7,'Block Titans','Blockchain','TITAN123','active',5,1,NULL),(8,'Innovators','EdTech','INNOV123','active',5,1,NULL),(9,'Bạc Liêu','AI & ML','BẠ1989','APPROVED',5,14,NULL),(10,'Sóc Trăng','AI & ML','SÓ4839','APPROVED',5,15,NULL),(11,'Chung Sức','AI & ML','CH7607','APPROVED',5,16,NULL),(12,'huy','AI & ML','HU3862','APPROVED',5,17,'/api/teams/logo/team_12_1783074575.png');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'PARTICIPANT',
  `phone` varchar(15) DEFAULT NULL,
  `skills` longtext,
  `team_id` int DEFAULT NULL,
  `is_looking_for_team` tinyint(1) DEFAULT '0',
  `cv_summary` text,
  `cv_education` varchar(255) DEFAULT NULL,
  `cv_experience` text,
  `cv_portfolio_url` varchar(255) DEFAULT NULL,
  `cv_theme` varchar(30) DEFAULT 'ocean',
  `avatar_url` varchar(255) DEFAULT NULL,
  `date_of_birth` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_1483A5E9E7927C74` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Khiêm Lâm','admin@gmail.com','$2y$10$sCMOe2mqYu5oLAkcu8VGn..5KKbyEXUYhH1iQs2FIimW2P04n8IVW','PARTICIPANT',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(2,'Admin 1','admin2@gmail.com','$2y$10$DVaLzfjRI/P7M4SXt72wTu75VM/zZaVMwJOmUzaOnZoqXahjhawQu','ADMIN',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(3,'Quoc Danh','danh@gmail.com','$2y$10$TLhgxOftfwnhmzwLOjTnwe4OiYi0YUa.9k0BQGi9dYZfd1vShSsMe','PARTICIPANT',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(4,'Nguyen Van E','lamkhiem100305@gmail.com','$2y$10$BIA8vuh2eVrtpDPlcOtVE.WVqFd0I.f12NbuRI2NLMId3DvDFzR9q','PARTICIPANT',NULL,'Next.js, React, MySQL, Docker, Spring Boot, Python',1,1,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(5,'Nguyen Van F','lamkhiem100405@gmail.com','$2y$10$5k7vrvb4HGiG1UawRqOJP.jv8NiiofpnVmfB8QKMHkc.VwKgTROIe','PARTICIPANT',NULL,NULL,1,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(6,'Nguyễn Văn P','khiem@gmail.com','$2y$10$xxq36wt0omYEUq9fxl.X6O/TV2Lt6psfevIojoExe7v/MANjbwMJC','PARTICIPANT',NULL,'MySQL, React, Spring Boot, Python, Docker',2,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(7,'Nguyễn Văn A','khiem100705@gmail.com','$2y$10$0Lj4uQWYVDK4hWn1vsAtNe3V5D60ty2r5ZfXSgNPX6wwPCYpVHmL.','PARTICIPANT',NULL,'React, MySQL, PostgreSQL, Django, Python',3,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(8,'Admin Hệ Thống','admin1@gmail.com','$2y$10$W.AAB4MaV2AqEqnlagLDwOmAJ4MdVErgWSh1aJ8p96fs78rRAVexG','ADMIN',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(9,'Nguyen Van B','khiemlam10072005@gmail.com','$2y$10$QGQKiAeiaeErehG42kTH5.EvjhCH77MMhL3jw/pX8RK13E.m25F8S','PARTICIPANT',NULL,'Angular, Next.js, Docker, Spring Boot, Python',4,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(10,'Nguyen Quoc Danh','nguyenquocdanh@gmail.com','$2y$10$O4YgrDnIh1AyYKQEQ5O1lOHSvI2GH44oiaSVPCeSvsH4Eejj0gUGi','JUDGE',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(11,'Nguyen Van C','lamkhiem10062005@gmail.com','$2y$10$AV1SBO0K8o6TzNpS.B.7mODZb2goob34TsrqSOTjIDB/E5TFPpl1u','PARTICIPANT','0123456789','React, Next.js, Node.js, TypeScript, MySQL, Spring Boot, Python',5,0,'đang là sinh viên đại học giao thông vận tải','Học sinh THPT','dự án bizlow quản lý bán hàng food & store','https://github.com/lkhkvn','ocean',NULL,'2026-06-16'),(12,'test1','test1@test.com','$2y$10$93Wc3HPRFbBWXXY7XAQvLOviIpdCa0ydchPuhcJNbv/kZb6NMrrou','JUDGE',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(13,'mentor1','mentor1@gmail.com','$2y$10$IgJaYMDaH2/dTBMkiHf39ee0M8cdbHD/ZoIOn88E63uQ4PzrH4d3m','MENTOR',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(14,'khang','lamkhiem10032005@gmail.com','$2y$10$kXBJQtJHQ6siYDivpEXIe.TNqxeM.tkTQQdT7Dg7w9wWycuQCqFEC','PARTICIPANT',NULL,NULL,9,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(15,'kiên','lamkhiem10092005@gmail.com','$2y$10$DNAnwg.0.rbv2x.Dd2IK/ud.ILKZ4MtjixGFKBDU0JaFfTJbjyW92','PARTICIPANT',NULL,NULL,10,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(16,'trong','trong123@gmail.com','$2y$10$KKryZPks3/tNhRX/BR2OeeqxJo3h.mdbLsJYEN9X7tf9OBtWSa5US','PARTICIPANT',NULL,NULL,11,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(17,'huy','huy123@gmail.com','$2y$10$r05iWoZiIw8mRrVKd1uNTeYs9TQoqA72rPXV0M4D/OdZPHlbwHsca','PARTICIPANT',NULL,NULL,12,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL),(18,'hil','hil123@gmail.com','$2y$10$J8UlhBm.58VMTAeFvyiwceIEaFzzAg5QVuYy5F22qsmIQZTg8UBO.','PARTICIPANT',NULL,NULL,12,0,NULL,NULL,NULL,NULL,'ocean',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `hackathons`
--

/*!50001 DROP VIEW IF EXISTS `hackathons`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`clean_user`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `hackathons` AS select `c`.`id` AS `id`,`c`.`name` AS `name`,`c`.`category` AS `category`,`c`.`description` AS `description`,`c`.`location` AS `location`,`c`.`start_date` AS `start_date`,`c`.`end_date` AS `end_date`,`c`.`max_teams` AS `max_teams`,`c`.`prize` AS `prize`,`c`.`image` AS `image`,`c`.`status` AS `status`,`c`.`created_at` AS `created_at`,`c`.`schedule` AS `schedule`,`c`.`prize_details` AS `prize_details`,`c`.`rules` AS `rules`,`c`.`organizer` AS `organizer`,`c`.`registration_deadline` AS `registration_deadline`,`c`.`criteria` AS `criteria`,`c`.`submission_deadline` AS `submission_deadline`,count(`cr`.`id`) AS `registered_teams_count` from (`contests` `c` left join `contest_registrations` `cr` on((`c`.`id` = `cr`.`contest_id`))) group by `c`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07  1:04:41
