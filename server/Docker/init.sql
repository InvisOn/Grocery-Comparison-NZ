CREATE USER grocery_compare;

CREATE DATABASE grocery_compare_db_dev;
CREATE DATABASE grocery_compare_db_test;
CREATE DATABASE grocery_compare_db_prod;

GRANT ALL PRIVILEGES ON DATABASE grocery_compare_db_dev TO grocery_compare;
GRANT ALL PRIVILEGES ON DATABASE grocery_compare_db_test TO grocery_compare;
GRANT ALL PRIVILEGES ON DATABASE grocery_compare_db_prod TO grocery_compare;
