CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`hash` text NOT NULL,
	`salt` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);--> statement-breakpoint
CREATE TABLE `attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `journal` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`context` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
