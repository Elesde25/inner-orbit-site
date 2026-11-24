CREATE TABLE `public_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`avatar_form` text,
	`share_name` integer DEFAULT 0 NOT NULL,
	`share_avatar` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `public_profiles_slug_unique` ON `public_profiles` (`slug`);