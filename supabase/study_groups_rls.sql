-- ============================================================
-- calah.ai / prime — Study Groups RLS Policies
-- Paste into Supabase SQL Editor and Run
-- ============================================================

-- Enable RLS on group_members (if not already enabled)
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Users can join groups (insert their own membership row)
CREATE POLICY "Users can join groups" ON group_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone authenticated can view group members
CREATE POLICY "Users can view group members" ON group_members
FOR SELECT USING (true);

-- Users can remove their own membership (leave a group)
CREATE POLICY "Users can leave groups" ON group_members
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Also run this if group_messages RLS is not yet enabled:
-- ============================================================

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read group messages" ON group_messages
FOR SELECT USING (true);

CREATE POLICY "Users can send group messages" ON group_messages
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Also run this if study_groups RLS is not yet enabled:
-- ============================================================

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public groups" ON study_groups
FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create groups" ON study_groups
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their groups" ON study_groups
FOR UPDATE USING (auth.uid() = creator_id);
