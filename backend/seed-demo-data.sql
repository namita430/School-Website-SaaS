-- Demo seed data for Demo Academy (school_id = 1), spread across the last 6
-- months so the dashboard's "content added" chart has something to show.
-- Not a Flyway migration - one-off demo data, run manually and safe to re-run
-- (each run adds more rows; delete first if you want a clean reset).

INSERT INTO notices (school_id, title, body, notice_date, pinned, created_at, updated_at) VALUES
(1, 'Admissions open for 2026-27', 'Applications for the new academic year are now open. Visit the office or apply online.', DATE_SUB(CURDATE(), INTERVAL 150 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 150 DAY), DATE_SUB(NOW(), INTERVAL 150 DAY)),
(1, 'Half-term holiday schedule', 'School will be closed from Oct 10 to Oct 17 for the half-term break.', DATE_SUB(CURDATE(), INTERVAL 120 DAY), FALSE, DATE_SUB(NOW(), INTERVAL 120 DAY), DATE_SUB(NOW(), INTERVAL 120 DAY)),
(1, 'Parent-teacher meeting', 'Quarterly parent-teacher meetings will be held in the main hall.', DATE_SUB(CURDATE(), INTERVAL 90 DAY), FALSE, DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 90 DAY)),
(1, 'Annual sports day', 'Join us for the annual sports day featuring track and field events for all grades.', DATE_SUB(CURDATE(), INTERVAL 60 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY)),
(1, 'Exam schedule released', 'The final exam schedule for all grades has been published on the notice board.', DATE_SUB(CURDATE(), INTERVAL 30 DAY), FALSE, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 'Library extended hours', 'The library will remain open until 6 PM on weekdays during exam season.', DATE_SUB(CURDATE(), INTERVAL 10 DAY), FALSE, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 'Winter uniform reminder', 'Students are reminded to switch to winter uniform starting next week.', DATE_SUB(CURDATE(), INTERVAL 2 DAY), FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY));

