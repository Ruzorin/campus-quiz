PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`username` text NOT NULL,
	`xp` integer DEFAULT 0,
	`level` integer DEFAULT 1,
	`streak` integer DEFAULT 0,
	`last_active_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`microsoft_id` text,
	`avatar_url` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password_hash", "username", "xp", "level", "streak", "last_active_at", "microsoft_id", "avatar_url", "created_at") SELECT "id", "email", "password_hash", "username", "xp", "level", "streak", "last_active_at", "microsoft_id", "avatar_url", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_microsoft_id_unique` ON `users` (`microsoft_id`);