import { supabase } from '@/lib/supabase'

export const createActivityLog = async () => {
  // Create activity_log table
  const { error: createError } = await supabase.rpc('create_activity_log_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS activity_log (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('project_created', 'validation_submitted', 'ticket_created', 'feature_created')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        entity_id UUID NOT NULL,
        entity_type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Add indexes
      CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);
      CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_id, entity_type);
      CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

      -- Add RLS policies
      ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

      -- Allow read access to admin users
      CREATE POLICY "Allow read access to admin users"
      ON activity_log FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.is_admin = true
        )
      );

      -- Create function to automatically update updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger to automatically update updated_at
      CREATE TRIGGER update_activity_log_updated_at
        BEFORE UPDATE ON activity_log
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  })

  if (createError) {
    console.error('Error creating activity_log table:', createError)
    throw createError
  }

  // Create function to log activity
  const { error: functionError } = await supabase.rpc('create_log_activity_function', {
    sql: `
      CREATE OR REPLACE FUNCTION log_activity(
        activity_type TEXT,
        activity_title TEXT,
        activity_description TEXT,
        activity_entity_id UUID,
        activity_entity_type TEXT
      )
      RETURNS UUID
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        new_activity_id UUID;
      BEGIN
        INSERT INTO activity_log (
          type,
          title,
          description,
          entity_id,
          entity_type
        )
        VALUES (
          activity_type,
          activity_title,
          activity_description,
          activity_entity_id,
          activity_entity_type
        )
        RETURNING id INTO new_activity_id;

        RETURN new_activity_id;
      END;
      $$;
    `
  })

  if (functionError) {
    console.error('Error creating log_activity function:', functionError)
    throw functionError
  }

  // Create triggers for various events
  const { error: triggerError } = await supabase.rpc('create_activity_triggers', {
    sql: `
      -- Project creation trigger
      CREATE OR REPLACE FUNCTION log_project_creation()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM log_activity(
          'project_created',
          'New Project Created',
          'Project "' || NEW.name || '" was created',
          NEW.id,
          'project'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER log_project_creation_trigger
        AFTER INSERT ON projects
        FOR EACH ROW
        EXECUTE FUNCTION log_project_creation();

      -- Feature creation trigger
      CREATE OR REPLACE FUNCTION log_feature_creation()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM log_activity(
          'feature_created',
          'New Feature Added',
          'Feature "' || NEW.name || '" was added',
          NEW.id,
          'feature'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER log_feature_creation_trigger
        AFTER INSERT ON features
        FOR EACH ROW
        EXECUTE FUNCTION log_feature_creation();

      -- Validation submission trigger
      CREATE OR REPLACE FUNCTION log_validation_submission()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM log_activity(
          'validation_submitted',
          'Validation Submitted',
          'A new validation was submitted for feature ID ' || NEW.feature_id,
          NEW.id,
          'validation'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER log_validation_submission_trigger
        AFTER INSERT ON validations
        FOR EACH ROW
        EXECUTE FUNCTION log_validation_submission();

      -- Ticket creation trigger
      CREATE OR REPLACE FUNCTION log_ticket_creation()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM log_activity(
          'ticket_created',
          'New Ticket Created',
          'Ticket "' || NEW.title || '" was created',
          NEW.id,
          'ticket'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER log_ticket_creation_trigger
        AFTER INSERT ON tickets
        FOR EACH ROW
        EXECUTE FUNCTION log_ticket_creation();
    `
  })

  if (triggerError) {
    console.error('Error creating activity triggers:', triggerError)
    throw triggerError
  }
} 