CREATE TABLE `messages` (
	`messageId` text PRIMARY KEY NOT NULL,
	`roomId` text NOT NULL,
	`sender` text NOT NULL,
	`message` text NOT NULL,
	`messageCreated` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- added by me
CREATE TRIGGER IF NOT EXISTS messages_updated
    AFTER INSERT ON messages
BEGIN
    UPDATE rooms
    SET roomUpdated = CURRENT_TIMESTAMP
    WHERE roomId = NEW.roomId;
END;