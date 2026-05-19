-- Fix style column: old ENUM only had 'realistic','anime','3d' but the frontend
-- uses parallax-3d, smooth-cinema, clay-motion, cel-animation, ken-burns, watercolor
ALTER TABLE generations MODIFY COLUMN style VARCHAR(50) NOT NULL;
