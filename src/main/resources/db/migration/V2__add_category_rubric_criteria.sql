-- =====================================================================
-- V2__add_category_rubric_criteria.sql
-- Adds rubric criteria collection table for AwardCategory scoring rubric
-- =====================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'category_rubric_criteria')
BEGIN
    CREATE TABLE category_rubric_criteria (
        category_id     BIGINT         NOT NULL,
        criterion_key   NVARCHAR(100)  NOT NULL,
        criterion_label NVARCHAR(150)  NOT NULL,
        weight          FLOAT          NOT NULL,
        CONSTRAINT fk_category_rubric_criteria_category
            FOREIGN KEY (category_id) REFERENCES award_categories(category_id) ON DELETE CASCADE
    );
END;

-- Pre-populate standard 5-criterion rubric for existing categories if any
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'category_rubric_criteria')
BEGIN
    INSERT INTO category_rubric_criteria (category_id, criterion_key, criterion_label, weight)
    SELECT c.category_id, 'innovation', 'Innovation', 30.0
    FROM award_categories c
    WHERE NOT EXISTS (SELECT 1 FROM category_rubric_criteria rc WHERE rc.category_id = c.category_id AND rc.criterion_key = 'innovation');

    INSERT INTO category_rubric_criteria (category_id, criterion_key, criterion_label, weight)
    SELECT c.category_id, 'impact', 'Impact & Relevance', 25.0
    FROM award_categories c
    WHERE NOT EXISTS (SELECT 1 FROM category_rubric_criteria rc WHERE rc.category_id = c.category_id AND rc.criterion_key = 'impact');

    INSERT INTO category_rubric_criteria (category_id, criterion_key, criterion_label, weight)
    SELECT c.category_id, 'feasibility', 'Feasibility', 20.0
    FROM award_categories c
    WHERE NOT EXISTS (SELECT 1 FROM category_rubric_criteria rc WHERE rc.category_id = c.category_id AND rc.criterion_key = 'feasibility');

    INSERT INTO category_rubric_criteria (category_id, criterion_key, criterion_label, weight)
    SELECT c.category_id, 'presentation', 'Presentation & Clarity', 15.0
    FROM award_categories c
    WHERE NOT EXISTS (SELECT 1 FROM category_rubric_criteria rc WHERE rc.category_id = c.category_id AND rc.criterion_key = 'presentation');

    INSERT INTO category_rubric_criteria (category_id, criterion_key, criterion_label, weight)
    SELECT c.category_id, 'ethics', 'Ethical & Societal Considerations', 10.0
    FROM award_categories c
    WHERE NOT EXISTS (SELECT 1 FROM category_rubric_criteria rc WHERE rc.category_id = c.category_id AND rc.criterion_key = 'ethics');
END;
