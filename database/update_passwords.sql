UPDATE users SET password_hash = '$2a$10$NgCqN0U3e/Vi.OnPh5ZqNu2RFsV8lDI0RzKJnqF3yFZbNKLBWpuwa' WHERE id = 1;
UPDATE users SET password_hash = '$2a$10$uhVVriEJ6dTbZB2E9zSkauZtimC2vfjPGmS2VFt6fpgbKJr/qT2xG' WHERE id = 2;
UPDATE users SET password_hash = '$2a$10$o1wfqhzyZrf4ypL9ZwU08OrkuPMfXdKTgudP6ShUh2DL4GY23WE1K' WHERE id = 3;
SELECT id, name, mobile, role FROM users;
