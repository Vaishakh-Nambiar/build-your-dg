-- Add function to increment garden view count
-- This function safely increments the view count for a garden

CREATE OR REPLACE FUNCTION increment_garden_views(garden_id UUID)
RETURNS void AS $$
BEGIN
    -- Increment the view count for the specified garden
    UPDATE gardens 
    SET view_count = view_count + 1 
    WHERE id = garden_id AND is_public = true;
    
    -- Note: We only increment for public gardens
    -- Private gardens should not have their view count incremented
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_garden_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_garden_views(UUID) TO anon;