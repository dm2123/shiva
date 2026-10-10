-- Payment Gateway Tables
-- Run: Get-Content schema_payments.sql | mysql -u root -p the-shiva

CREATE TABLE IF NOT EXISTS Payments (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(100) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  method ENUM('UPI','CARD','NETBANKING','WALLET','EMI','COD') NOT NULL,
  status ENUM('PENDING','PROCESSING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  razorpayOrderId VARCHAR(100),
  razorpayPaymentId VARCHAR(100),
  razorpaySignature VARCHAR(200),
  emiMonths INT,
  emiAmount DECIMAL(10,2),
  metadata JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES Users(id),
  FOREIGN KEY (courseId) REFERENCES Courses(id),
  INDEX idx_payments_student (studentId),
  INDEX idx_payments_order (orderId),
  INDEX idx_payments_status (status)
);
