CREATE TABLE `account_data` (
	`user_id` text PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`snapshot` text NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
