-- Schema migration for team membership support
-- Adds a normalized join table to manage users in teams.

CREATE TABLE IF NOT EXISTS `team_members` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `team_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `role_in_team` VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_team_user` (`team_id`, `user_id`),
    KEY `idx_team_members_team_id` (`team_id`),
    KEY `idx_team_members_user_id` (`user_id`),
    CONSTRAINT `fk_team_members_team` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_team_members_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes:
-- 1. `teams.leader_id` continues to reference the current team leader in `users`.
-- 2. `users.team_id` may be kept as a denormalized convenience column for legacy code,
--    but authoritative membership should be managed through `team_members`.
-- 3. A team leader should also have a corresponding row in `team_members` with `role_in_team = 'LEAD'`.
-- 4. Enforce max member count in application logic when inserting into `team_members`.
