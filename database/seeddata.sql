USE kisanmitra;

INSERT INTO admins
(name, email, password_hash, phone, is_active)
VALUES

(
    'KisanMitra Admin',
    'admin@kisanmitra.in',
    '$2b$12$ZnXr7mmtgkBPk.fvPqu3U.ualgtwpGqZIf7guKrGeaUgZ7DCxWzr6',
    '9876543210',
    TRUE
),

(
    'Operations Manager',
    'operations@kisanmitra.in',
    '$2b$12$N8v4c2yqCWx3g8kO8Kg6zP7nLzZk7w8q9r0s1t2u3v4w5x6y7z8',
    '9876543211',
    TRUE
),

(
    'Market Manager',
    'market@kisanmitra.in',
    '$2b$12$P7x5d3zqDXy4h7lP7Lh5xQ8mMzAl8x9r0s1t2u3v4w5x6y7z8',
    '9876543212',
    TRUE
),

(
    'Logistics Manager',
    'logistics@kisanmitra.in',
    '$2b$12$Q6y6e4arEYz5i6mQ6Mg4wR9nNAbm9y0s1t2u3v4w5x6y7z8',
    '9876543213',
    TRUE
);

USE kisanmitra;

INSERT INTO farmers
(name, phone, farm_name, location, village, district, state, pincode, farm_size, farm_size_unit, status)
VALUES
('Ramesh Kumar', '9876501001', 'Green Harvest Farm', 'Guntur', 'Tenali', 'Guntur', 'Andhra Pradesh', '522201', 8.50, 'acres', 'active'),
('Suresh Reddy', '9876501002', 'Sri Lakshmi Farms', 'Vijayawada', 'Kankipadu', 'Krishna', 'Andhra Pradesh', '521151', 12.00, 'acres', 'active'),
('Anil Kumar', '9876501003', 'Fresh Valley Farm', 'Nellore', 'Kovur', 'Nellore', 'Andhra Pradesh', '524137', 6.75, 'acres', 'active'),
('Ravi Teja', '9876501004', 'Green Fields', 'Tirupati', 'Renigunta', 'Tirupati', 'Andhra Pradesh', '517520', 10.25, 'acres', 'active'),
('Prakash Rao', '9876501005', 'Sunrise Organics', 'Kurnool', 'Nandyal', 'Kurnool', 'Andhra Pradesh', '518501', 15.00, 'acres', 'active'),
('Venkatesh Rao', '9876501006', 'Nature Fresh Farm', 'Rajahmundry', 'Dowleswaram', 'East Godavari', 'Andhra Pradesh', '533125', 9.00, 'acres', 'active'),
('Mohan Das', '9876501007', 'Green Roots Farm', 'Visakhapatnam', 'Anakapalle', 'Visakhapatnam', 'Andhra Pradesh', '531001', 11.50, 'acres', 'active'),
('Kiran Kumar', '9876501008', 'Fresh Earth Farms', 'Chittoor', 'Madanapalle', 'Chittoor', 'Andhra Pradesh', '517325', 7.25, 'acres', 'active'),

('Arjun Singh', '9876501009', 'Golden Fields', 'Ludhiana', 'Khanna', 'Ludhiana', 'Punjab', '141401', 18.50, 'acres', 'active'),
('Harpreet Singh', '9876501010', 'Punjab Agro Farm', 'Amritsar', 'Ajnala', 'Amritsar', 'Punjab', '143102', 22.00, 'acres', 'active'),
('Manoj Sharma', '9876501011', 'Sharma Green Farm', 'Nashik', 'Sinnar', 'Nashik', 'Maharashtra', '422103', 14.75, 'acres', 'active'),
('Vijay Patil', '9876501012', 'Patil Agro Farms', 'Pune', 'Baramati', 'Pune', 'Maharashtra', '413102', 20.00, 'acres', 'active'),
('Santosh Yadav', '9876501013', 'Yadav Organic Farm', 'Nashik', 'Dindori', 'Nashik', 'Maharashtra', '422202', 9.50, 'acres', 'active'),
('Rohit Verma', '9876501014', 'Verma Fresh Farms', 'Indore', 'Sanwer', 'Indore', 'Madhya Pradesh', '453551', 16.25, 'acres', 'active'),
('Deepak Patel', '9876501015', 'Patel Agro Fields', 'Ahmedabad', 'Dholka', 'Ahmedabad', 'Gujarat', '382225', 13.00, 'acres', 'active'),
('Nitin Joshi', '9876501016', 'Green Gujarat Farm', 'Vadodara', 'Savli', 'Vadodara', 'Gujarat', '391770', 11.75, 'acres', 'active'),
('Rajendra Meena', '9876501017', 'Meena Farm House', 'Jaipur', 'Chomu', 'Jaipur', 'Rajasthan', '303702', 25.00, 'acres', 'active'),
('Ajay Kumar', '9876501018', 'Bihar Fresh Farms', 'Patna', 'Danapur', 'Patna', 'Bihar', '801503', 8.25, 'acres', 'active'),
('Sanjay Das', '9876501019', 'Eastern Harvest Farm', 'Kolkata', 'Barasat', 'North 24 Parganas', 'West Bengal', '700124', 10.50, 'acres', 'active'),
('Bikash Roy', '9876501020', 'Bengal Green Fields', 'Siliguri', 'Matigara', 'Darjeeling', 'West Bengal', '734010', 12.75, 'acres', 'inactive');

