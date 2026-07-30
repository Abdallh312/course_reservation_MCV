-- ============================================================
-- Course Reservation System - Microsoft SQL Server (T-SQL) Script
-- ============================================================

-- 1. Create Database if it does not exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'course_reservation_system')
BEGIN
    CREATE DATABASE course_reservation_system;
END
GO

USE course_reservation_system;
GO

-- 2. Departments Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
BEGIN
    CREATE TABLE Departments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL
    );
END
GO

-- 3. Buildings Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Buildings')
BEGIN
    CREATE TABLE Buildings (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Address NVARCHAR(255) NULL
    );
END
GO

-- 4. Rooms Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Rooms')
BEGIN
    CREATE TABLE Rooms (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        BuildingId INT NOT NULL,
        Capacity INT NULL,
        CONSTRAINT FK_Rooms_Buildings FOREIGN KEY (BuildingId) REFERENCES Buildings(Id) ON DELETE CASCADE
    );
END
GO

-- 5. Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(MAX) NOT NULL DEFAULT '',
        Role NVARCHAR(50) NOT NULL DEFAULT 'Student',
        Status NVARCHAR(50) NOT NULL DEFAULT 'Approved'
    );
END
GO

-- 6. Courses Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Courses')
BEGIN
    CREATE TABLE Courses (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        DepartmentId INT NOT NULL,
        BuildingId INT NOT NULL,
        RoomId INT NOT NULL,
        Date DATETIME2 NOT NULL,
        CONSTRAINT FK_Courses_Departments FOREIGN KEY (DepartmentId) REFERENCES Departments(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Courses_Buildings FOREIGN KEY (BuildingId) REFERENCES Buildings(Id),
        CONSTRAINT FK_Courses_Rooms FOREIGN KEY (RoomId) REFERENCES Rooms(Id)
    );
END
GO

-- 7. Reservations Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reservations')
BEGIN
    CREATE TABLE Reservations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        CourseId INT NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'pending',
        RequestDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Reservations_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Reservations_Courses FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE
    );
END
GO
