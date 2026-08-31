CREATE DATABASE prepforge;
USE prepforge;

SELECT COUNT(*) AS total_questions
FROM questions;
USE prepforge;

SELECT id, name, email
FROM users;
USE prepforge;

INSERT INTO questions
(question, option_a, option_b, option_c, option_d, correct_answer, category, created_by)
VALUES

-- =====================================================
-- APTITUDE - 12 NEW QUESTIONS
-- Existing: 3
-- New: 12
-- Total: 15
-- =====================================================

(
'If a number is increased by 20% and becomes 240, what was the original number?',
'180',
'200',
'220',
'210',
'200',
'Aptitude',
2
),

(
'A train travels 360 km in 4 hours. What is its average speed?',
'80 km/h',
'90 km/h',
'100 km/h',
'120 km/h',
'90 km/h',
'Aptitude',
2
),

(
'What is 25% of 480?',
'100',
'110',
'120',
'140',
'120',
'Aptitude',
2
),

(
'If 5 pens cost ₹75, what is the cost of 8 pens?',
'₹100',
'₹110',
'₹120',
'₹125',
'₹120',
'Aptitude',
2
),

(
'A shopkeeper buys an item for ₹500 and sells it for ₹600. What is the profit percentage?',
'10%',
'15%',
'20%',
'25%',
'20%',
'Aptitude',
2
),

(
'The average of 10, 20, 30, 40 and 50 is:',
'25',
'30',
'35',
'40',
'30',
'Aptitude',
2
),

(
'If 3 workers complete a task in 12 days, how many days will 6 workers take?',
'4 days',
'6 days',
'8 days',
'10 days',
'6 days',
'Aptitude',
2
),

(
'What is the simple interest on ₹5000 at 10% per annum for 2 years?',
'₹500',
'₹750',
'₹1000',
'₹1500',
'₹1000',
'Aptitude',
2
),

(
'A number is divided by 5 and the remainder is 3. Which of the following can be the number?',
'12',
'15',
'20',
'25',
'12',
'Aptitude',
2
),

(
'What is the ratio of 24 to 36 in simplest form?',
'1:2',
'2:3',
'3:4',
'4:5',
'2:3',
'Aptitude',
2
),

(
'If x + 15 = 40, what is x?',
'15',
'20',
'25',
'30',
'25',
'Aptitude',
2
),

(
'A car travels 60 km at 30 km/h. How much time does it take?',
'1 hour',
'2 hours',
'3 hours',
'4 hours',
'2 hours',
'Aptitude',
2
),


-- =====================================================
-- REASONING - 9 NEW QUESTIONS
-- Existing: 1
-- New: 9
-- Total: 10
-- =====================================================

(
'Find the next number: 3, 6, 12, 24, ?',
'36',
'42',
'48',
'54',
'48',
'Reasoning',
2
),

(
'If CAT is coded as DBU, how is DOG coded?',
'EPH',
'EOH',
'FPH',
'DPG',
'EPH',
'Reasoning',
2
),

(
'Find the odd one out.',
'Apple',
'Mango',
'Carrot',
'Banana',
'Carrot',
'Reasoning',
2
),

(
'If SOUTH is written as HTUOS, how is NORTH written?',
'HTRON',
'NHTRO',
'HTNOR',
'NORTH',
'HTRON',
'Reasoning',
2
),

(
'Complete the series: A, C, E, G, ?',
'H',
'I',
'J',
'K',
'I',
'Reasoning',
2
),

(
'If all roses are flowers and some flowers are red, which statement is definitely true?',
'All roses are red',
'All red things are roses',
'Roses are flowers',
'No roses are red',
'Roses are flowers',
'Reasoning',
2
),

(
'Which number is different from the others?',
'9',
'16',
'25',
'30',
'30',
'Reasoning',
2
),

(
'Find the next letter: B, E, H, K, ?',
'M',
'N',
'O',
'P',
'N',
'Reasoning',
2
),

(
'Ravi is taller than Arun. Arun is taller than Vijay. Who is the shortest?',
'Ravi',
'Arun',
'Vijay',
'Cannot determine',
'Vijay',
'Reasoning',
2
),


