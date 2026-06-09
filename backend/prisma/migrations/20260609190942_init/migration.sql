-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('student', 'supervisor', 'admin') NOT NULL DEFAULT 'student',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `supervisor_id` VARCHAR(191) NULL,
    `matric_number` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `faculty` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `school_email` VARCHAR(191) NULL,
    `organization_name` VARCHAR(191) NULL,
    `organization_address` VARCHAR(191) NULL,
    `organization_latitude` DOUBLE NULL,
    `organization_longitude` DOUBLE NULL,
    `industry_supervisor_name` VARCHAR(191) NULL,
    `training_start_date` DATETIME(3) NULL,
    `training_end_date` DATETIME(3) NULL,
    `passport_path` VARCHAR(191) NULL,
    `profile_complete` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_profiles_user_id_key`(`user_id`),
    UNIQUE INDEX `student_profiles_matric_number_key`(`matric_number`),
    INDEX `student_profiles_supervisor_id_idx`(`supervisor_id`),
    INDEX `student_profiles_matric_number_idx`(`matric_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logbook_weeks` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `week_number` INTEGER NOT NULL,
    `week_start_date` DATETIME(3) NOT NULL,
    `week_end_date` DATETIME(3) NOT NULL,
    `status` ENUM('draft', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `logbook_weeks_user_id_idx`(`user_id`),
    INDEX `logbook_weeks_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logbook_days` (
    `id` VARCHAR(191) NOT NULL,
    `logbook_week_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `day_name` VARCHAR(191) NOT NULL,
    `time_in` VARCHAR(191) NULL,
    `time_out` VARCHAR(191) NULL,
    `activity` TEXT NULL,
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `locked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `logbook_days_logbook_week_id_idx`(`logbook_week_id`),
    INDEX `logbook_days_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logbook_attachments` (
    `id` VARCHAR(191) NOT NULL,
    `logbook_day_id` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_type` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `logbook_attachments_logbook_day_id_idx`(`logbook_day_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weekly_reports` (
    `id` VARCHAR(191) NOT NULL,
    `logbook_week_id` VARCHAR(191) NOT NULL,
    `projects` TEXT NULL,
    `section_department` VARCHAR(191) NULL,
    `student_comment` TEXT NULL,
    `work_done` TEXT NULL,
    `review_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `reviewed_by` VARCHAR(191) NULL,
    `supervisor_comment` TEXT NULL,
    `supervisor_name` VARCHAR(191) NULL,
    `supervisor_rank` VARCHAR(191) NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `weekly_reports_logbook_week_id_key`(`logbook_week_id`),
    INDEX `weekly_reports_review_status_idx`(`review_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `logbook_day_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `check_in_time` DATETIME(3) NULL,
    `check_out_time` DATETIME(3) NULL,
    `check_in_latitude` DOUBLE NULL,
    `check_in_longitude` DOUBLE NULL,
    `check_in_address` VARCHAR(191) NULL,
    `check_out_latitude` DOUBLE NULL,
    `check_out_longitude` DOUBLE NULL,
    `check_out_address` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `device_info` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attendance_logs_logbook_day_id_key`(`logbook_day_id`),
    INDEX `attendance_logs_user_id_idx`(`user_id`),
    INDEX `attendance_logs_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `generated_by` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `summary` TEXT NOT NULL,
    `evaluation` TEXT NOT NULL,
    `strengths` JSON NOT NULL,
    `weaknesses` JSON NOT NULL,
    `recommendations` TEXT NOT NULL,
    `rating` DOUBLE NOT NULL,
    `tokens_used` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_reviews_student_id_idx`(`student_id`),
    INDEX `ai_reviews_month_year_idx`(`month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supervision_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `supervisor_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `scheduled_at` DATETIME(3) NOT NULL,
    `duration_minutes` INTEGER NOT NULL DEFAULT 30,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'jitsi',
    `room_name` VARCHAR(191) NOT NULL,
    `join_url` VARCHAR(191) NOT NULL,
    `status` ENUM('scheduled', 'completed', 'cancelled', 'missed') NOT NULL DEFAULT 'scheduled',
    `location_verified` BOOLEAN NOT NULL DEFAULT false,
    `student_joined_at` DATETIME(3) NULL,
    `supervisor_joined_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `supervision_sessions_room_name_key`(`room_name`),
    INDEX `supervision_sessions_supervisor_id_idx`(`supervisor_id`),
    INDEX `supervision_sessions_student_id_idx`(`student_id`),
    INDEX `supervision_sessions_scheduled_at_idx`(`scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_supervisor_id_fkey` FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logbook_weeks` ADD CONSTRAINT `logbook_weeks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logbook_days` ADD CONSTRAINT `logbook_days_logbook_week_id_fkey` FOREIGN KEY (`logbook_week_id`) REFERENCES `logbook_weeks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logbook_attachments` ADD CONSTRAINT `logbook_attachments_logbook_day_id_fkey` FOREIGN KEY (`logbook_day_id`) REFERENCES `logbook_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `weekly_reports` ADD CONSTRAINT `weekly_reports_logbook_week_id_fkey` FOREIGN KEY (`logbook_week_id`) REFERENCES `logbook_weeks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_logs` ADD CONSTRAINT `attendance_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_logs` ADD CONSTRAINT `attendance_logs_logbook_day_id_fkey` FOREIGN KEY (`logbook_day_id`) REFERENCES `logbook_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_reviews` ADD CONSTRAINT `ai_reviews_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_reviews` ADD CONSTRAINT `ai_reviews_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervision_sessions` ADD CONSTRAINT `supervision_sessions_supervisor_id_fkey` FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supervision_sessions` ADD CONSTRAINT `supervision_sessions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
