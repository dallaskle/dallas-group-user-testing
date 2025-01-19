-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create feature_statuses table
CREATE TABLE feature_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('working', 'not_working')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create feature_comments table
CREATE TABLE feature_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_features_project_id ON features(project_id);
CREATE INDEX idx_feature_statuses_feature_id ON feature_statuses(feature_id);
CREATE INDEX idx_feature_statuses_user_id ON feature_statuses(user_id);
CREATE INDEX idx_feature_comments_feature_id ON feature_comments(feature_id);
CREATE INDEX idx_feature_comments_user_id ON feature_comments(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at
    BEFORE UPDATE ON features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_statuses_updated_at
    BEFORE UPDATE ON feature_statuses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_comments_updated_at
    BEFORE UPDATE ON feature_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Create a policy to allow authenticated users to upload videos
CREATE POLICY "Allow authenticated users to upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'videos'
    AND owner = auth.uid()
);

-- Create a policy to allow public access to view videos
CREATE POLICY "Allow public to view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Create a policy to allow video owners to delete their videos
CREATE POLICY "Allow owners to delete their videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND owner = auth.uid()); 