-- Add tokens_used column to generations table
ALTER TABLE generations 
ADD COLUMN tokens_used INTEGER;

-- Add comment to document the column
COMMENT ON COLUMN generations.tokens_used IS 'Number of tokens used by the AI model for this generation';

-- Create index for better performance on tokens queries
CREATE INDEX idx_generations_tokens_used ON generations(tokens_used);

-- Update existing generations to have a default token count (estimated)
UPDATE generations 
SET tokens_used = GREATEST(50, ROUND(LENGTH(prompt) / 4) + ROUND(LENGTH(COALESCE(output, '')) / 4))
WHERE tokens_used IS NULL;