INSERT INTO events (school_id, title, description, event_date, location, created_at, updated_at) VALUES
(1, 'Science Fair', 'Students showcase their science projects to judges and parents.', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'Main Auditorium', DATE_SUB(NOW(), INTERVAL 140 DAY), DATE_SUB(NOW(), INTERVAL 140 DAY)),
(1, 'Cultural Day', 'A celebration of music, dance, and art from around the world.', DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'School Grounds', DATE_SUB(NOW(), INTERVAL 100 DAY), DATE_SUB(NOW(), INTERVAL 100 DAY)),
(1, 'Inter-school Debate', 'Demo Academy hosts the regional inter-school debate competition.', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Conference Hall', DATE_SUB(NOW(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),
(1, 'Alumni Meet', 'Annual gathering for alumni to reconnect and mentor current students.', DATE_ADD(CURDATE(), INTERVAL 70 DAY), 'Main Auditorium', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(1, 'Career Counselling Fair', 'Representatives from universities and industries guide graduating students.', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Main Hall', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

INSERT INTO news (school_id, title, body, published_date, created_at, updated_at) VALUES
(1, 'Demo Academy ranked top 10 in the region', 'We are proud to announce our ranking among the top schools this year.', DATE_SUB(CURDATE(), INTERVAL 130 DAY), DATE_SUB(NOW(), INTERVAL 130 DAY), DATE_SUB(NOW(), INTERVAL 130 DAY)),
(1, 'New science lab inaugurated', 'A state-of-the-art science lab was inaugurated by the district education officer.', DATE_SUB(CURDATE(), INTERVAL 80 DAY), DATE_SUB(NOW(), INTERVAL 80 DAY), DATE_SUB(NOW(), INTERVAL 80 DAY)),
(1, 'Students win national robotics competition', 'Our robotics team took first place at the national finals held in the capital.', DATE_SUB(CURDATE(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),
(1, 'Scholarship program launched', 'A new need-based scholarship program is now open for applications.', DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

INSERT INTO teachers (school_id, name, designation, bio, photo_url, created_at, updated_at) VALUES
(1, 'Sarah Johnson', 'Principal', 'Over 20 years of experience in academic leadership and curriculum development.', NULL, DATE_SUB(NOW(), INTERVAL 145 DAY), DATE_SUB(NOW(), INTERVAL 145 DAY)),
(1, 'Michael Chen', 'Head of Mathematics', 'Passionate about making mathematics accessible and engaging for every student.', NULL, DATE_SUB(NOW(), INTERVAL 110 DAY), DATE_SUB(NOW(), INTERVAL 110 DAY)),
(1, 'Priya Sharma', 'Science Coordinator', 'Leads the science department with a focus on hands-on, inquiry-based learning.', NULL, DATE_SUB(NOW(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 70 DAY)),
(1, 'David Okafor', 'Sports Director', 'Former national athlete, dedicated to building a strong sports culture at school.', NULL, DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),
(1, 'Emma Williams', 'English Teacher', 'Believes storytelling is the best way to teach language and critical thinking.', NULL, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1, 'Ravi Kumar', 'Computer Science Teacher', 'Introduces students to coding and robotics from an early age.', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY));

INSERT INTO gallery_items (school_id, caption, image_url, created_at, updated_at) VALUES
(1, 'Annual Day Celebration 2025', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800', DATE_SUB(NOW(), INTERVAL 125 DAY), DATE_SUB(NOW(), INTERVAL 125 DAY)),
(1, 'Science Fair Exhibits', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', DATE_SUB(NOW(), INTERVAL 95 DAY), DATE_SUB(NOW(), INTERVAL 95 DAY)),
(1, 'Sports Day Highlights', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 60 DAY)),
(1, 'New Library Wing', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 'Graduation Ceremony', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

INSERT INTO testimonials (school_id, author_name, author_role, quote, photo_url, created_at, updated_at) VALUES
(1, 'Anita Rao', 'Parent', 'Demo Academy has given my daughter both the academic foundation and confidence to thrive.', NULL, DATE_SUB(NOW(), INTERVAL 115 DAY), DATE_SUB(NOW(), INTERVAL 115 DAY)),
(1, 'James Miller', 'Alumnus, Class of 2019', 'The teachers here genuinely care about every student''s growth, not just grades.', NULL, DATE_SUB(NOW(), INTERVAL 65 DAY), DATE_SUB(NOW(), INTERVAL 65 DAY)),
(1, 'Fatima Noor', 'Parent', 'A wonderfully supportive environment with excellent extracurricular options.', NULL, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY));

INSERT INTO facilities (school_id, title, description, image_url, created_at, updated_at) VALUES
(1, 'Modern Science Labs', 'Fully equipped physics, chemistry, and biology labs for hands-on experiments.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', DATE_SUB(NOW(), INTERVAL 135 DAY), DATE_SUB(NOW(), INTERVAL 135 DAY)),
(1, 'Sports Complex', 'A multi-purpose sports complex with a football field, basketball courts, and a swimming pool.', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800', DATE_SUB(NOW(), INTERVAL 85 DAY), DATE_SUB(NOW(), INTERVAL 85 DAY)),
(1, 'Central Library', 'Over 20,000 books and a dedicated quiet study area for students of all ages.', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800', DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 42 DAY)),
(1, 'Computer Lab', 'A 40-seat computer lab with high-speed internet for coding and digital literacy classes.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));

INSERT INTO downloads (school_id, title, file_url, category, created_at, updated_at) VALUES
(1, 'Admission Form 2026-27', '/downloads/admission-form.pdf', 'Admissions', DATE_SUB(NOW(), INTERVAL 128 DAY), DATE_SUB(NOW(), INTERVAL 128 DAY)),
(1, 'Fee Structure', '/downloads/fee-structure.pdf', 'Fees', DATE_SUB(NOW(), INTERVAL 75 DAY), DATE_SUB(NOW(), INTERVAL 75 DAY)),
(1, 'Academic Calendar', '/downloads/academic-calendar.pdf', 'Academics', DATE_SUB(NOW(), INTERVAL 48 DAY), DATE_SUB(NOW(), INTERVAL 48 DAY)),
(1, 'School Handbook', '/downloads/handbook.pdf', 'General', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(1, 'Sports Day Permission Slip', '/downloads/sports-day-permission.pdf', 'Forms', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));
