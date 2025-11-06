BEGIN TRANSACTION;
INSERT INTO users (name, email, password, role, location, organization, avatar) VALUES
('Asha Verma', 'asha@agriplatform.com', 'admin123', 'admin', 'Delhi, India', 'Farming Platform', NULL),
('Ravi Kumar', 'ravi@farmers.com', 'farmer123', 'farmer', 'Punjab, India', 'Green Fields Cooperative', NULL),
('Meera Singh', 'meera@experts.com', 'expert123', 'expert', 'Maharashtra, India', 'AgriCare Advisory', NULL),
('Neha Patel', 'neha@public.com', 'public123', 'public', 'Gujarat, India', 'Community Volunteer', NULL);
INSERT INTO sectors (name, type, contact, region, description) VALUES
('AgroBank', 'Finance', 'contact@agrobank.com', 'National', 'Micro-financing and crop insurance services'),
('Harvest Logistics', 'Logistics', 'support@harvestlogistics.com', 'North India', 'Cold chain and transportation partners'),
('Seed Innovators', 'Technology', 'hello@seedinnovators.com', 'West India', 'R&D for climate resilient seeds');
INSERT INTO resources (title, category, description, link, created_by) VALUES
('Organic Pest Management Guide', 'Guides', 'Comprehensive practices for natural pest control', 'https://example.com/pest-guide.pdf', 3),
('Crop Insurance Subsidy Form', 'Finance', 'Latest application form for insurance subsidy', 'https://example.com/insurance-form.pdf', 1),
('Soil Testing Labs Directory', 'Data', 'Verified labs and contact information', 'https://example.com/soil-labs', 1);
INSERT INTO content (title, body, tags, author_id, audience) VALUES
('Soil Health Matters', 'Healthy soil is the foundation of resilient farming...', 'soil,health', 3, 'farmer'),
('Upcoming Government Schemes', 'Key schemes for the upcoming season...', 'policy,finance', 1, 'farmer,public'),
('Sustainable Irrigation Techniques', 'Best practices and technology references...', 'water,technology', 3, 'farmer,expert');
INSERT INTO forums (title, description, created_by, sector) VALUES
('Drought Management Strategies', 'Share tips on mitigating drought impact', 3, 'Technology'),
('Accessing Seasonal Loans', 'Discuss available finance options', 1, 'Finance');
INSERT INTO forum_posts (forum_id, author_id, body) VALUES
(1, 2, 'We are testing solar-powered drip irrigation this season.'),
(1, 3, 'Ensure to monitor soil moisture levels daily.'),
(2, 2, 'What documents are needed for AgroBank microloans?'),
(2, 1, 'You will need land ownership proof and cropping plan.');
INSERT INTO sector_connections (user_id, sector_id, status, notes) VALUES
(2, 1, 'approved', 'Loan sanctioned, awaiting disbursal'),
(2, 2, 'pending', 'Proposal submitted for logistics support'),
(2, 3, 'in_discussion', 'Piloting new seed variety');
INSERT INTO events (name, description, start_date, end_date, location, sector_id, created_by) VALUES
('Kharif Crop Planning Workshop', 'Interactive session with experts on crop planning', '2025-06-01', '2025-06-02', 'Chandigarh', 3, 3),
('Farmer Finance Literacy Camp', 'Camp to support farmers with finance planning', '2025-07-15', '2025-07-15', 'Ludhiana', 1, 1);
INSERT INTO notifications (user_id, title, message, level) VALUES
(2, 'Upcoming event', 'Join the Kharif Crop Planning Workshop next week.', 'info'),
(2, 'Connection update', 'Seed Innovators marked your request as in discussion.', 'success');
COMMIT;
