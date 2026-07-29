CREATE DATABASE course_reservation_system;
USE course_reservation_system;

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255)
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    building_id INT NOT NULL,
    capacity INT,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id INT NOT NULL,
    building_id INT NOT NULL,
    room_id INT NOT NULL,
    course_date DATETIME NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