-- =====================================================
-- PROGRAMMING - 14 NEW QUESTIONS
-- Existing: 1
-- New: 14
-- Total: 15
-- =====================================================

(
'Which keyword is used to create a class in Java?',
'function',
'class',
'define',
'struct',
'class',
'Programming',
2
),

(
'Which data type is used to store true or false in Java?',
'int',
'boolean',
'String',
'float',
'boolean',
'Programming',
2
),

(
'Which symbol is used for a single-line comment in Java?',
'/*',
'//',
'#',
'--',
'//',
'Programming',
2
),

(
'Which method is the entry point of a Java program?',
'start()',
'run()',
'main()',
'execute()',
'main()',
'Programming',
2
),

(
'Which collection does not allow duplicate elements in Java?',
'ArrayList',
'LinkedList',
'HashSet',
'Vector',
'HashSet',
'Programming',
2
),

(
'What is the index of the first element in a Java array?',
'0',
'1',
'-1',
'2',
'0',
'Programming',
2
),

(
'Which keyword is used to inherit a class in Java?',
'implements',
'inherits',
'extends',
'super',
'extends',
'Programming',
2
),

(
'Which language is mainly used with React?',
'Python',
'Java',
'JavaScript',
'C',
'JavaScript',
'Programming',
2
),

(
'Which symbol is used to assign a value to a variable?',
'==',
'=',
'===',
'!=',
'=',
'Programming',
2
),

(
'What does HTML stand for?',
'Hyper Text Markup Language',
'High Text Machine Language',
'Hyper Transfer Markup Language',
'Home Tool Markup Language',
'Hyper Text Markup Language',
'Programming',
2
),

(
'Which HTTP method is commonly used to retrieve data from a server?',
'POST',
'PUT',
'GET',
'DELETE',
'GET',
'Programming',
2
),

(
'Which technology is used to create the structure of a web page?',
'CSS',
'HTML',
'JavaScript',
'SQL',
'HTML',
'Programming',
2
),

(
'Which technology is mainly used for styling web pages?',
'HTML',
'Python',
'CSS',
'Java',
'CSS',
'Programming',
2
),

(
'Which database language is used to query relational databases?',
'HTML',
'SQL',
'CSS',
'JSON',
'SQL',
'Programming',
2
),


-- =====================================================
-- VERBAL - 10 NEW QUESTIONS
-- Existing: 0
-- New: 10
-- Total: 10
-- =====================================================

(
'Choose the synonym of HAPPY.',
'Sad',
'Joyful',
'Angry',
'Tired',
'Joyful',
'Verbal',
2
),

(
'Choose the antonym of ANCIENT.',
'Old',
'Modern',
'Historic',
'Traditional',
'Modern',
'Verbal',
2
),

(
'Choose the correctly spelled word.',
'Succesful',
'Successful',
'Sucessful',
'Successfull',
'Successful',
'Verbal',
2
),

(
'Fill in the blank: She ___ to college every day.',
'go',
'going',
'goes',
'gone',
'goes',
'Verbal',
2
),

(
'Choose the synonym of BEGIN.',
'Start',
'End',
'Stop',
'Finish',
'Start',
'Verbal',
2
),

(
'Choose the antonym of DIFFICULT.',
'Hard',
'Complex',
'Easy',
'Tough',
'Easy',
'Verbal',
2
),

(
'Identify the noun in the sentence: The boy plays football.',
'plays',
'football',
'boy',
'the',
'boy',
'Verbal',
2
),

(
'Choose the correct sentence.',
'He go to school.',
'He goes to school.',
'He going to school.',
'He gone school.',
'He goes to school.',
'Verbal',
2
),

(
'What is the plural of CHILD?',
'Childs',
'Childes',
'Children',
'Childrens',
'Children',
'Verbal',
2
),

(
'Choose the synonym of BRAVE.',
'Coward',
'Fearful',
'Courageous',
'Weak',
'Courageous',
'Verbal',
2
);
USE prepforge;

SELECT category, COUNT(*) AS total
FROM questions
GROUP BY category;
USE prepforge;

CREATE TABLE IF NOT EXISTS quiz_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    incorrect_answers INT NOT NULL,
    score INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
USE prepforge;

SELECT * FROM quiz_history;