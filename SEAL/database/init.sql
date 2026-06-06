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
-- Table structure for table `contests`
--

DROP TABLE IF EXISTS `contests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `max_teams` int NOT NULL DEFAULT '50',
  `prize` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPCOMING' COMMENT 'UPCOMING | ACTIVE | COMPLETED | CANCELLED',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `schedule` text COLLATE utf8mb4_unicode_ci,
  `prize_details` text COLLATE utf8mb4_unicode_ci,
  `rules` text COLLATE utf8mb4_unicode_ci,
  `organizer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_deadline` date DEFAULT NULL,
  `criteria` text COLLATE utf8mb4_unicode_ci,
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
INSERT INTO `contests` VALUES (9,'SEAL Innovat 2026','Education','\"S├ón ch╞íi c├┤ng nghß╗ç kß╗ïch t├¡nh d├ánh cho c├íc lß║¡p tr├¼nh vi├¬n v├á nh├á ─æß╗òi mß╗¢i tß║íi TP.HCM. H├úy c├╣ng 50 ─æß╗Öi thi t├ái, bß╗⌐t ph├í giß╗¢i hß║ín v├á chinh phß╗Ñc giß║úi th╞░ß╗ƒng hß║Ñp dß║½n tß╗½ ng├áy 06/06 ─æß║┐n 26/06/2026!\"','TP. Hß╗ô Ch├¡ Minh','2026-06-06','2026-06-26',50,'2000000','','UPCOMING','2026-06-05 18:11:54','ΓÇó 06/06 - 12/06/2026: Mß╗ƒ cß╗òng ─æ─âng k├╜ trß╗▒c tuyß║┐n & Gh├⌐p ─æß╗Öi (Tß╗æi ─æa 50 ─æß╗Öi).\nΓÇó 13/06/2026: Kick-off & C├┤ng bß╗æ ─æß╗ü b├ái ch├¡nh thß╗⌐c.\nΓÇó 14/06 - 24/06/2026: Giai ─æoß║ín Coding & Mentoring (C├íc ─æß╗Öi l├ám viß╗çc sß║ún phß║⌐m v├á nhß║¡n h╞░ß╗¢ng dß║½n tß╗½ chuy├¬n gia).\nΓÇó 25/06/2026: Hß║ín ch├│t nß╗Öp sß║ún phß║⌐m & V├▓ng s╞í loß║íi chß╗ìn ra Top 5/Top 10.\nΓÇó 26/06/2026: V├▓ng Chung kß║┐t (Demo Day) & Lß╗à trao giß║úi trß╗▒c tiß║┐p tß║íi TP. Hß╗ô Ch├¡ Minh.','Tß╗òng gi├í trß╗ï giß║úi th╞░ß╗ƒng: 2.000.000 VN─É c├╣ng c├íc phß║ºn qu├á hiß╗çn vß║¡t.\n\nC╞í cß║Ñu giß║úi th╞░ß╗ƒng chi tiß║┐t:\nΓÇó 01 Giß║úi Nhß║Ñt: 1.000.000 VN─É + Chß╗⌐ng nhß║¡n Qu├ín qu├ón + Qu├á tß║╖ng tß╗½ Ban tß╗ò chß╗⌐c.\nΓÇó 01 Giß║úi Nh├¼: 600.000 VN─É + Chß╗⌐ng nhß║¡n ├ü qu├ón + Qu├á tß║╖ng tß╗½ Ban tß╗ò chß╗⌐c.\nΓÇó 01 Giß║úi Ba: 400.000 VN─É + Chß╗⌐ng nhß║¡n giß║úi Ba + Qu├á tß║╖ng tß╗½ Ban tß╗ò chß╗⌐c.\n\nQuyß╗ün lß╗úi chung: Tß║Ñt cß║ú c├íc th├¡ sinh tham gia ho├án th├ánh sß║ún phß║⌐m ─æß╗üu ─æ╞░ß╗úc cß║Ñp Giß║Ñy chß╗⌐ng nhß║¡n ─æiß╗çn tß╗¡ (e-Certificate) tß╗½ cuß╗Öc thi.','─Éß╗æi t╞░ß╗úng: Tß║Ñt cß║ú c├íc bß║ín trß║╗, lß║¡p tr├¼nh vi├¬n tß║íi TP.HCM; tham gia theo ─æß╗Öi tß╗½ 3 - 5 th├ánh vi├¬n (Giß╗¢i hß║ín tß╗æi ─æa 50 ─æß╗Öi).\n\nY├¬u cß║ºu sß║ún phß║⌐m: Sß║ún phß║⌐m phß║úi ─æ╞░ß╗úc ph├ít triß╗ân mß╗¢i ho├án to├án trong thß╗¥i gian thi (06/06 - 26/06/2026). Kh├┤ng sao ch├⌐p, ─æß║ío nh├íi.\n\nThß╗¥i hß║ín nß╗Öp b├ái: Tr╞░ß╗¢c ng├áy 25/06/2026 (Gß╗ôm m├ú nguß╗ôn sß║ún phß║⌐m v├á slide thuyß║┐t tr├¼nh).\n\nTi├¬u ch├¡ chß║Ñm ─æiß╗âm:\n\nT├¡nh s├íng tß║ío & thß╗▒c tß║┐ (50%)\n\nHo├án thiß╗çn kß╗╣ thuß║¡t & UI/UX (30%)\n\nKß╗╣ n─âng thuyß║┐t tr├¼nh chung kß║┐t (20%)\n\nQuy ─æß╗ïnh chung: Quyß║┐t ─æß╗ïnh cß╗ºa Ban gi├ím khß║úo l├á quyß║┐t ─æß╗ïnh cuß╗æi c├╣ng. BTC c├│ quyß╗ün sß╗¡ dß╗Ñng h├¼nh ß║únh cuß╗Öc thi ─æß╗â truyß╗ün th├┤ng.',NULL,NULL,NULL);
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
  `leader_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_96C22258E64D7D01` (`join_code`),
  UNIQUE KEY `UNIQ_96C222588FC28A7D` (`team_name`),
  KEY `IDX_96C2225873154ED4` (`leader_id`),
  KEY `idx_team_code` (`join_code`),
  CONSTRAINT `FK_96C2225873154ED4` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_1483A5E9E7927C74` (`email`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Khi├¬m L├óm','admin@gmail.com','$2y$10$sCMOe2mqYu5oLAkcu8VGn..5KKbyEXUYhH1iQs2FIimW2P04n8IVW','PARTICIPANT',NULL,NULL,NULL,0),(2,'Admin 1','admin1@gmail.com','$2y$10$DVaLzfjRI/P7M4SXt72wTu75VM/zZaVMwJOmUzaOnZoqXahjhawQu','ADMIN',NULL,NULL,NULL,0),(3,'Quoc Danh','danh@gmail.com','$2y$10$TLhgxOftfwnhmzwLOjTnwe4OiYi0YUa.9k0BQGi9dYZfd1vShSsMe','PARTICIPANT',NULL,NULL,NULL,0);
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

-- Dump completed on 2026-06-06 17:56:44
