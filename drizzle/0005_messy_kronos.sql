CREATE TABLE `profile_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text,
	`target_slug` text NOT NULL,
	`reason` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null
);
