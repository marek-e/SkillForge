ALTER TABLE `skills` ADD `tags` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `scope` text DEFAULT 'general' NOT NULL;