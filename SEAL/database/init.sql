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
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `resources` text COLLATE utf8mb4_unicode_ci,
  `constraints` text COLLATE utf8mb4_unicode_ci,
  `criteria_json` text COLLATE utf8mb4_unicode_ci,
  `released_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_contest_id` (`contest_id`),
  CONSTRAINT `fk_contest_problem` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest_problems`
--

LOCK TABLES `contest_problems` WRITE;
/*!40000 ALTER TABLE `contest_problems` DISABLE KEYS */;
INSERT INTO `contest_problems` VALUES (1,9,'Hệ thông y tế chăm sóc sức khẻo','Thí sinh cần thiết kế và phát triển một Hệ thống Web Chăm sóc Sức khỏe (Healthcare Web System) thông minh, giải quyết được ít nhất một hoặc kết hợp các bài toán cốt lõi sau:\n\nQuản lý & Theo dõi: Giúp người dùng theo dõi chỉ số sức khỏe cá nhân (nhịp tim, cân nặng, giấc ngủ, lịch sử bệnh lý) bằng biểu đồ trực quan.\n\nKết nối y tế: Hệ thống đặt lịch khám bệnh trực tuyến, tư vấn từ xa (Telehealth) giữa bác sĩ và bệnh nhân.\n\nỨng dụng AI/Thông minh (Khuyến khích): Tích hợp chatbot AI hỗ trợ sàng lọc triệu chứng ban đầu, gợi ý thực đơn dinh dưỡng hoặc nhắc nhở uống thuốc tự động.','https://www.google.com/search?q=w3schools&oq=w3&gs_lcrp=EgZjaHJvbWUqCggBEAAYsQMYgAQyBggAEEUYOTIKCAEQABixAxiABDIKCAIQABixAxiABDINCAMQLhjHARjRAxiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDIHCAkQABiABNIBCDI5NzNqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8','Sử dụng docker, React, springbot','[{\"name\":\"Sáng Tạo \",\"weight\":35}]','2026-06-09 14:10:54','2026-06-09 14:10:39',NULL,NULL);
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
  `registered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_contest_team` (`contest_id`,`team_id`),
  KEY `fk_cr_contest` (`contest_id`),
  KEY `fk_cr_team` (`team_id`),
  CONSTRAINT `fk_cr_contest` FOREIGN KEY (`contest_id`) REFERENCES `contests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cr_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contest_registrations`
--

LOCK TABLES `contest_registrations` WRITE;
/*!40000 ALTER TABLE `contest_registrations` DISABLE KEYS */;
INSERT INTO `contest_registrations` VALUES (1,9,1,'2026-06-08 08:32:07'),(2,9,2,'2026-06-08 14:49:46');
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
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `max_teams` int NOT NULL DEFAULT '50',
  `prize` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPCOMING' COMMENT 'UPCOMING | ACTIVE | COMPLETED | CANCELLED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `schedule` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `prize_details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rules` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `organizer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_deadline` date DEFAULT NULL,
  `criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  CONSTRAINT `chk_dates` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contests`
--

LOCK TABLES `contests` WRITE;
/*!40000 ALTER TABLE `contests` DISABLE KEYS */;
INSERT INTO `contests` VALUES (9,'SEAL Innovat 2026','Education','Sân chơi công nghệ kịch tính dành cho các lập trình viên và nhà đổi mới tại TP.HCM. Hãy cùng 50 đội thi tài, bứt phá giới hạn và chinh phục giải thưởng hấp dẫn từ ngày 06/06 đến 26/06/2026!','TP. Hồ Chí Minh','2026-06-06','2026-06-26',50,'2000000','','ACTIVE','2026-06-05 18:11:54','• 06/06 - 12/06/2026: Mở cổng đăng ký trực tuyến & Ghép đội (Tối đa 50 đội).\n• 13/06/2026: Kick-off & Công bố đề bài chính thức.\n• 14/06 - 24/06/2026: Giai đoạn Coding & Mentoring (Các đội làm việc sản phẩm và nhận hướng dẫn từ chuyên gia).\n• 25/06/2026: Hạn chót nộp sản phẩm & Vòng sơ loại chọn ra Top 5/Top 10.\n• 26/06/2026: Vòng Chung kết (Demo Day) & Lễ trao giải trực tiếp tại TP. Hồ Chí Minh.','Tổng giá trị giải thưởng: 2.000.000 VNĐ cùng các phần quà hiện vật.\n\nCơ cấu giải thưởng chi tiết:\n• 01 Giải Nhất: 1.000.000 VNĐ + Chứng nhận Quán quân + Quà tặng từ Ban tổ chức.\n• 01 Giải Nhì: 600.000 VNĐ + Chứng nhận Á quân + Quà tặng từ Ban tổ chức.\n• 01 Giải Ba: 400.000 VNĐ + Chứng nhận giải Ba + Quà tặng từ Ban tổ chức.\n\nQuyền lợi chung: Tất cả các thí sinh tham gia hoàn thành sản phẩm đều được cấp Giấy chứng nhận điện tử (e-Certificate) từ cuộc thi.','Đối tượng: Tất cả các bạn trẻ, lập trình viên tại TP.HCM; tham gia theo đội từ 3 - 5 thành viên (Giới hạn tối đa 50 đội).\n\nYêu cầu sản phẩm: Sản phẩm phải được phát triển mới hoàn toàn trong thời gian thi (06/06 - 26/06/2026). Không sao chép, đạo nhái.\n\nThời hạn nộp bài: Trước ngày 25/06/2026 (Gồm mã nguồn sản phẩm và slide thuyết trình).\n\nTiêu chí chấm điểm:\n\nTính sáng tạo & thực tế (50%)\n\nHoàn thiện kỹ thuật & UI/UX (30%)\n\nKỹ năng thuyết trình chung kết (20%)\n\nQuy định chung: Quyết định của Ban giám khảo là quyết định cuối cùng. BTC có quyền sử dụng hình ảnh cuộc thi để truyền thông.',NULL,NULL,NULL);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `criteria`
--

LOCK TABLES `criteria` WRITE;
/*!40000 ALTER TABLE `criteria` DISABLE KEYS */;
/*!40000 ALTER TABLE `criteria` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `contest_id` int DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CHALLENGE_RELEASED',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,9,'CHALLENGE_RELEASED','🚀 Cuộc thi \"SEAL Innovat 2026\" đã bắt đầu!','Đề bài đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!',0,'2026-06-09 13:59:09'),(2,5,9,'CHALLENGE_RELEASED','🚀 Cuộc thi \"SEAL Innovat 2026\" đã bắt đầu!','Đề bài đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!',0,'2026-06-09 13:59:09'),(3,6,9,'CHALLENGE_RELEASED','🚀 Cuộc thi \"SEAL Innovat 2026\" đã bắt đầu!','Đề bài đã được phát chính thức. Hãy vào trang cuộc thi để xem ngay!',0,'2026-06-09 13:59:09');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores`
--

