SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `contests`;
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

