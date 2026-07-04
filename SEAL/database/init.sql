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
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `resources` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `constraints` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `criteria_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `released_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submission_deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_contest_id` (`contest_id`),
  CONSTRAINT `fk_contest_problem` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`id`) ON DELETE CASCADE
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
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `registered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_contest_team` (`contest_id`,`team_id`),
  KEY `fk_cr_contest` (`contest_id`),
  KEY `fk_cr_team` (`team_id`),
  CONSTRAINT `fk_cr_contest` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cr_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest_registrations`
--

LOCK TABLES `contest_registrations` WRITE;
/*!40000 ALTER TABLE `contest_registrations` DISABLE KEYS */;
INSERT INTO `contest_registrations` (`id`, `contest_id`, `team_id`, `registered_at`) VALUES (1,9,1,'2026-06-08 08:32:07'),(2,9,2,'2026-06-08 14:49:46'),(3,9,5,'2026-06-21 18:24:19');
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
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `max_teams` int NOT NULL DEFAULT '50',
  `prize` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPCOMING' COMMENT 'UPCOMING | ACTIVE | COMPLETED | CANCELLED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `schedule` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `prize_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rules` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `organizer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_deadline` datetime DEFAULT NULL,
  `criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `submission_deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  CONSTRAINT `chk_dates` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contests`
--

LOCK TABLES `contests` WRITE;
/*!40000 ALTER TABLE `contests` DISABLE KEYS */;
INSERT INTO `contests` VALUES (9,'SEAL Innovat 2026','Education','Sân chơi công nghệ kịch tính dành cho các lập trình viên và nhà đổi mới tại TP.HCM. Hãy cùng 50 đội thi tài, bứt phá giới hạn và chinh phục giải thưởng hấp dẫn từ ngày 06/06 đến 26/06/2026!','TP. Hồ Chí Minh','2026-06-06 00:00:00','2026-06-26 00:00:00',50,'2000000','','ACTIVE','2026-06-05 18:11:54','• 06/06 - 12/06/2026: Mở cổng đăng ký trực tuyến & Ghép đội (Tối đa 50 đội).\n• 13/06/2026: Kick-off & Công bố đề bài chính thức.\n• 14/06 - 24/06/2026: Giai đoạn Coding & Mentoring (Các đội làm việc sản phẩm và nhận hướng dẫn từ chuyên gia).\n• 25/06/2026: Hạn chót nộp sản phẩm & Vòng sơ loại chọn ra Top 5/Top 10.\n• 26/06/2026: Vòng Chung kết (Demo Day) & Lễ trao giải trực tiếp tại TP. Hồ Chí Minh.','Tổng giá trị giải thưởng: 2.000.000 VNĐ cùng các phần quà hiện vật.\n\nCơ cấu giải thưởng chi tiết:\n• 01 Giải Nhất: 1.000.000 VNĐ + Chứng nhận Quán quân + Quà tặng từ Ban tổ chức.\n• 01 Giải Nhì: 600.000 VNĐ + Chứng nhận Á quân + Quà tặng từ Ban tổ chức.\n• 01 Giải Ba: 400.000 VNĐ + Chứng nhận giải Ba + Quà tặng từ Ban tổ chức.\n\nQuyền lợi chung: Tất cả các thí sinh tham gia hoàn thành sản phẩm đều được cấp Giấy chứng nhận điện tử (e-Certificate) từ cuộc thi.','Đối tượng: Tất cả các bạn trẻ, lập trình viên tại TP.HCM; tham gia theo đội từ 3 - 5 thành viên (Giới hạn tối đa 50 đội).\n\nYêu cầu sản phẩm: Sản phẩm phải được phát triển mới hoàn toàn trong thời gian thi (06/06 - 26/06/2026). Không sao chép, đạo nhái.\n\nThời hạn nộp bài: Trước ngày 25/06/2026 (Gồm mã nguồn sản phẩm và slide thuyết trình).\n\nTiêu chí chấm điểm:\n\nTính sáng tạo & thực tế (50%)\n\nHoàn thiện kỹ thuật & UI/UX (30%)\n\nKỹ năng thuyết trình chung kết (20%)\n\nQuy định chung: Quyết định của Ban giám khảo là quyết định cuối cùng. BTC có quyền sử dụng hình ảnh cuộc thi để truyền thông.',NULL,NULL,NULL,NULL),(10,'Mega Demo Hackathon (Realtime Demo)','Software Engineering','Cuộc thi \"Mega Demo Hackathon (Realtime Demo)\" là sân chơi thử nghiệm công nghệ nhằm kiểm tra khả năng phát triển giải pháp AI & ML trong thời gian giới hạn. Đây là cơ hội để các đội thi trình diễn tư duy giải quyết vấn đề bằng dữ liệu, tối ưu hóa thuật toán và xây dựng mô hình Realtime Demo (trình diễn trực tiếp) dưới áp lực thời gian. Cuộc thi tập trung vào việc tìm kiếm các ý tưởng đột phá và có tính khả thi cao trong thực tế.','TP. Hồ Chí Minh','2026-06-19 07:25:00','2026-06-19 08:25:00',50,'','','UPCOMING','2026-06-15 08:00:00','04:30 SA: Khai mạc, công bố đề bài chi tiết và bắt đầu thời gian làm bài (Coding time).\n\n06:30 SA: Hết giờ làm bài, các đội nộp sản phẩm và chuẩn bị tài liệu thuyết trình.\n\n06:45 SA: Vòng Demo trực tiếp (Mỗi đội có 3 phút thuyết trình và 2 phút Q&A với Ban giám khảo).\n\n07:15 SA: Ban giám khảo chấm điểm và họp kín.','01 Giải Nhất: 10,000,000 VNĐ + Chứng nhận từ Ban tổ chức.\n\n01 Giải Nhì: 5,000,000 VNĐ + Chứng nhận từ Ban tổ chức.\n\n01 Giải Ấn tượng (Dành cho đội có phần Realtime Demo xuất sắc nhất): 2,000,000 VNĐ.','1. Đối tượng tham gia\n\nCuộc thi mở rộng cho tất cả các cá nhân đam mê công nghệ, lập trình viên, học sinh, sinh viên và những người nghiên cứu trong lĩnh vực AI & ML.\n\nThí sinh tham gia theo đội, mỗi đội gồm từ 2 đến 5 thành viên. Cá nhân chưa có đội sẽ được Ban tổ chức hỗ trợ ghép đội trước giờ thi.\n\n2. Quy định về sản phẩm và công nghệ\n\nCác đội thi phải tự phát triển sản phẩm của mình trong khoảng thời gian quy định của cuộc thi. Không được sử dụng các sản phẩm hoặc mã nguồn đã được hoàn thiện từ trước.\n\nSản phẩm bắt buộc phải áp dụng các công nghệ, mô hình hoặc thuật toán liên quan đến Trí tuệ nhân tạo (AI) và Học máy (ML).\n\nTại vòng chung kết, sản phẩm phải chạy được phiên bản thử nghiệm trực tiếp (Realtime Demo) để Ban giám khảo đánh giá.\n\n3. Quy tắc ứng xử và bảo mật\n\nNghiêm cấm mọi hành vi gian lận, sao chép mã nguồn của đội khác hoặc sử dụng các hình thức tấn công mạng gây ảnh hưởng đến hệ thống thi đấu.\n\nCác đội tự chịu trách nhiệm về tính bản quyền đối với các thư viện mã nguồn mở hoặc dữ liệu bên ngoài được sử dụng trong bài thi.\n\nBan tổ chức có quyền sử dụng hình ảnh, thông tin sản phẩm của các đội thi cho mục đích truyền thông mà không cần trả thêm chi phí.\n\n4. Quyết định của Ban giám khảo\n\nKết quả chấm điểm dựa trên thang tiêu chí đã công bố và điểm số từ Ban giám khảo là quyết định cuối cùng.\n\nMọi khiếu nại phải được gửi tới Ban tổ chức trong vòng 10 phút sau khi công bố điểm thi của vòng Demo trực tiếp.','Bộ Khoa Học Công Nghệ','2026-06-24 23:59:00','Tính sáng tạo và đột phá của giải pháp (30%)\n\nKhả năng ứng dụng thực tế và tính khả thi (25%)\n\nKỹ thuật xây dựng mô hình AI/ML và tối ưu hóa thuật toán (25%)\n\nKỹ năng thuyết trình và chất lượng sản phẩm chạy thử (Realtime Demo) (20%)',NULL),(11,'Inovation Technology','Education','SEAL AI Innovation Challenge 2026 là cuộc thi lập trình chuyên sâu kéo dài 48 giờ do FPT Software phối hợp cùng mạng lưới SEAL tổ chức. Cuộc thi hướng tới mục tiêu tìm kiếm các giải pháp đột phá ứng dụng Trí tuệ nhân tạo (AI) và Học máy (Machine Learning) để giải quyết các bài toán nhức nhối trong 3 lĩnh vực trọng điểm: Y tế thông minh, Giáo dục cá nhân hoá và Bảo vệ môi trường.\n\nĐến với sự kiện, các đội thi sẽ có cơ hội được hướng dẫn trực tiếp (mentor) từ các chuyên gia AI hàng đầu trong ngành, tiếp cận với các API nội bộ và có cơ hội nhận được quỹ ươm tạo dự án lên tới 500 triệu đồng.','TP. Hồ Chí Minh','2026-06-25 00:10:00','2026-06-30 00:10:00',50,'','','UPCOMING','2026-06-21 17:10:56','Ngày 1:\n- 08:00 - 09:00: Check-in & Khai mạc sự kiện\n- 09:30: Công bố đề bài & Bắt đầu tính giờ 48h coding\n- 14:00 - 16:00: Mentoring Session 1 (Gặp gỡ cố vấn)\n\nNgày 2:\n- 09:00 - 11:00: Mentoring Session 2 (Chốt kiến trúc dự án)\n- 20:00: Mini-game giao lưu giải trí\n\nNgày 3:\n- 09:30: Hết hạn nộp bài (Đóng hệ thống submit)\n- 10:00 - 12:00: Chấm điểm Vòng sơ loại\n- 13:30 - 15:30: Top 10 Pitching trực tiếp trên sân khấu\n- 16:30 - 17:30: Công bố kết quả & Lễ trao giải','- 01 Giải Nhất (Champion): 100.000.000 VNĐ tiền mặt + Kỷ niệm chương + Gói Cloud AWS trị giá $5000\n- 01 Giải Nhì (Runner-up): 50.000.000 VNĐ tiền mặt + Kỷ niệm chương\n- 01 Giải Ba (Third Place): 20.000.000 VNĐ tiền mặt\n- 03 Giải Khuyến khích: 5.000.000 VNĐ/giải\n- 01 Giải \"Công nghệ Đột phá\" (Sponsor Choice): Màn hình Dell Ultrasharp cho từng thành viên.','1. ĐỐI TƯỢNG THAM GIA: \n- Là công dân Việt Nam hoặc sinh viên quốc tế đang học tập tại Việt Nam, độ tuổi từ 18 - 25.\n- Hình thức thi đấu theo đội, mỗi đội tối thiểu 3 thành viên và tối đa 5 thành viên (Bắt buộc có ít nhất 1 lập trình viên).\n\n2. QUY ĐỊNH VỀ SẢN PHẨM DỰ THI:\n- Các sản phẩm/dự án đem đến cuộc thi phải là ý tưởng mới hoặc sản phẩm chưa từng đạt giải tại các cuộc thi Hackathon/Techfest tương tự trước đây.\n- Mã nguồn (Source code) phải được viết trong khung thời gian 48h của chương trình, không sử dụng lại mã nguồn có sẵn trái phép hoặc vi phạm bản quyền (Cho phép dùng Open-source, APIs công khai và thư viện thư viện hỗ trợ).\n- Bắt buộc phải tích hợp ít nhất một thuật toán AI/Machine Learning vào sản phẩm cốt lõi.\n\n3. QUY ĐỊNH BẢO MẬT & BẢN QUYỀN:\n- Toàn bộ bản quyền tài sản trí tuệ của sản phẩm thuộc về Đội thi. Tuy nhiên Ban Tổ chức được quyền sử dụng hình ảnh/thông tin ý tưởng cho mục đích truyền thông.\n- Quyết định cuối cùng về việc chấm điểm và trao giải thuộc về Hội đồng Giám khảo.','FPT Software','2026-06-24 00:10:00','1. Tính sáng tạo và đột phá (30%): Ý tưởng có mới lạ, độc đáo và chưa từng có trên thị trường không?\n2. Khả năng ứng dụng thực tế (30%): Sản phẩm có giải quyết được vấn đề thực tiễn một cách khả thi và có tiềm năng mở rộng không?\n3. Mức độ hoàn thiện kỹ thuật (20%): Kiến trúc hệ thống, độ chính xác của model AI và tốc độ phản hồi.\n4. Trải nghiệm người dùng - UX/UI (10%): Giao diện thân thiện, dễ sử dụng.\n5. Kỹ năng thuyết trình - Pitching (10%): Trình bày mạch lạc, thuyết phục trước Hội đồng Giám khảo.',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `criteria`
--

LOCK TABLES `criteria` WRITE;
/*!40000 ALTER TABLE `criteria` DISABLE KEYS */;
INSERT INTO `criteria` VALUES (1,'Tính sáng tạo & thực tế',0.50,10),(2,'Hoàn thiện kỹ thuật & UI/UX',0.30,10),(3,'Kỹ năng thuyết trình chung kết',0.20,10);
/*!40000 ALTER TABLE `criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hackathons`
--

DROP TABLE IF EXISTS `hackathons`;

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
  `name` varchar(255) NOT NULL,
  `description` longtext,
  `dueDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestones`
--

LOCK TABLES `milestones` WRITE;
/*!40000 ALTER TABLE `milestones` DISABLE KEYS */;
INSERT INTO `milestones` VALUES (1,11,'thời gian phát đề bài ','','2026-06-23 00:52:00');
/*!40000 ALTER TABLE `milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `contest_id` int DEFAULT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CHALLENGE_RELEASED',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,9,'CHALLENGE_RELEASED','🚀 Cuộc thi \"SEAL Innovat 2026\" đã bắt đầu!','Đề bài đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!',0,'2026-06-09 13:59:09'),(2,5,9,'CHALLENGE_RELEASED','🚀 Cuộc thi \"SEAL Innovat 2026\" đã bắt đầu!','Đề bài đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!',0,'2026-06-09 13:59:09'),(3,6,9,'CHALLENGE_RELEASED','🚀 Cuộc thi \"SEAL Innovat 2026\" đã bắt đầu!','Đề bài đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!',0,'2026-06-09 13:59:09'),(4,7,9,'CHALLENGE_RELEASED','🚀 Cuộc thi \"SEAL Innovat 2026\" đã bắt đầu!','Đề bài \"Hệ thông y tế chăm sóc sức khẻo\" đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!',0,'2026-06-12 19:00:33'),(5,11,NULL,'PROJECT_SCORED','✅ Dự án đã được chấm điểm!','Dự án của đội UTH3 vừa được Giám khảo hoàn tất việc chấm điểm. Bạn có thể kiểm tra lại trên Bảng xếp hạng!',1,'2026-06-16 19:48:19');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
  `title` varchar(255) NOT NULL,
  `description` longtext,
  `startTime` datetime NOT NULL,
  `endTime` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores`
--

LOCK TABLES `scores` WRITE;
/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
INSERT INTO `scores` VALUES (1,10.00,NULL,10,3,1),(2,8.00,NULL,10,3,2),(3,9.00,NULL,10,3,3),(4,10.00,NULL,10,4,1),(5,10.00,NULL,10,4,2),(6,10.00,NULL,10,4,3),(7,6.00,NULL,10,5,1),(8,6.00,NULL,10,5,2),(9,6.00,NULL,10,5,3);
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_team_contest` (`team_id`,`contest_id`),
  CONSTRAINT `FK_3F6169F7296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,'MedAI - Hệ thống chẩn đoán hình ảnh và tiên lượng bệnh lý bằng Trí tuệ nhân tạo.','1. Vấn đề giải quyết:\r\nHiện nay, [nêu vấn đề thực tế, ví dụ: các bệnh viện đang quá tải trong việc chẩn đoán hình ảnh / nông dân gặp khó khăn trong việc kiểm soát dịch bệnh cây trồng]. Điều này dẫn đến [hậu quả: mất nhiều thời gian, chi phí cao, sai sót]. Dự án của chúng tôi giải quyết vấn đề này bằng cách tối ưu hóa quy trình và nâng cao độ chính xác.\r\n\r\n2. Giải pháp:\r\nChúng tôi phát triển một hệ thống [tên hệ thống/ứng dụng] cho phép [nêu tính năng chính, ví dụ: tự động phân tích ảnh X-quang và đưa ra cảnh báo sớm / tự động cập nhật độ ẩm đất và kích hoạt tưới tiêu]. Giải pháp giúp người dùng [lợi ích: tiết kiệm 50% thời gian, giảm thiểu rủi ro].\r\n\r\n3. Công nghệ sử dụng:\r\n\r\nFrontend: React Native / Flutter (Mobile), ReactJS / VueJS (Web).\r\n\r\nBackend: Python (FastAPI/Django) / Node.js.\r\n\r\nCông nghệ lõi / AI / IoT: TensorFlow, PyTorch, OpenCV, MQTT Protocol, phần cứng Arduino/ESP32.\r\n\r\nDatabase: PostgreSQL, MongoDB.',NULL,'2026-06-12 18:31:01',3,'https://github.com/ten-nhom-cua-ban/ten-du-an-seal2026','https://youtube.com/watch?v=abc123xyz',NULL,9),(2,'MedAI - Hệ thống chẩn đoán hình ảnh và tiên lượng bệnh lý bằng Trí tuệ nhân tạo.','nộp dự án',NULL,'2026-06-16 18:41:08',4,'https://github.com/ten-nhom-cua-ban/ten-du-an-seal2026','https://youtube.com/watch?v=abc123xyz','/uploads/submissions/9/team_4_Tu_______o____ng_nghi__a_trong_sa__ch_Cam_-_IELTS_To_____Linh_-_12_2_2025_1781635604.pdf',9),(3,'MedAI - Hệ thống chẩn đoán hình ảnh và tiên lượng bệnh lý bằng Trí tuệ nhân tạo.','uth3',NULL,'2026-06-16 19:46:56',5,'https://github.com/ten-nhom-cua-ban/ten-du-an-seal2026','https://youtube.com/watch?v=abc123xyz',NULL,9);
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
  `message` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
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
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role_in_team` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_team_user` (`team_id`,`user_id`),
  KEY `idx_team_members_team_id` (`team_id`),
  KEY `idx_team_members_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,1,4,'LEAD','2026-06-08 08:26:50'),(2,1,5,'MEMBER','2026-06-08 08:35:29'),(3,2,6,'LEAD','2026-06-08 14:49:32'),(4,3,7,'LEAD','2026-06-12 17:56:29'),(5,4,9,'LEAD','2026-06-16 18:40:09'),(6,5,11,'LEAD','2026-06-16 19:46:18');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_96C22258E64D7D01` (`join_code`),
  UNIQUE KEY `UNIQ_96C222588FC28A7D` (`team_name`),
  KEY `IDX_96C2225873154ED4` (`leader_id`),
  KEY `idx_team_code` (`join_code`),
  CONSTRAINT `FK_96C2225873154ED4` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'UEF','AI & ML','UE2383','APPROVED',5,4),(2,'BKU','AI & ML','BK1346','APPROVED',5,6),(3,'UIT','Web Development','UI6189','APPROVED',5,7),(4,'UTH2','AI & ML','UT3768','APPROVED',5,9),(5,'UTH3','AI & ML','UT3579','APPROVED',5,11);
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_1483A5E9E7927C74` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `skills`, `team_id`, `is_looking_for_team`, `cv_summary`, `cv_education`, `cv_experience`, `cv_portfolio_url`, `cv_theme`) VALUES (1,'Khiêm Lâm','admin@gmail.com','$2y$10$sCMOe2mqYu5oLAkcu8VGn..5KKbyEXUYhH1iQs2FIimW2P04n8IVW','PARTICIPANT',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean'),(2,'Admin 1','admin2@gmail.com','$2y$10$DVaLzfjRI/P7M4SXt72wTu75VM/zZaVMwJOmUzaOnZoqXahjhawQu','ADMIN',NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,'ocean'),(3,'Quoc Danh','danh@gmail.com','$2y$10$TLhgxOftfwnhmzwLOjTnwe4OiYi0YUa.9k0BQGi9dYZfd1vShSsMe','PARTICIPANT',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean'),(4,'Nguyen Van E','lamkhiem100305@gmail.com','$2y$10$BIA8vuh2eVrtpDPlcOtVE.WVqFd0I.f12NbuRI2NLMId3DvDFzR9q','PARTICIPANT',NULL,'Next.js, React, MySQL, Docker, Spring Boot, Python',1,1,NULL,NULL,NULL,NULL,'ocean'),(5,'Nguyen Van F','lamkhiem100405@gmail.com','$2y$10$5k7vrvb4HGiG1UawRqOJP.jv8NiiofpnVmfB8QKMHkc.VwKgTROIe','PARTICIPANT',NULL,NULL,1,0,NULL,NULL,NULL,NULL,'ocean'),(6,'Nguyễn Văn P','khiem@gmail.com','$2y$10$xxq36wt0omYEUq9fxl.X6O/TV2Lt6psfevIojoExe7v/MANjbwMJC','PARTICIPANT',NULL,'MySQL, React, Spring Boot, Python, Docker',2,0,NULL,NULL,NULL,NULL,'ocean'),(7,'Nguyễn Văn A','khiem100705@gmail.com','$2y$10$0Lj4uQWYVDK4hWn1vsAtNe3V5D60ty2r5ZfXSgNPX6wwPCYpVHmL.','PARTICIPANT',NULL,'React, MySQL, PostgreSQL, Django, Python',3,0,NULL,NULL,NULL,NULL,'ocean'),(8,'Admin Hệ Thống','admin1@gmail.com','$2y$10$W.AAB4MaV2AqEqnlagLDwOmAJ4MdVErgWSh1aJ8p96fs78rRAVexG','ADMIN',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean'),(9,'Nguyen Van B','khiemlam10072005@gmail.com','$2y$10$QGQKiAeiaeErehG42kTH5.EvjhCH77MMhL3jw/pX8RK13E.m25F8S','PARTICIPANT',NULL,'Angular, Next.js, Docker, Spring Boot, Python',4,0,NULL,NULL,NULL,NULL,'ocean'),(10,'Nguyen Quoc Danh','nguyenquocdanh@gmail.com','$2y$10$O4YgrDnIh1AyYKQEQ5O1lOHSvI2GH44oiaSVPCeSvsH4Eejj0gUGi','JUDGE',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean'),(11,'Nguyen Van C','lamkhiem10062005@gmail.com','$2y$10$AV1SBO0K8o6TzNpS.B.7mODZb2goob34TsrqSOTjIDB/E5TFPpl1u','PARTICIPANT',NULL,'React, Next.js, Node.js, TypeScript, MySQL, Spring Boot, Python',5,0,NULL,NULL,NULL,NULL,'ocean'),(12,'test1','test1@test.com','$2y$10$93Wc3HPRFbBWXXY7XAQvLOviIpdCa0ydchPuhcJNbv/kZb6NMrrou','JUDGE',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean'),(13,'mentor1','mentor1@gmail.com','$2y$10$IgJaYMDaH2/dTBMkiHf39ee0M8cdbHD/ZoIOn88E63uQ4PzrH4d3m','MENTOR',NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'ocean');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestones`
--

DROP TABLE IF EXISTS `milestones`;
CREATE TABLE `milestones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hackathon_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_milestone_hackathon` (`hackathon_id`),
  CONSTRAINT `fk_milestone_contest` FOREIGN KEY (`hackathon_id`) REFERENCES `contests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hackathon_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_schedule_hackathon` (`hackathon_id`),
  CONSTRAINT `fk_schedule_contest` FOREIGN KEY (`hackathon_id`) REFERENCES `contests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- View structure for view `hackathons`
--

DROP VIEW IF EXISTS `hackathons`;
CREATE VIEW `hackathons` AS SELECT * FROM `contests`;

--
-- Table structure for table `admin_activity_logs`
--

DROP TABLE IF EXISTS `admin_activity_logs`;
CREATE TABLE `admin_activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` int DEFAULT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_admin` (`admin_id`),
  CONSTRAINT `fk_log_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-23  5:21:11

-- Custom Patches to align with Backend code models
ALTER TABLE `contests` ADD COLUMN `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `avatar_url` varchar(255) DEFAULT NULL, ADD COLUMN `date_of_birth` varchar(10) DEFAULT NULL;