LOCK TABLES `scores` WRITE;
/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_3F6169F7296CD8AE` (`team_id`),
  CONSTRAINT `FK_3F6169F7296CD8AE` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
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
  KEY `idx_team_members_user_id` (`user_id`),
  CONSTRAINT `fk_team_members_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_team_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (1,1,4,'LEAD','2026-06-08 08:26:50'),(2,1,5,'MEMBER','2026-06-08 08:35:29'),(3,2,6,'LEAD','2026-06-08 14:49:32');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_join_requests`
--

DROP TABLE IF EXISTS `team_join_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_join_requests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `team_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `message` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tjr_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tjr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_join_requests`
--

LOCK TABLES `team_join_requests` WRITE;
/*!40000 ALTER TABLE `team_join_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_join_requests` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'UEF','AI & ML','UE2383','APPROVED',5,4),(2,'BKU','AI & ML','BK1346','APPROVED',5,6);
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
  `cv_summary` text DEFAULT NULL,
  `cv_education` varchar(255) DEFAULT NULL,
  `cv_experience` text DEFAULT NULL,
  `cv_portfolio_url` varchar(255) DEFAULT NULL,
  `cv_theme` varchar(30) DEFAULT 'ocean',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_1483A5E9E7927C74` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Khiêm Lâm','admin@gmail.com','$2y$10$sCMOe2mqYu5oLAkcu8VGn..5KKbyEXUYhH1iQs2FIimW2P04n8IVW','PARTICIPANT',NULL,NULL,NULL,0),(2,'Admin 1','admin1@gmail.com','$2y$10$DVaLzfjRI/P7M4SXt72wTu75VM/zZaVMwJOmUzaOnZoqXahjhawQu','ADMIN',NULL,NULL,NULL,1),(3,'Quoc Danh','danh@gmail.com','$2y$10$TLhgxOftfwnhmzwLOjTnwe4OiYi0YUa.9k0BQGi9dYZfd1vShSsMe','PARTICIPANT',NULL,NULL,NULL,0),(4,'Nguyen Van E','lamkhiem100305@gmail.com','$2y$10$BIA8vuh2eVrtpDPlcOtVE.WVqFd0I.f12NbuRI2NLMId3DvDFzR9q','PARTICIPANT',NULL,'Next.js, React, MySQL, Docker, Spring Boot, Python',1,1),(5,'Nguyen Van F','lamkhiem100405@gmail.com','$2y$10$5k7vrvb4HGiG1UawRqOJP.jv8NiiofpnVmfB8QKMHkc.VwKgTROIe','PARTICIPANT',NULL,NULL,1,0),(6,'Nguyễn Văn P','khiem@gmail.com','$2y$10$xxq36wt0omYEUq9fxl.X6O/TV2Lt6psfevIojoExe7v/MANjbwMJC','PARTICIPANT',NULL,'MySQL, React, Spring Boot, Python, Docker',2,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-09 14:16:07