INSERT INTO orders
(sid, buyer_sid, total_amount, status, delivery_address, order_date)
VALUES
(4001,1,1240.00,'delivered','Pune, Maharashtra','2026-01-12 10:20:00'),
(4002,1,1384.00,'shipped','Pune, Maharashtra','2026-04-08 12:15:00'),
(4003,1,1490.00,'processing','Pune, Maharashtra','2026-08-03 13:25:00'),

(4004,2,1500.00,'delivered','Nashik, Maharashtra','2026-01-18 11:10:00'),
(4005,2,1650.00,'confirmed','Nashik, Maharashtra','2026-05-12 15:20:00'),
(4006,2,1820.00,'shipped','Nashik, Maharashtra','2026-08-18 16:00:00'),

(4007,3,1444.00,'delivered','Nagpur, Maharashtra','2026-02-03 10:30:00'),
(4008,3,1730.00,'delivered','Nagpur, Maharashtra','2026-05-21 13:10:00'),
(4009,3,1279.00,'confirmed','Nagpur, Maharashtra','2026-08-27 11:15:00'),

(4010,4,2000.00,'shipped','Mumbai, Maharashtra','2026-02-14 09:45:00'),
(4011,4,1244.00,'delivered','Mumbai, Maharashtra','2026-06-09 12:20:00'),
(4012,4,1535.00,'processing','Mumbai, Maharashtra','2026-08-30 14:00:00'),

(4013,5,1830.00,'delivered','Aurangabad, Maharashtra','2026-03-05 11:30:00'),
(4014,5,1354.00,'processing','Aurangabad, Maharashtra','2026-06-18 15:30:00'),
(4015,5,1660.00,'confirmed','Aurangabad, Maharashtra','2026-09-01 10:40:00'),

(4016,6,1848.00,'delivered','Kolhapur, Maharashtra','2026-03-17 09:40:00'),
(4017,6,2000.00,'shipped','Kolhapur, Maharashtra','2026-07-02 14:15:00'),
(4018,6,1416.00,'processing','Kolhapur, Maharashtra','2026-09-02 16:20:00'),

(4019,7,1685.00,'delivered','Satara, Maharashtra','2026-04-05 14:10:00'),
(4020,7,1700.00,'confirmed','Satara, Maharashtra','2026-07-16 11:50:00'),
(4021,7,1890.00,'shipped','Satara, Maharashtra','2026-09-03 09:25:00'),

(4022,8,1510.00,'processing','Solapur, Maharashtra','2026-04-22 10:05:00'),
(4023,8,2620.00,'delivered','Solapur, Maharashtra','2026-08-05 13:25:00'),
(4024,8,1414.00,'confirmed','Solapur, Maharashtra','2026-09-04 12:10:00'),

(4025,9,1288.00,'delivered','Pune, Maharashtra','2026-05-21 11:30:00'),
(4026,9,1630.00,'shipped','Pune, Maharashtra','2026-08-14 10:15:00'),
(4027,9,2080.00,'confirmed','Pune, Maharashtra','2026-09-05 09:45:00');

