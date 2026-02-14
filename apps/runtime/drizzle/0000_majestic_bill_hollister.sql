CREATE TABLE IF NOT EXISTS `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`source_tool` text NOT NULL,
	`enabled_skills` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`input_schema` text,
	`output_schema` text,
	`implementation_ref` text,
	`source` text NOT NULL,
	`original_tool` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
