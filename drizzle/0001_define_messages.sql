CREATE TABLE `messages` (
	`messageId` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`sender` text NOT NULL,
	`message` text NOT NULL,
	`messageCreated` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
