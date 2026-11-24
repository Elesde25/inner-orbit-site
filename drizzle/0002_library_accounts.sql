CREATE TABLE library_accounts (
 user_id TEXT PRIMARY KEY NOT NULL REFERENCES accounts(id),
 revision INTEGER NOT NULL DEFAULT 0,
 snapshot TEXT NOT NULL,
 updated INTEGER NOT NULL
);
