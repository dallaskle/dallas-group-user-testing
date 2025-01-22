create or replace function submit_validation(
  p_ticket_id uuid,
  p_feature_id uuid,
  p_tester_id uuid,
  p_status text,
  p_video_url text,
  p_notes text
) returns json
language plpgsql
security definer
as $$
declare
  v_validation_id uuid;
  v_current_validations int;
  v_ticket_record record;
begin
  -- Set the session user for audit logging
  PERFORM set_config('app.current_user_id', p_tester_id::text, true);

  -- Start transaction
  begin
    -- Insert validation
    insert into validations (
      feature_id,
      validated_by,
      status,
      video_url,
      notes
    ) values (
      p_feature_id,
      p_tester_id,
      p_status,
      p_video_url,
      p_notes
    ) returning id into v_validation_id;

    -- Update testing ticket with validation reference
    update testing_tickets
    set validation_id = v_validation_id
    where id = p_ticket_id;

    -- Update ticket status to resolved
    update tickets
    set status = 'resolved'
    where id = p_ticket_id
    returning * into v_ticket_record;

    -- Increment validation count
    update features
    set current_validations = current_validations + 1
    where id = p_feature_id;

    -- Update feature status using the dedicated function
    PERFORM update_feature_status(p_feature_id);

    -- Return success response
    return json_build_object(
      'success', true,
      'validation_id', v_validation_id,
      'ticket', v_ticket_record
    );
  exception
    when others then
      -- Rollback transaction on error
      raise exception 'Failed to submit validation: %', sqlerrm;
  end;
end;
$$;