INSERT INTO order_items
(order_sid, product_sid, quantity, price_per_unit, subtotal)
VALUES
(4001,17,20,28.00,560.00),
(4001,18,15,24.00,360.00),
(4001,19,10,32.00,320.00),

(4002,25,5,120.00,600.00),
(4002,26,10,48.00,480.00),
(4002,31,8,38.00,304.00),

(4003,17,25,28.00,700.00),
(4003,24,6,65.00,390.00),
(4003,32,5,80.00,400.00),

(4004,18,30,24.00,720.00),
(4004,20,10,42.00,420.00),
(4004,21,12,30.00,360.00),

(4005,27,8,95.00,760.00),
(4005,28,10,70.00,700.00),
(4005,31,5,38.00,190.00),

(4006,19,25,32.00,800.00),
(4006,22,15,36.00,540.00),
(4006,25,4,120.00,480.00),

(4007,17,15,28.00,420.00),
(4007,19,20,32.00,640.00),
(4007,23,8,48.00,384.00),

(4008,26,20,48.00,960.00),
(4008,29,10,45.00,450.00),
(4008,32,4,80.00,320.00),

(4009,20,12,42.00,504.00),
(4009,21,15,30.00,450.00),
(4009,24,5,65.00,325.00),

(4010,25,6,120.00,720.00),
(4010,26,15,48.00,720.00),
(4010,28,8,70.00,560.00),

(4011,18,20,24.00,480.00),
(4011,19,12,32.00,384.00),
(4011,31,10,38.00,380.00),

(4012,27,7,95.00,665.00),
(4012,30,10,55.00,550.00),
(4012,32,4,80.00,320.00),

(4013,17,30,28.00,840.00),
(4013,20,15,42.00,630.00),
(4013,22,10,36.00,360.00),

(4014,25,4,120.00,480.00),
(4014,27,6,95.00,570.00),
(4014,31,8,38.00,304.00),

(4015,18,25,24.00,600.00),
(4015,24,8,65.00,520.00),
(4015,29,12,45.00,540.00),

(4016,19,30,32.00,960.00),
(4016,21,20,30.00,600.00),
(4016,23,6,48.00,288.00),

(4017,26,15,48.00,720.00),
(4017,28,12,70.00,840.00),
(4017,30,8,55.00,440.00),

(4018,17,18,28.00,504.00),
(4018,22,12,36.00,432.00),
(4018,32,6,80.00,480.00),

(4019,20,15,42.00,630.00),
(4019,24,7,65.00,455.00),
(4019,25,5,120.00,600.00),

(4020,18,35,24.00,840.00),
(4020,19,15,32.00,480.00),
(4020,31,10,38.00,380.00),

(4021,27,10,95.00,950.00),
(4021,29,12,45.00,540.00),
(4021,32,5,80.00,400.00),

(4022,17,25,28.00,700.00),
(4022,21,15,30.00,450.00),
(4022,22,10,36.00,360.00),

(4023,25,8,120.00,960.00),
(4023,26,20,48.00,960.00),
(4023,28,10,70.00,700.00),

(4024,19,20,32.00,640.00),
(4024,23,8,48.00,384.00),
(4024,24,6,65.00,390.00),

(4025,18,20,24.00,480.00),
(4025,20,12,42.00,504.00),
(4025,31,8,38.00,304.00),

(4026,27,6,95.00,570.00),
(4026,30,12,55.00,660.00),
(4026,32,5,80.00,400.00),

(4027,17,30,28.00,840.00),
(4027,19,20,32.00,640.00),
(4027,25,5,120.00,600.00);

ml
INSERT INTO profit_history
(crop, location, month, quantity_kg,
 traditional_price, direct_price, transport_cost,
 traditional_income, direct_income, benefit, benefit_percentage)
VALUES
('Tomato', 'Visakhapatnam', 'January', 500, 28, 31, 800, 14000, 14700, 700, 5.00),
('Tomato', 'Visakhapatnam', 'February', 500, 27, 30, 750, 13500, 14250, 750, 5.56),
('Tomato', 'Visakhapatnam', 'March', 500, 29, 32, 850, 14500, 15150, 650, 4.48),
('Tomato', 'Visakhapatnam', 'April', 500, 26, 31, 800, 13000, 14700, 1700, 13.08),
('Tomato', 'Visakhapatnam', 'May', 500, 30, 33, 850, 15000, 15650, 650, 4.33);