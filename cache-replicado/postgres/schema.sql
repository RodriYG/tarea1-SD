CREATE TABLE IF NOT EXISTS AIRPORTS (
    code varchar(3),
    name varchar(255)
);

CREATE INDEX code_index ON AIRPORTS (code);