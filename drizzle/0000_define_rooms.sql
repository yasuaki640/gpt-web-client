CREATE TABLE `rooms` (
	`roomId` text PRIMARY KEY NOT NULL,
	`roomCreated` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`roomUpdated` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- added by me
CREATE TRIGGER IF NOT EXISTS rooms_updated
    AFTER UPDATE ON rooms
BEGIN
    UPDATE rooms
    SET roomUpdated = CURRENT_TIMESTAMP
    WHERE roomId = NEW.roomId;
END;